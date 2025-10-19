import Redis from 'ioredis'

type BookingHoldKey = {
  serviceId: string
  slot: string
}

type BookingHoldDetails = {
  providerId?: string
  customerId?: string
  appointmentId?: string
  metadata?: Record<string, unknown>
}

type CreateBookingHoldParams = BookingHoldKey & {
  ttlSeconds: number
  details?: BookingHoldDetails
}

type ExtendBookingHoldParams = BookingHoldKey & {
  ttlSeconds: number
}

type BookingHoldRecord = BookingHoldDetails & {
  createdAt: string
}

type BookingHold = BookingHoldRecord & BookingHoldKey & {
  ttlSeconds: number
}

type HoldStoreValue = {
  record: BookingHoldRecord
}

const BOOKING_HOLD_PREFIX = 'booking:hold'

const buildHoldKey = ({ serviceId, slot }: BookingHoldKey) => {
  return `${BOOKING_HOLD_PREFIX}:${serviceId}:${slot}`
}

const parseHoldStoreValue = (value: string): HoldStoreValue | null => {
  try {
    const parsed = JSON.parse(value) as HoldStoreValue
    if (!parsed || typeof parsed !== 'object' || !('record' in parsed)) {
      return null
    }

    const record = (parsed as { record?: unknown }).record
    if (!record || typeof record !== 'object') {
      return null
    }

    const createdAt = (record as { createdAt?: unknown }).createdAt
    if (typeof createdAt !== 'string') {
      return null
    }

    return {
      record: {
        ...record,
        createdAt,
      } as BookingHoldRecord,
    }
  } catch {
    return null
  }
}

class BookingHoldStoreError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message)
    this.name = 'BookingHoldStoreError'
    if (options?.cause !== undefined) {
      ;(this as { cause?: unknown }).cause = options.cause
    }
  }
}

class BookingHoldConflictError extends BookingHoldStoreError {
  hold: BookingHold | null

  constructor(message: string, options: { hold?: BookingHold | null; cause?: unknown } = {}) {
    super(message, { cause: options.cause })
    this.name = 'BookingHoldConflictError'
    this.hold = options.hold ?? null
  }
}

type RedisClient = Redis

const createRedisClient = (): RedisClient => {
  const redisUrl = process.env.REDIS_URL
  const enableTls = String(process.env.REDIS_TLS ?? '').toLowerCase() === 'true'

  if (redisUrl) {
    return new Redis(redisUrl, {
      lazyConnect: false,
      tls: enableTls ? {} : undefined,
    })
  }

  const host = process.env.REDIS_HOST ?? '127.0.0.1'
  const port = Number.parseInt(process.env.REDIS_PORT ?? '', 10)
  const username = process.env.REDIS_USERNAME
  const password = process.env.REDIS_PASSWORD
  const db = Number.parseInt(process.env.REDIS_DB ?? '', 10)

  return new Redis({
    host,
    port: Number.isNaN(port) ? 6379 : port,
    username: username && username.length > 0 ? username : undefined,
    password: password && password.length > 0 ? password : undefined,
    db: Number.isNaN(db) ? undefined : db,
    lazyConnect: false,
    tls: enableTls ? {} : undefined,
  })
}

declare global {
  var __bookingRedisClient: RedisClient | undefined
  var __bookingRedisShutdownRegistered: boolean | undefined
}

const redis: RedisClient = globalThis.__bookingRedisClient ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__bookingRedisClient = redis
}

const registerRedisShutdownHook = (client: RedisClient) => {
  if (typeof process === 'undefined' || typeof process.once !== 'function') {
    return
  }

  if (globalThis.__bookingRedisShutdownRegistered) {
    return
  }

  let closing = false
  const closeClient = () => {
    if (closing) return
    closing = true

    Promise.resolve()
      .then(() => client.quit())
      .catch((error) => {
        console.error('Failed to close Redis client gracefully', error)
      })
  }

  process.once('SIGINT', closeClient)
  process.once('SIGTERM', closeClient)
  process.once('beforeExit', closeClient)
  process.once('exit', closeClient)

  globalThis.__bookingRedisShutdownRegistered = true
}

registerRedisShutdownHook(redis)

if (typeof redis.listenerCount === 'function' && redis.listenerCount('error') === 0) {
  redis.on('error', (error) => {
    console.error('Redis connection error', error)
  })
}

const bookingHold = {
  key: buildHoldKey,
  async create({ serviceId, slot, ttlSeconds, details }: CreateBookingHoldParams): Promise<BookingHold> {
    if (ttlSeconds <= 0) {
      throw new Error('Booking hold TTL must be greater than zero seconds')
    }

    const key = buildHoldKey({ serviceId, slot })
    const record: BookingHoldRecord = {
      ...(details ?? {}),
      createdAt: new Date().toISOString(),
    }

    try {
      const result = await redis.set(key, JSON.stringify({ record }), 'NX', 'PX', ttlSeconds * 1000)

      if (result !== 'OK') {
        const existingHold = await bookingHold.get({ serviceId, slot })
        throw new BookingHoldConflictError('Booking hold already exists for slot', {
          hold: existingHold,
        })
      }

      return { serviceId, slot, ttlSeconds, ...record }
    } catch (error) {
      if (error instanceof BookingHoldConflictError) {
        throw error
      }

      throw new BookingHoldStoreError('Failed to create booking hold', { cause: error })
    }
  },
  async get({ serviceId, slot }: BookingHoldKey): Promise<BookingHold | null> {
    const key = buildHoldKey({ serviceId, slot })

    try {
      const results = await redis.multi().get(key).pttl(key).exec()

      if (!results) {
        throw new Error('Failed to execute Redis pipeline')
      }

      const [[, value], [, ttlMs]] = results as [[null, string | null], [null, number]]

      if (value === null) {
        return null
      }

      const stored = parseHoldStoreValue(value)
      if (!stored) {
        await redis.del(key)
        return null
      }

      const ttlMilliseconds = typeof ttlMs === 'number' ? ttlMs : 0
      const safeTtl = ttlMilliseconds > 0 ? Math.ceil(ttlMilliseconds / 1000) : 0

      return {
        serviceId,
        slot,
        ttlSeconds: safeTtl,
        ...stored.record,
      }
    } catch (error) {
      throw new BookingHoldStoreError('Failed to read booking hold', { cause: error })
    }
  },
  async release({ serviceId, slot }: BookingHoldKey): Promise<boolean> {
    const key = buildHoldKey({ serviceId, slot })

    try {
      const result = await redis.del(key)
      return result > 0
    } catch (error) {
      throw new BookingHoldStoreError('Failed to release booking hold', { cause: error })
    }
  },
  async extend({ serviceId, slot, ttlSeconds }: ExtendBookingHoldParams): Promise<boolean> {
    if (ttlSeconds <= 0) {
      throw new Error('Booking hold TTL must be greater than zero seconds')
    }

    const key = buildHoldKey({ serviceId, slot })

    try {
      const ttlMilliseconds = ttlSeconds * 1000
      const result = await redis.eval(
        `
        if redis.call('EXISTS', KEYS[1]) == 1 then
          return redis.call('PEXPIRE', KEYS[1], ARGV[1])
        end
        return 0
      `,
        1,
        key,
        ttlMilliseconds,
      )

      if (typeof result === 'number') {
        return result === 1
      }

      if (typeof result === 'string') {
        return Number.parseInt(result, 10) === 1
      }

      return false
    } catch (error) {
      throw new BookingHoldStoreError('Failed to extend booking hold', { cause: error })
    }
  },
  async exists({ serviceId, slot }: BookingHoldKey): Promise<boolean> {
    const key = buildHoldKey({ serviceId, slot })

    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      throw new BookingHoldStoreError('Failed to check booking hold existence', { cause: error })
    }
  },
}

export type {
  BookingHold,
  BookingHoldDetails,
  BookingHoldKey,
  CreateBookingHoldParams,
  ExtendBookingHoldParams,
}

export { bookingHold, redis, BookingHoldConflictError, BookingHoldStoreError }

export default redis
