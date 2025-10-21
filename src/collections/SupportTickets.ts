import type { CollectionConfig } from 'payload'

import { userIsStaff } from '@/lib/auth'

export const SupportTickets: CollectionConfig = {
  slug: 'supportTickets',
  labels: {
    singular: 'Support ticket',
    plural: 'Support tickets',
  },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'email', 'status', 'createdAt'],
    description: 'پیام‌های ارسالی از فرم تماس کاربر در این بخش ذخیره می‌شوند.',
  },
  access: {
    read: ({ req }) => Boolean(req.user) && userIsStaff(req.user),
    update: ({ req }) => Boolean(req.user) && userIsStaff(req.user),
    delete: ({ req }) => Boolean(req.user) && userIsStaff(req.user),
    create: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'نام ارسال‌کننده',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      label: 'ایمیل تماس',
      required: true,
    },
    {
      name: 'subject',
      type: 'text',
      label: 'موضوع',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'پیام',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      label: 'وضعیت رسیدگی',
      defaultValue: 'new',
      options: [
        { label: 'در انتظار بررسی', value: 'new' },
        { label: 'در حال پیگیری', value: 'inProgress' },
        { label: 'بسته شده', value: 'resolved' },
      ],
      admin: {
        description: 'برای مدیریت داخلی تیم پشتیبانی استفاده می‌شود.',
      },
    },
    {
      name: 'source',
      type: 'text',
      label: 'منبع ایجاد',
      defaultValue: 'contact-form',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'metadata',
      type: 'group',
      label: 'اطلاعات تکمیلی',
      fields: [
        {
          name: 'channel',
          type: 'text',
          label: 'کانال دریافت',
        },
        {
          name: 'ipAddress',
          type: 'text',
          label: 'IP کاربر',
        },
        {
          name: 'userAgent',
          type: 'textarea',
          label: 'User agent',
        },
        {
          name: 'referer',
          type: 'text',
          label: 'صفحه ارجاع',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
