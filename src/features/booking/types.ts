import { type AvailabilityDay, type AvailabilitySlot } from '@/data/mockAvailability';

export type StepKey = 'dateTime' | 'reason' | 'customer';

export type ProgressStep = {
  key: StepKey;
  label: string;
};

export type StepStatus = 'complete' | 'current' | 'upcoming';

export type ProgressStepWithStatus = ProgressStep & {
  status: StepStatus;
  index: number;
};

export type ReasonOption = {
  value: string;
  label: string;
};

export type SelectedSchedule = {
  day: AvailabilityDay;
  slot: AvailabilitySlot;
};

export type CustomerInfo = {
  fullName: string;
  email: string;
  phone: string;
};
