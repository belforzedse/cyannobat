/**
 * حافظه موقت برای شبیه‌سازی Redis در محیط توسعه.
 * در آینده می‌توان این بخش را با اتصال واقعی به Redis جایگزین کرد.
 */

type BookingHoldKey = {
  serviceId: string;
  slot: string;
};

type BookingHoldDetails = {
  providerId?: string;
  customerId?: string;
  appointmentId?: string;
  metadata?: Record<string, unknown>;
};

type CreateBookingHoldParams = BookingHoldKey & {
  ttlSeconds: number;
  details?: BookingHoldDetails;
};

type ExtendBookingHoldParams = BookingHoldKey & {
  ttlSeconds: number;
};

type BookingHoldRecord = BookingHoldDetails & {
  createdAt: string;
};

type BookingHold = BookingHoldRecord & BookingHoldKey & {
  ttlSeconds: number;
};

type HoldStoreValue = {
  record: BookingHoldRecord;
  expiresAt: number;
};

const BOOKING_HOLD_PREFIX = 'booking:hold';
const holdStore = new Map<string, HoldStoreValue>();

const now = () => Date.now();

const buildHoldKey = ({ serviceId, slot }: BookingHoldKey) => {
  return `${BOOKING_HOLD_PREFIX}:${serviceId}:${slot}`;
};

const cleanupExpired = () => {
  const current = now();
  for (const [key, value] of holdStore.entries()) {
    if (value.expiresAt <= current) {
      holdStore.delete(key);
    }
  }
};

const bookingHold = {
  key: buildHoldKey,
  async create({ serviceId, slot, ttlSeconds, details }: CreateBookingHoldParams): Promise<BookingHold> {
    if (ttlSeconds <= 0) {
      throw new Error('Booking hold TTL must be greater than zero seconds');
    }

    cleanupExpired();

    const key = buildHoldKey({ serviceId, slot });
    const record: BookingHoldRecord = {
      ...(details ?? {}),
      createdAt: new Date().toISOString(),
    };

    holdStore.set(key, {
      record,
      expiresAt: now() + ttlSeconds * 1000,
    });

    return { serviceId, slot, ttlSeconds, ...record };
  },
  async get({ serviceId, slot }: BookingHoldKey): Promise<BookingHold | null> {
    cleanupExpired();
    const key = buildHoldKey({ serviceId, slot });
    const value = holdStore.get(key);
    if (!value) return null;

    const ttlMilliseconds = Math.max(value.expiresAt - now(), 0);
    return {
      serviceId,
      slot,
      ttlSeconds: Math.round(ttlMilliseconds / 1000),
      ...value.record,
    };
  },
  async release({ serviceId, slot }: BookingHoldKey): Promise<boolean> {
    const key = buildHoldKey({ serviceId, slot });
    return holdStore.delete(key);
  },
  async extend({ serviceId, slot, ttlSeconds }: ExtendBookingHoldParams): Promise<boolean> {
    if (ttlSeconds <= 0) {
      throw new Error('Booking hold TTL must be greater than zero seconds');
    }

    cleanupExpired();
    const key = buildHoldKey({ serviceId, slot });
    const value = holdStore.get(key);
    if (!value) return false;

    value.expiresAt = now() + ttlSeconds * 1000;
    return true;
  },
  async exists({ serviceId, slot }: BookingHoldKey): Promise<boolean> {
    cleanupExpired();
    const key = buildHoldKey({ serviceId, slot });
    return holdStore.has(key);
  },
};

const redis = {
  status: 'stub',
  async quit() {
    holdStore.clear();
  },
};

export type {
  BookingHold,
  BookingHoldDetails,
  BookingHoldKey,
  CreateBookingHoldParams,
  ExtendBookingHoldParams,
};

export { bookingHold, redis };

export default redis;
