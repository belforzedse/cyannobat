export interface DeliveryWindowSlot {
  id: string;
  start: string;
  end: string;
  label?: string;
  description?: string;
}

export interface DeliveryWindowGroup {
  label: string;
  note?: string;
  windows: DeliveryWindowSlot[];
}

export interface DeliveryDay {
  date: string;
  badge?: string;
  shippingLabel?: string;
  groups: DeliveryWindowGroup[];
  note?: string;
}

const createWindow = (
  date: string,
  start: string,
  end: string,
  label?: string,
  description?: string,
): DeliveryWindowSlot => ({
  id: `${date}-${start}-${end}`,
  start,
  end,
  label,
  description,
});

export const mockDeliveryWindows: DeliveryDay[] = [
  {
    date: '2024-06-01',
    badge: 'سریع‌ترین گزینه',
    shippingLabel: 'ارسال ویژه پرایم',
    note: 'تحویل در همان روز برای تهران و کرج.',
    groups: [
      {
        label: 'تحویل صبح',
        windows: [
          createWindow('2024-06-01', '08:00', '10:00', 'بین ساعت ۸ تا ۱۰'),
          createWindow('2024-06-01', '10:00', '12:00', 'بین ساعت ۱۰ تا ۱۲'),
        ],
      },
      {
        label: 'تحویل عصر',
        note: 'ویژه سفارش‌های حجیم.',
        windows: [
          createWindow('2024-06-01', '14:00', '16:00', 'بین ساعت ۱۴ تا ۱۶'),
          createWindow('2024-06-01', '16:00', '18:00', 'بین ساعت ۱۶ تا ۱۸'),
        ],
      },
    ],
  },
  {
    date: '2024-06-02',
    shippingLabel: 'ارسال استاندارد رایگان',
    groups: [
      {
        label: 'تحویل صبح',
        windows: [
          createWindow('2024-06-02', '09:00', '11:00', 'بین ساعت ۹ تا ۱۱'),
          createWindow('2024-06-02', '11:00', '13:00', 'بین ساعت ۱۱ تا ۱۳'),
        ],
      },
      {
        label: 'تحویل بعدازظهر',
        windows: [
          createWindow('2024-06-02', '13:00', '15:00', 'بین ساعت ۱۳ تا ۱۵'),
          createWindow('2024-06-02', '15:00', '17:00', 'بین ساعت ۱۵ تا ۱۷'),
        ],
      },
    ],
  },
  {
    date: '2024-06-03',
    shippingLabel: 'ارسال نرمال',
    groups: [
      {
        label: 'تحویل صبح',
        windows: [
          createWindow('2024-06-03', '09:00', '12:00', 'بین ساعت ۹ تا ۱۲'),
        ],
      },
      {
        label: 'تحویل عصر',
        note: 'محدود به مراکز استان‌ها.',
        windows: [
          createWindow('2024-06-03', '15:00', '18:00', 'بین ساعت ۱۵ تا ۱۸'),
        ],
      },
    ],
  },
  {
    date: '2024-06-04',
    badge: 'پیشنهاد ویژه',
    shippingLabel: 'ارسال اقتصادی',
    groups: [
      {
        label: 'تحویل ظهر',
        windows: [
          createWindow('2024-06-04', '12:00', '14:00', 'بین ساعت ۱۲ تا ۱۴'),
        ],
      },
      {
        label: 'تحویل عصر',
        windows: [
          createWindow('2024-06-04', '16:00', '18:00', 'بین ساعت ۱۶ تا ۱۸'),
          createWindow('2024-06-04', '18:00', '20:00', 'بین ساعت ۱۸ تا ۲۰'),
        ],
      },
    ],
  },
  {
    date: '2024-06-05',
    shippingLabel: 'ارسال استاندارد',
    note: 'تحویل ممکن است به روز بعد موکول شود.',
    groups: [
      {
        label: 'تحویل صبح',
        windows: [
          createWindow('2024-06-05', '09:00', '11:00', 'بین ساعت ۹ تا ۱۱'),
        ],
      },
      {
        label: 'تحویل شب',
        windows: [
          createWindow('2024-06-05', '19:00', '21:00', 'بین ساعت ۱۹ تا ۲۱'),
        ],
      },
    ],
  },
];
