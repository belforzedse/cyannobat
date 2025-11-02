// @ts-nocheck
import { getPayload } from 'payload';
import config from '@payload-config';

async function seed() {
  console.log('🌱 Starting database seeding...');

  const payload = await getPayload({ config });

  try {
    // Create admin user
    console.log('Creating admin user...');
    const adminUser = await payload.create({
      collection: 'users',
      data: {
        name: 'Admin User',
        email: 'admin@cyannobat.com',
        phone: '09121234567',
        nationalId: '0012345678',
        password: 'admin123',
        roles: ['admin'],
      },
    });

    // Create provider users
    console.log('Creating provider users...');
    const provider1User = await payload.create({
      collection: 'users',
      data: {
        name: 'Sara Rezaei',
        email: 'sara.rezaei@cyannobat.com',
        phone: '09123456789',
        nationalId: '0123456789',
        password: 'provider123',
        roles: ['doctor'],
      },
    });

    const provider2User = await payload.create({
      collection: 'users',
      data: {
        name: 'Ali Karimi',
        email: 'ali.karimi@cyannobat.com',
        phone: '09123456788',
        nationalId: '0123456788',
        password: 'provider123',
        roles: ['doctor'],
      },
    });

    const provider3User = await payload.create({
      collection: 'users',
      data: {
        name: 'Maryam Ahmadi',
        email: 'maryam.ahmadi@cyannobat.com',
        phone: '09123456787',
        nationalId: '0123456787',
        password: 'provider123',
        roles: ['doctor'],
      },
    });

    // Create client user
    console.log('Creating client user...');
    const clientUser = await payload.create({
      collection: 'users',
      data: {
        name: 'Client User',
        email: 'client@example.com',
        phone: '09120000000',
        nationalId: '0000000000',
        password: 'client123',
        roles: ['patient'],
      },
    });

    // Create providers
    console.log('Creating providers...');
    const provider1 = await payload.create({
      collection: 'providers',
      data: {
        account: provider1User.id,
        displayName: 'دکتر سارا رضایی',
        slug: 'dr-sara-rezaei',
        headline: 'متخصص پوست و مو',
        specialties: [{ label: 'پوست' }, { label: 'مو' }, { label: 'لیزر' }],
        contact: {
          phone: '۰۹۱۲۳۴۵۶۷۸۹',
          email: 'sara.rezaei@cyannobat.com',
        },
        location: {
          timeZone: 'Asia/Tehran',
          city: 'تهران',
          country: 'ایران',
        },
      },
    });

    const provider2 = await payload.create({
      collection: 'providers',
      data: {
        account: provider2User.id,
        displayName: 'دکتر علی کریمی',
        slug: 'dr-ali-karimi',
        headline: 'متخصص دندانپزشکی زیبایی',
        specialties: [{ label: 'دندانپزشکی' }, { label: 'ایمپلنت' }, { label: 'زیبایی' }],
        contact: {
          phone: '۰۹۱۲۳۴۵۶۷۸۸',
          email: 'ali.karimi@cyannobat.com',
        },
        location: {
          timeZone: 'Asia/Tehran',
          city: 'تهران',
          country: 'ایران',
        },
      },
    });

    const provider3 = await payload.create({
      collection: 'providers',
      data: {
        account: provider3User.id,
        displayName: 'مریم احمدی',
        slug: 'maryam-ahmadi',
        headline: 'کارشناس ماساژ درمانی و فیزیوتراپی',
        specialties: [{ label: 'ماساژ' }, { label: 'فیزیوتراپی' }, { label: 'طب سوزنی' }],
        contact: {
          phone: '۰۹۱۲۳۴۵۶۷۸۷',
          email: 'maryam.ahmadi@cyannobat.com',
        },
        location: {
          timeZone: 'Asia/Tehran',
          city: 'تهران',
          country: 'ایران',
        },
      },
    });

    // Create services
    console.log('Creating services...');
    const service1 = await payload.create({
      collection: 'services',
      data: {
        title: 'پیگیری روند درمان',
        category: 'مشاوره',
        slug: 'follow-up-treatment',
        durationMinutes: 30,
        pricing: {
          amount: 500000,
          currency: 'USD',
        },
        providers: [provider1.id],
        isActive: true,
      },
    });

    const service2 = await payload.create({
      collection: 'services',
      data: {
        title: 'انتخاب خدمت درمانی',
        category: 'مشاوره',
        slug: 'treatment-selection',
        durationMinutes: 45,
        pricing: {
          amount: 750000,
          currency: 'USD',
        },
        providers: [provider1.id, provider2.id],
        isActive: true,
      },
    });

    const service3 = await payload.create({
      collection: 'services',
      data: {
        title: 'انتخاب تاریخ و زمان خدمت',
        category: 'نوبت‌دهی',
        slug: 'schedule-selection',
        durationMinutes: 60,
        pricing: {
          amount: 1000000,
          currency: 'USD',
        },
        providers: [provider2.id],
        isActive: true,
      },
    });

    const service4 = await payload.create({
      collection: 'services',
      data: {
        title: 'دریافت نظر دوم',
        category: 'مشاوره',
        slug: 'second-opinion',
        durationMinutes: 30,
        pricing: {
          amount: 600000,
          currency: 'USD',
        },
        providers: [provider3.id],
        isActive: true,
      },
    });

    const service5 = await payload.create({
      collection: 'services',
      data: {
        title: 'چک‌آپ دوره‌ای',
        category: 'معاینه',
        slug: 'periodic-checkup',
        durationMinutes: 45,
        pricing: {
          amount: 800000,
          currency: 'USD',
        },
        providers: [provider1.id, provider3.id],
        isActive: true,
      },
    });

    const service6 = await payload.create({
      collection: 'services',
      data: {
        title: 'ظهور علائم جدید',
        category: 'تشخیص',
        slug: 'new-symptoms',
        durationMinutes: 60,
        pricing: {
          amount: 900000,
          currency: 'USD',
        },
        providers: [provider2.id, provider3.id],
        isActive: true,
      },
    });

    // Create sample appointments
    console.log('Creating sample appointments...');
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const appointmentEndTime = new Date(tomorrow);
    appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + 30);

    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(14, 0, 0, 0);

    const nextWeekEndTime = new Date(nextWeek);
    nextWeekEndTime.setMinutes(nextWeekEndTime.getMinutes() + 60);

    await payload.create({
      collection: 'appointments',
      data: {
        client: clientUser.id,
        service: service1.id,
        provider: provider1.id,
        schedule: {
          start: tomorrow.toISOString(),
          end: appointmentEndTime.toISOString(),
          timeZone: 'Asia/Tehran',
        },
        status: 'confirmed',
        clientNotes: 'اولین ویزیت - بررسی کامل',
        internalNotes: 'Seeded appointment - initial consultation',
      },
    });

    await payload.create({
      collection: 'appointments',
      data: {
        client: clientUser.id,
        service: service3.id,
        provider: provider2.id,
        schedule: {
          start: nextWeek.toISOString(),
          end: nextWeekEndTime.toISOString(),
          timeZone: 'Asia/Tehran',
        },
        status: 'pending',
        clientNotes: 'نوبت دوم - پیگیری درمان',
        internalNotes: 'Seeded appointment - follow-up scheduling',
      },
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('Admin: admin@cyannobat.com / admin123');
    console.log('Provider 1: sara.rezaei@cyannobat.com / provider123');
    console.log('Provider 2: ali.karimi@cyannobat.com / provider123');
    console.log('Provider 3: maryam.ahmadi@cyannobat.com / provider123');
    console.log('Client: client@example.com / client123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }

  process.exit(0);
}

seed();
