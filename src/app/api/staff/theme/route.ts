import { NextResponse } from 'next/server';
import { z } from 'zod';

import { authenticateStaffRequest, unauthorizedResponse } from '@/lib/api/auth';

export const dynamic = 'force-dynamic';

const preferencesSchema = z.object({
  patientId: z.string().min(1).optional().nullable(),
  preferences: z
    .object({
      colorScheme: z.enum(['system', 'light', 'dark', 'high-contrast']).default('system'),
      accentColor: z.string().optional().nullable(),
      density: z.enum(['compact', 'comfortable', 'spacious']).default('comfortable'),
    })
    .optional(),
});

export const GET = async (request: Request) => {
  const { payload, user } = await authenticateStaffRequest(request);
  if (!user) return unauthorizedResponse();

  const url = new URL(request.url);
  const patientId = url.searchParams.get('patientId');

  if (!patientId) {
    return NextResponse.json({ preferences: null });
  }

  const patient = await payload.findByID({
    collection: 'patients',
    id: patientId,
    depth: 0,
  });

  const prefs = (patient as Record<string, unknown>).themePreferences as Record<string, unknown> | undefined;
  const response = prefs
    ? {
        colorScheme: (prefs.colorScheme as string) ?? 'system',
        accentColor: (prefs.accentColor as string | undefined) ?? null,
        density: (prefs.density as string) ?? 'comfortable',
      }
    : null;

  return NextResponse.json({ preferences: response });
};

export const PUT = async (request: Request) => {
  const { payload, user } = await authenticateStaffRequest(request);
  if (!user) return unauthorizedResponse();

  const json = await request.json().catch(() => null);
  const parsed = preferencesSchema.safeParse(json);

  if (!parsed.success || !parsed.data.patientId) {
    return NextResponse.json(
      {
        message: 'Invalid request',
        errors: parsed.success ? [] : parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const { patientId, preferences } = parsed.data;

  const updatePayload = preferences
    ? {
        themePreferences: {
          colorScheme: preferences.colorScheme,
          accentColor: preferences.accentColor ?? null,
          density: preferences.density,
        },
      }
    : {
        themePreferences: null,
      };

  const updated = await payload.update({
    collection: 'patients',
    id: patientId,
    data: updatePayload,
  });

  return NextResponse.json({
    preferences: (updated as Record<string, unknown>).themePreferences ?? null,
  });
};
