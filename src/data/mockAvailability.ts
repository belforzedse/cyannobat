
export type ServiceId = 'general' | 'cardio' | 'checkup';
export type DoctorId = 'nasrin' | 'omid' | 'leila';

export interface AvailabilitySlot {
  id: string;
  start: string;
  end: string;
  kind?: 'in_person' | 'virtual';
}

export interface AvailabilityDay {
  date: string;
  slots: AvailabilitySlot[];
  note?: string;
}

const createSlot = (date: string, start: string, end: string, kind: AvailabilitySlot['kind'] = 'in_person'): AvailabilitySlot => ({
  id: `${date}T${start}`,
  start,
  end,
  kind,
});

const lateMorningSlots = (date: string) => [
  createSlot(date, '09:00', '09:30'),
  createSlot(date, '09:45', '10:15'),
  createSlot(date, '10:30', '11:00'),
  createSlot(date, '11:15', '11:45'),
];

const afternoonSlots = (date: string) => [
  createSlot(date, '13:30', '14:00'),
  createSlot(date, '14:15', '14:45'),
  createSlot(date, '15:00', '15:30'),
  createSlot(date, '16:00', '16:30'),
];

export const mockAvailability: Record<ServiceId, Record<DoctorId, AvailabilityDay[]>> = {
  general: {
    nasrin: [
      {
        date: '2024-06-02',
        slots: lateMorningSlots('2024-06-02'),
        note: 'اولویت با مشاوره‌های آنلاین است؛ لطفاً مدارک شناسایی خود را آماده کنید.',
      },
      {
        date: '2024-06-03',
        slots: [...lateMorningSlots('2024-06-03'), createSlot('2024-06-03', '12:00', '12:30', 'virtual')],
      },
      {
        date: '2024-06-05',
        slots: afternoonSlots('2024-06-05'),
      },
    ],
    omid: [
      {
        date: '2024-06-04',
        slots: [...lateMorningSlots('2024-06-04').slice(0, 3), createSlot('2024-06-04', '12:30', '13:00')],
        note: 'زمان‌های محدود به ویزیت حضوری است.',
      },
      {
        date: '2024-06-06',
        slots: afternoonSlots('2024-06-06'),
      },
    ],
    leila: [
      {
        date: '2024-06-01',
        slots: [
          createSlot('2024-06-01', '08:30', '09:00'),
          createSlot('2024-06-01', '09:15', '09:45'),
          createSlot('2024-06-01', '10:00', '10:30'),
        ],
        note: 'ویژه بیماران دیابتی.',
      },
      {
        date: '2024-06-07',
        slots: afternoonSlots('2024-06-07'),
      },
    ],
  },
  cardio: {
    nasrin: [
      {
        date: '2024-06-08',
        slots: [
          createSlot('2024-06-08', '09:30', '10:00'),
          createSlot('2024-06-08', '10:15', '10:45'),
          createSlot('2024-06-08', '11:00', '11:30'),
        ],
      },
      {
        date: '2024-06-10',
        slots: afternoonSlots('2024-06-10'),
        note: 'آماده‌سازی نتایج آزمایش خود را فراموش نکنید.',
      },
    ],
    omid: [
      {
        date: '2024-06-09',
        slots: [
          createSlot('2024-06-09', '10:00', '10:30'),
          createSlot('2024-06-09', '11:00', '11:30'),
          createSlot('2024-06-09', '12:00', '12:30'),
        ],
      },
      {
        date: '2024-06-11',
        slots: afternoonSlots('2024-06-11'),
      },
    ],
    leila: [
      {
        date: '2024-06-12',
        slots: [
          createSlot('2024-06-12', '09:00', '09:30'),
          createSlot('2024-06-12', '09:45', '10:15'),
          createSlot('2024-06-12', '10:30', '11:00'),
          createSlot('2024-06-12', '11:15', '11:45'),
        ],
      },
      {
        date: '2024-06-13',
        slots: afternoonSlots('2024-06-13'),
      },
    ],
  },
  checkup: {
    nasrin: [
      {
        date: '2024-06-14',
        slots: [
          createSlot('2024-06-14', '08:30', '09:00'),
          createSlot('2024-06-14', '09:30', '10:00'),
          createSlot('2024-06-14', '10:30', '11:00'),
        ],
      },
      {
        date: '2024-06-16',
        slots: afternoonSlots('2024-06-16'),
      },
    ],
    omid: [
      {
        date: '2024-06-15',
        slots: [
          createSlot('2024-06-15', '09:00', '09:30'),
          createSlot('2024-06-15', '09:45', '10:15'),
          createSlot('2024-06-15', '10:30', '11:00'),
        ],
      },
      {
        date: '2024-06-18',
        slots: afternoonSlots('2024-06-18'),
        note: 'چکاپ کامل شامل آزمایش خون است.',
      },
    ],
    leila: [
      {
        date: '2024-06-17',
        slots: [...lateMorningSlots('2024-06-17'), createSlot('2024-06-17', '12:00', '12:30')],
      },
      {
        date: '2024-06-19',
        slots: afternoonSlots('2024-06-19'),
      },
    ],
  },
};
