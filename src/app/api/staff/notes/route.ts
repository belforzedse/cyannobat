import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { authenticateStaffRequest, unauthorizedResponse } from '@/lib/api/auth';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  content: z.string().min(1),
  patientId: z.string().min(1).nullable().optional(),
  appointmentId: z.string().min(1).nullable().optional(),
});

const extractRelationId = (relation: unknown): string | null => {
  if (!relation) return null;
  if (typeof relation === 'string') return relation;
  if (typeof relation === 'number') return String(relation);
  if (typeof relation === 'object' && 'id' in (relation as Record<string, unknown>)) {
    const { id } = relation as { id?: unknown };
    if (typeof id === 'string') return id;
    if (typeof id === 'number') return String(id);
  }
  return null;
};

const mapNote = (raw: unknown) => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const id = typeof record.id === 'string' ? record.id : String(record.id ?? randomUUID());
  const noteContent = typeof record.note === 'string' ? record.note : '';
  const createdAt =
    typeof record.createdAt === 'string'
      ? record.createdAt
      : typeof record.createdAt === 'number'
        ? new Date(record.createdAt).toISOString()
        : new Date().toISOString();
  const appointmentId =
    typeof record.appointment === 'string'
      ? record.appointment
      : typeof record.appointment === 'number'
        ? String(record.appointment)
        : null;
  const author =
    typeof record.author === 'object' && record.author !== null
      ? ((record.author as Record<string, unknown>).name as string | undefined) ?? null
      : null;

  return {
    id,
    content: noteContent,
    createdAt,
    appointmentId,
    authorName: author,
  };
};

export const GET = async (request: Request) => {
  const { payload, user } = await authenticateStaffRequest(request);
  if (!user) return unauthorizedResponse();

  const url = new URL(request.url);
  const patientId = url.searchParams.get('patientId');

  if (!patientId) {
    return NextResponse.json({ notes: [] });
  }

  const patient = await payload.findByID({
    collection: 'patients',
    id: patientId,
    depth: 2,
  });

  const notes = Array.isArray((patient as Record<string, unknown>).visitNotes)
    ? ((patient as Record<string, unknown>).visitNotes as unknown[])
        .map(mapNote)
        .filter((note): note is NonNullable<ReturnType<typeof mapNote>> => Boolean(note))
    : [];

  return NextResponse.json({ notes });
};

export const POST = async (request: Request) => {
  const { payload, user } = await authenticateStaffRequest(request);
  if (!user) return unauthorizedResponse();

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: 'Invalid request',
        errors: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const { patientId, appointmentId, content } = parsed.data;

  const targetPatientId = patientId ?? null;
  let resolvedPatientId = targetPatientId;

  if (!resolvedPatientId && appointmentId) {
    try {
      const appointment = await payload.findByID({
        collection: 'appointments',
        id: appointmentId,
        depth: 0,
      });
      const folderRelation = appointment?.patientFolder;
      const relationId = extractRelationId(folderRelation);
      if (relationId) {
        resolvedPatientId = relationId;
      }
    } catch (error) {
      payload.logger.warn?.('Unable to resolve patient from appointment for note creation', error);
    }
  }

  if (!resolvedPatientId) {
    return NextResponse.json({ message: 'Patient folder is required' }, { status: 400 });
  }

  const patient = await payload.findByID({
    collection: 'patients',
    id: resolvedPatientId,
    depth: 0,
  });

  const existingNotes = Array.isArray((patient as Record<string, unknown>).visitNotes)
    ? ((patient as Record<string, unknown>).visitNotes as unknown[])
    : [];

  const createdAt = new Date().toISOString();

  const updated = await payload.update({
    collection: 'patients',
    id: resolvedPatientId,
    data: {
      visitNotes: [
        ...existingNotes,
        {
          note: content,
          appointment: appointmentId ?? null,
          createdAt,
          author: user.id,
          isPrivate: true,
        },
      ],
    },
  });

  const notes = Array.isArray((updated as Record<string, unknown>).visitNotes)
    ? ((updated as Record<string, unknown>).visitNotes as unknown[])
        .map(mapNote)
        .filter((note): note is NonNullable<ReturnType<typeof mapNote>> => Boolean(note))
    : [];

  return NextResponse.json({ notes });
};
