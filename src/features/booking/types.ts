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

export type AvailabilitySlot = {
  id: string;
  start: string;
  end: string;
  kind: 'in_person' | 'virtual';
  timeZone: string;
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceName: string;
  leadTimeHours?: number | null;
};

export type AvailabilityDay = {
  date: string;
  note?: string;
  slots: AvailabilitySlot[];
};

export type AvailabilityCalendarResponse = {
  generatedAt: string;
  range: {
    start: string;
    end: string;
  };
  filters: {
    serviceId: string | null;
    providerId: string | null;
    rangeDays: number;
  };
  days: AvailabilityDay[];
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
