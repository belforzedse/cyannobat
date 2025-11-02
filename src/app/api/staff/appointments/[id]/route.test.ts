import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PATCH } from './route';
import { authenticateStaffRequest, unauthorizedResponse } from '@/lib/api/auth';

vi.mock('@/lib/api/auth', () => ({
  authenticateStaffRequest: vi.fn(),
  unauthorizedResponse: vi.fn(() =>
    NextResponse.json({ message: 'Unauthorized' }, { status: 401 }),
  ),
}));

const authenticateStaffRequestMock = vi.mocked(authenticateStaffRequest);
const unauthorizedResponseMock = vi.mocked(unauthorizedResponse);

describe('PATCH /api/staff/appointments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates the appointment schedule when valid data is provided', async () => {
    const payloadUpdate = vi.fn().mockResolvedValue({
      id: 'appointment-1',
      status: 'confirmed',
      schedule: {
        start: '2024-01-01T10:00:00.000Z',
        end: '2024-01-01T10:30:00.000Z',
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
        update: payloadUpdate,
        logger: { error: vi.fn() },
      } as never,
      user: { id: 'staff-user' } as never,
    });

    const request = new NextRequest('http://localhost/api/staff/appointments/appointment-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schedule: {
          start: '2024-01-01T10:00:00.000Z',
          end: '2024-01-01T10:30:00.000Z',
          timeZone: 'UTC',
        },
      }),
      duplex: 'half',
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'appointment-1' }) });

    expect(response.status).toBe(200);
    const json = (await response.json()) as { appointment: Record<string, unknown> };
    expect(json.appointment).toMatchObject({
      id: 'appointment-1',
      status: 'confirmed',
      start: '2024-01-01T10:00:00.000Z',
      end: '2024-01-01T10:30:00.000Z',
      providerName: 'Dr. Example',
    });

    expect(payloadUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'appointments',
        id: 'appointment-1',
        overrideAccess: true,
        depth: 2,
        data: {
          schedule: {
            start: '2024-01-01T10:00:00.000Z',
            end: '2024-01-01T10:30:00.000Z',
            timeZone: 'UTC',
          },
        },
      }),
    );
  });

  it('returns 400 when schedule validation fails', async () => {
    authenticateStaffRequestMock.mockResolvedValue({
      payload: {
        update: vi.fn(),
        logger: { error: vi.fn() },
      } as never,
      user: { id: 'staff-user' } as never,
    });

    const request = new NextRequest('http://localhost/api/staff/appointments/appointment-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schedule: {
          start: '2024-01-01T10:00:00.000Z',
          end: '2023-12-31T10:30:00.000Z',
        },
      }),
      duplex: 'half',
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'appointment-1' }) });
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json).toMatchObject({ message: 'Invalid request body' });
  });

  it('returns unauthorized when the user is missing', async () => {
    const unauthorized = NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    unauthorizedResponseMock.mockReturnValueOnce(unauthorized);
    authenticateStaffRequestMock.mockResolvedValue({
      payload: {
        update: vi.fn(),
        logger: { error: vi.fn() },
      } as never,
      user: null,
    });

    const request = new NextRequest('http://localhost/api/staff/appointments/appointment-1', {
      method: 'PATCH',
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'appointment-1' }) });
    expect(response.status).toBe(401);
    expect(unauthorizedResponseMock).toHaveBeenCalled();
  });
});
