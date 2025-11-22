/**
 * Type definitions for Strapi content types
 * 
 * These types mirror the Payload types but are structured for Strapi's response format.
 * Strapi uses a different structure where relations can be:
 * - A number (ID only)
 * - An object with id/data (populated)
 * - null/undefined
 */

export interface StrapiAppointment {
  id: number;
  reference: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  schedule: {
    start: string;
    end: string;
    timeZone: string;
    bufferBefore?: number;
    bufferAfter?: number;
  };
  client?: number | StrapiUser;
  provider?: number | StrapiProvider;
  service?: number | StrapiService;
  pricingSnapshot?: {
    amount: number;
    currency: string;
    durationMinutes: number;
    taxRate?: number;
  };
  clientNotes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  phone?: string;
  name?: string;
  roles?: string[] | Array<{ name: string }>;
  provider?: number | StrapiProvider;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiProvider {
  id: number;
  displayName: string;
  user?: number | StrapiUser;
  services?: number[] | StrapiService[];
  availability?: {
    windows?: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
    defaultDurationMinutes?: number;
  };
  location?: {
    timeZone?: string;
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StrapiService {
  id: number;
  title: string;
  description?: string;
  isActive?: boolean;
  durationMinutes?: number;
  leadTimeHours?: number;
  bufferMinutesBefore?: number;
  bufferMinutesAfter?: number;
  pricing?: {
    amount: number;
    currency: string;
    taxRate?: number;
  };
  providers?: number[] | StrapiProvider[];
  createdAt: string;
  updatedAt: string;
}

export interface StrapiPatient {
  id: number;
  nationalId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  user?: number | StrapiUser;
  appointments?: number[] | StrapiAppointment[];
  createdAt: string;
  updatedAt: string;
}

export interface StrapiSupportTicket {
  id: number;
  subject: string;
  message: string;
  email?: string;
  phone?: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

/**
 * Helper to resolve Strapi relation to ID
 */
export function resolveStrapiRelationId(relation: unknown): string | null {
  if (!relation) return null;
  if (typeof relation === 'number') return String(relation);
  if (typeof relation === 'string') return relation;
  if (typeof relation === 'object') {
    const obj = relation as { id?: unknown; data?: { id?: unknown } };
    if (obj.id !== undefined) {
      return String(obj.id);
    }
    if (obj.data && typeof obj.data === 'object' && 'id' in obj.data) {
      return String(obj.data.id);
    }
  }
  return null;
}

/**
 * Helper to check if a relation is populated
 */
export function isStrapiRelationPopulated<T>(relation: unknown): relation is T {
  return (
    relation !== null &&
    typeof relation === 'object' &&
    !('id' in relation && Object.keys(relation).length === 1) // Not just { id: number }
  );
}
