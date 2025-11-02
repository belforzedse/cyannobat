import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from './route';
import { authenticateStaffRequest, unauthorizedResponse } from '@/lib/api/auth';

vi.mock('@/lib/api/auth', () => ({
  authenticateStaffRequest: vi.fn(),
  unauthorizedResponse: vi.fn(() =>
    NextResponse.json({ message: 'Unauthorized' }, { status: 401 }),
  ),
}));

const authenticateStaffRequestMock = vi.mocked(authenticateStaffRequest);
const unauthorizedResponseMock = vi.mocked(unauthorizedResponse);

describe('POST /api/staff/appointments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates an appointment when the payload is valid', async () => {
    const payloadCreate = vi.fn().mockResolvedValue({
      id: 'appointment-1',
      status: 'pending',
      reference: 'APT-123',
      schedule: {
        start: '2024-01-01T09:00:00.000Z',
        end: '2024-01-01T09:30:00.000Z',
        timeZone: 'UTC',
      },
      provider: {
        displayName: 'Dr. Example',
      },
      service: {
        title: 'General Checkup',
      },
      client: {
        email: 'patient@example.com',
      },
      createdAt: '2023-12-31T12:00:00.000Z',
    });

    authenticateStaffRequestMock.mockResolvedValue({
      payload: {
        create: payloadCreate,
        logger: { error: vi.fn() },
      } as never,
      user: { id: 'staff-user' } as never,
    });

    const request = new Request('http://localhost/api/staff/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: 'user-1',
        service: 'service-1',
        provider: 'provider-1',
        schedule: {
          start: '2024-01-01T09:00:00.000Z',
          end: '2024-01-01T09:30:00.000Z',
          timeZone: 'UTC',
        },
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    const json = (await response.json()) as { appointment: Record<string, unknown> };
    expect(json.appointment).toMatchObject({
      id: 'appointment-1',
      status: 'pending',
      start: '2024-01-01T09:00:00.000Z',
      end: '2024-01-01T09:30:00.000Z',
      providerName: 'Dr. Example',
      clientEmail: 'patient@example.com',
    });

    expect(payloadCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'appointments',
        overrideAccess: true,
        depth: 2,
        data: expect.objectContaining({
          client: { relationTo: 'users', value: 'user-1' },
          service: { relationTo: 'services', value: 'service-1' },
          provider: { relationTo: 'providers', value: 'provider-1' },
        }),
      }),
    );
  });

  it('returns 400 when validation fails', async () => {
    authenticateStaffRequestMock.mockResolvedValue({
      payload: { logger: { error: vi.fn() } } as never,
      user: { id: 'staff-user' } as never,
    });

    const request = new Request('http://localhost/api/staff/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: 'user-1',
        provider: 'provider-1',
        schedule: {
          start: 'invalid',
          end: '2024-01-01T09:30:00.000Z',
        },
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json).toMatchObject({ message: 'Invalid request body' });
  });

  it('returns unauthorized when the user is missing', async () => {
    const unauthorized = NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    unauthorizedResponseMock.mockReturnValueOnce(unauthorized);
    authenticateStaffRequestMock.mockResolvedValue({
      payload: { logger: { error: vi.fn() } } as never,
      user: null,
    });

    const request = new Request('http://localhost/api/staff/appointments', {
      method: 'POST',
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
    expect(unauthorizedResponseMock).toHaveBeenCalled();
  });
});
