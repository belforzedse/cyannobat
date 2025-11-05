import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';

import { authenticateStaffRequest, unauthorizedResponse } from '@/lib/api/auth';

export const dynamic = 'force-dynamic';

type MediaLike = {
  id?: string | number;
  filename?: string | null;
  url?: string | null;
  mimeType?: string | null;
  createdAt?: string | null;
  description?: string | null;
};

const mapMedia = (raw: unknown) => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const media = raw as MediaLike;
  const id = media.id ? String(media.id) : randomUUID();

  return {
    id,
    filename: media.filename ?? 'فایل بدون نام',
    url: media.url ?? '#',
    mimeType: media.mimeType ?? null,
    uploadedAt: media.createdAt ?? null,
    description: media.description ?? null,
  };
};

export const GET = async (request: Request) => {
  const { payload, user } = await authenticateStaffRequest(request);
  if (!user) return unauthorizedResponse();

  const url = new URL(request.url);
  const patientId = url.searchParams.get('patientId');
  const appointmentId = url.searchParams.get('appointmentId');

  const documentsMap = new Map<string, ReturnType<typeof mapMedia>>();

  if (patientId) {
    const patient = await payload.findByID({
      collection: 'patients',
      id: patientId,
      depth: 2,
    });

    const folders = Array.isArray((patient as Record<string, unknown>).patientFolders)
      ? ((patient as Record<string, unknown>).patientFolders as unknown[])
      : [];

    for (const folder of folders) {
      if (!folder || typeof folder !== 'object') continue;
      const docs = Array.isArray((folder as Record<string, unknown>).documents)
        ? ((folder as Record<string, unknown>).documents as unknown[])
        : [];
      for (const doc of docs) {
        const mapped = mapMedia(doc);
        if (mapped) {
          documentsMap.set(mapped.id, mapped);
        }
      }
    }
  }

  if (appointmentId) {
    try {
      const appointment = await payload.findByID({
        collection: 'appointments',
        id: appointmentId,
        depth: 2,
      });

      const docs = Array.isArray((appointment as Record<string, unknown>).clinicalDocuments)
        ? ((appointment as Record<string, unknown>).clinicalDocuments as unknown[])
        : [];

      for (const doc of docs) {
        const mapped = mapMedia(doc);
        if (mapped) {
          documentsMap.set(mapped.id, mapped);
        }
      }
    } catch (error) {
      payload.logger.warn?.('Failed to load appointment documents for preview', error);
    }
  }

  const documents = Array.from(documentsMap.values());
  return NextResponse.json({ documents });
};
