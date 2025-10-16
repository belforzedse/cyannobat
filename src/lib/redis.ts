import Redis, { type RedisOptions } from 'ioredis'

type GlobalRedis = typeof globalThis & {
  __cyannobatRedis?: Redis
  __cyannobatRedisCleanupRegistered?: boolean
}

const globalForRedis = globalThis as GlobalRedis

const parseBoolean = (value: string | undefined): boolean => {
  if (!value) return false
  const normalized = value.trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes'
}

const buildRedisClient = (): Redis => {
  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is required to initialize Redis')
  }

  const shouldUseTLS = parseBoolean(process.env.REDIS_TLS)

  const options: RedisOptions = {
    maxRetriesPerRequest: null,
  }

  if (shouldUseTLS) {
    options.tls = {}
  }

  return new Redis(redisUrl, options)
}

const redis = globalForRedis.__cyannobatRedis ?? buildRedisClient()

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.__cyannobatRedis = redis
}

if (!globalForRedis.__cyannobatRedisCleanupRegistered) {
  let shuttingDown = false
  const cleanup = async () => {
    if (shuttingDown) return
    shuttingDown = true

    try {
      await redis.quit()
    } catch {
      redis.disconnect()
    }
  }

  const handleCleanup = () => {
    void cleanup()
  }

  ;(['SIGINT', 'SIGTERM'] as const).forEach((signal) => {
    process.once(signal, handleCleanup)
  })
  process.once('beforeExit', handleCleanup)

  globalForRedis.__cyannobatRedisCleanupRegistered = true
}

const BOOKING_HOLD_PREFIX = 'booking:hold'

export interface BookingHoldKey {
  serviceId: string
  slot: string
}

export interface BookingHoldDetails {
  providerId?: string
  customerId?: string
  appointmentId?: string
  metadata?: Record<string, unknown>
}

export interface BookingHoldRecord extends BookingHoldDetails {
  createdAt: string
}

export interface BookingHold extends BookingHoldRecord, BookingHoldKey {
  ttlSeconds: number
}

export interface CreateBookingHoldParams extends BookingHoldKey {
  ttlSeconds: number
  details?: BookingHoldDetails
}

export interface ExtendBookingHoldParams extends BookingHoldKey {
  ttlSeconds: number
}

const buildHoldKey = ({ serviceId, slot }: BookingHoldKey): string => {
  return `${BOOKING_HOLD_PREFIX}:${serviceId}:${slot}`
}

const serializeHold = (record: BookingHoldRecord): string => {
  return JSON.stringify(record)
}

const deserializeHold = (value: string): BookingHoldRecord => {
  const parsed = JSON.parse(value) as BookingHoldRecord
  return parsed
}

const toBookingHold = (
  key: BookingHoldKey,
  record: BookingHoldRecord,
  ttlSeconds: number,
): BookingHold => {
  return {
    ...key,
    ...record,
    ttlSeconds: Math.max(ttlSeconds, 0),
  }
}

const bookingHold = {
  key: buildHoldKey,
  async create({ serviceId, slot, ttlSeconds, details }: CreateBookingHoldParams): Promise<BookingHold> {
    if (ttlSeconds <= 0) {
      throw new Error('Booking hold TTL must be greater than zero seconds')
    }

    const key = { serviceId, slot }
    const record: BookingHoldRecord = {
      ...(details ?? {}),
      createdAt: new Date().toISOString(),
    }

    await redis.set(buildHoldKey(key), serializeHold(record), 'EX', ttlSeconds)

    return toBookingHold(key, record, ttlSeconds)
  },
  async get({ serviceId, slot }: BookingHoldKey): Promise<BookingHold | null> {
    const key = buildHoldKey({ serviceId, slot })
    const results = await redis
      .multi()
      .get(key)
      .ttl(key)
      .exec()

    if (!results) return null

    const [[getError, value], [ttlError, ttl]] = results

    if (getError) throw getError
    if (ttlError) throw ttlError
    if (value === null || typeof value !== 'string') return null
    if (typeof ttl !== 'number' || ttl < -1) return null

    const record = deserializeHold(value)
    const ttlSeconds = ttl < 0 ? 0 : ttl

    return toBookingHold({ serviceId, slot }, record, ttlSeconds)
  },
  async release({ serviceId, slot }: BookingHoldKey): Promise<boolean> {
    const removed = await redis.del(buildHoldKey({ serviceId, slot }))
    return removed > 0
  },
  async extend({ serviceId, slot, ttlSeconds }: ExtendBookingHoldParams): Promise<boolean> {
    if (ttlSeconds <= 0) {
      throw new Error('Booking hold TTL must be greater than zero seconds')
    }

    const updated = await redis.expire(buildHoldKey({ serviceId, slot }), ttlSeconds)
    return updated === 1
  },
  async exists({ serviceId, slot }: BookingHoldKey): Promise<boolean> {
    const count = await redis.exists(buildHoldKey({ serviceId, slot }))
    return count === 1
  },
}

export { redis, bookingHold }

export default redis
