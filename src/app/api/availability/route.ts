import type { ZodIssue } from 'zod';
import { sql } from 'drizzle-orm';
import configPromise, { payloadDrizzle } from '@payload-config';
import { bookingHold } from '@/lib/redis';
import { bookingAvailabilityQuerySchema } from '@/lib/schemas/booking';
import { getPayload } from 'payload';

const buildValidationErrorResponse = (issues: ZodIssue[]): Response => {
  return Response.json(
    {
      message: 'Invalid request',
      errors: issues.map((issue) => ({
        path: issue.path.join('.') || 'root',
        message: issue.message,
      })),
    },
    { status: 400 },
  );
};

type RawService = Record<string, unknown> & {
  isActive?: boolean | null;
  leadTimeHours?: number | null;
};

const ensureServiceIsBookable = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  serviceId: string,
) => {
  try {
    const service = (await payload.findByID({
      collection: 'services',
      id: serviceId,
      depth: 0,
    })) as unknown as RawService | null;

    if (!service || typeof service !== 'object') {
      return { service: null, errors: ['SERVICE_NOT_FOUND'] as const };
    }

    if (service.isActive === false) {
      return { service, errors: ['SERVICE_INACTIVE'] as const };
    }

    return { service, errors: [] as const };
  } catch (error) {
    const notFound =
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      (error as { status?: number }).status === 404;

    if (notFound) {
      return { service: null, errors: ['SERVICE_NOT_FOUND'] as const };
    }

    throw error;
  }
};

export const dynamic = 'force-dynamic';

export const GET = async (request: Request): Promise<Response> => {
  const rawParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = bookingAvailabilityQuerySchema.safeParse(rawParams);

  if (!parsed.success) {
    return buildValidationErrorResponse(parsed.error.issues);
  }

  const { serviceId, slot } = parsed.data;
  const slotDate = new Date(slot);

  if (Number.isNaN(slotDate.getTime())) {
    return Response.json(
      {
        message: 'Invalid request',
        errors: [{ path: 'slot', message: 'slot must be a valid date' }],
      },
      { status: 400 },
    );
  }

  const normalizedSlot = slotDate.toISOString();

  const payload = await getPayload({
    config: configPromise,
  });

  const { service, errors: serviceErrors } = await ensureServiceIsBookable(payload, serviceId);

  if (!service) {
    return Response.json(
      {
        serviceId,
        slot: normalizedSlot,
        available: false,
        reasons: serviceErrors.length > 0 ? serviceErrors : ['SERVICE_NOT_FOUND'],
        hold: null,
      },
      { status: 404 },
    );
  }

  const reasons: string[] = [...serviceErrors];
  const now = new Date();

  if (slotDate.getTime() < now.getTime()) {
    reasons.push('PAST_SLOT');
  }

  const leadTimeHours = typeof service.leadTimeHours === 'number' ? service.leadTimeHours : null;
  if (leadTimeHours && leadTimeHours > 0) {
    const minStart = new Date(now.getTime() + leadTimeHours * 60 * 60 * 1000);
    if (slotDate.getTime() < minStart.getTime()) {
      reasons.push('LEAD_TIME_NOT_MET');
    }
  }

  let existingAppointment = false;
  try {
    const existing = await payloadDrizzle.execute(
      sql`select 1 from "appointments" where "service" = ${serviceId} and ("schedule"->>'start') = ${normalizedSlot} limit 1`,
    );

    existingAppointment = Array.isArray(existing?.rows) && existing.rows.length > 0;
  } catch (error) {
    payload.logger.error?.('Failed to check existing appointments', error);
  }

  if (existingAppointment) {
    reasons.push('ALREADY_BOOKED');
  }

  let hold = null;
  try {
    hold = await bookingHold.get({ serviceId, slot: normalizedSlot });
  } catch (error) {
    payload.logger.error?.('Failed to read booking hold', error);
  }

  if (hold && hold.ttlSeconds > 0) {
    reasons.push('ON_HOLD');
  }

  return Response.json({
    serviceId,
    slot: normalizedSlot,
    available: reasons.length === 0,
    reasons,
    hold,
  });
};
