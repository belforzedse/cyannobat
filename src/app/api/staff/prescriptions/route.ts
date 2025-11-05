import { NextResponse } from 'next/server';
import { z } from 'zod';

import { authenticateStaffRequest, unauthorizedResponse } from '@/lib/api/auth';

export const dynamic = 'force-dynamic';

const schema = z.object({
  medication: z.string().min(1),
  dosage: z.string().optional().nullable(),
  frequency: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  patientId: z.string().min(1).optional().nullable(),
  appointmentId: z.string().min(1).optional().nullable(),
});

export const POST = async (request: Request) => {
  const { payload, user } = await authenticateStaffRequest(request);
  if (!user) return unauthorizedResponse();

  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: 'Invalid request',
        errors: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const { patientId, appointmentId, medication, dosage, frequency, duration, notes } = parsed.data;

  let resolvedPatientId = patientId ?? null;
  let appointmentDoc: Record<string, unknown> | null = null;

  if (appointmentId) {
    try {
      appointmentDoc = (await payload.findByID({
        collection: 'appointments',
        id: appointmentId,
        depth: 0,
      })) as Record<string, unknown>;
    } catch (error) {
      payload.logger.warn?.('Failed to load appointment for prescription creation', error);
    }

    if (!resolvedPatientId && appointmentDoc) {
      const folder = appointmentDoc.patientFolder;
      if (folder && typeof folder === 'object' && 'id' in folder) {
        resolvedPatientId = String((folder as { id: unknown }).id ?? '');
      }
    }
  }

  if (!resolvedPatientId) {
    return NextResponse.json({ message: 'Patient folder is required' }, { status: 400 });
  }

  const issuedAt = new Date().toISOString();

  const prescription = {
    medication,
    dosage: dosage ?? '',
    frequency: frequency ?? '',
    duration: duration ?? '',
    notes: notes ?? '',
    document: null,
  };

  if (appointmentDoc) {
    const existing = Array.isArray(appointmentDoc.prescriptions)
      ? (appointmentDoc.prescriptions as unknown[])
      : [];

    await payload.update({
      collection: 'appointments',
      id: appointmentId!,
      data: {
        prescriptions: [
          ...existing,
          {
            ...prescription,
          },
        ],
        treatmentPlan: appointmentDoc.treatmentPlan ?? null,
      },
    });
  }

  const patientDoc = (await payload.findByID({
    collection: 'patients',
    id: resolvedPatientId,
    depth: 0,
  })) as Record<string, unknown>;

  const patientPrescriptions = Array.isArray(patientDoc.prescriptions)
    ? (patientDoc.prescriptions as unknown[])
    : [];

  const updatedPatient = await payload.update({
    collection: 'patients',
    id: resolvedPatientId,
    data: {
      prescriptions: [
        ...patientPrescriptions,
        {
          medication,
          dosage,
          instructions: notes ?? '',
          issuedAt,
          prescribedBy: appointmentDoc?.provider ?? user.id,
          status: 'active',
          refills: 0,
        },
      ],
    },
  });

  return NextResponse.json({
    prescription: {
      medication,
      dosage,
      frequency,
      duration,
      notes,
      issuedAt,
      patientId: resolvedPatientId,
      appointmentId: appointmentId ?? null,
      patientSummary: updatedPatient,
    },
  });
};
