import { ASSIGNABLE_ROLES, type AssignableRole } from '@/lib/staff/rolePermissions';

export const roleLabels: Record<AssignableRole, string> = {
  patient: 'بیمار',
  doctor: 'پزشک',
  receptionist: 'کارشناس پذیرش',
  admin: 'مدیر سیستم',
};

export const isAssignableRole = (value: string): value is AssignableRole =>
  (ASSIGNABLE_ROLES as readonly string[]).includes(value);

export const getRoleLabel = (role: string): string =>
  isAssignableRole(role) ? roleLabels[role] : role;
