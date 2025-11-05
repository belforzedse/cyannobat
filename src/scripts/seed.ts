// @ts-nocheck
import { getPayload } from 'payload';
import config from '@payload-config';
import { payloadDrizzle } from '@payload-config';
import { sql } from 'drizzle-orm';

const generateValidNationalId = (seed: number): string => {
  // Generate a valid Iranian national ID by appending check digit
  const baseFn = seed.toString().padStart(9, '0');
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(baseFn[i], 10) * (10 - i);
  }
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;
  return baseFn + checkDigit;
};

async function findOrCreateUser(
  payload: any,
  email: string,
  data: {
    name: string;
    phone: string;
    nationalId: string;
    password: string;
    roles: string[];
  },
) {
  const existing = await payload.find({
    collection: 'users',
    where: {
      email: { equals: email },
    },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    console.log(`  ✓ User already exists: ${email}`);
    return existing.docs[0];
  }

  const newUser = await payload.create({
    collection: 'users',
    data: {
      email,
      ...data,
    },
  });
  console.log(`  ✓ Created user: ${email}`);

  // If roles don't match (due to enforcePatientRoleForUnauthenticated hook), update via raw SQL
  if (JSON.stringify(newUser.roles) !== JSON.stringify(data.roles)) {
    // Delete existing roles
    await payloadDrizzle.execute(
      sql`DELETE FROM "users_roles" WHERE parent_id = ${newUser.id}`
    );

    // Insert new roles with order
    for (let i = 0; i < data.roles.length; i++) {
      await payloadDrizzle.execute(
        sql`INSERT INTO "users_roles" (parent_id, value, "order") VALUES (${newUser.id}, ${data.roles[i]}, ${i})`
      );
    }

    console.log(`  ✓ Updated user roles: ${email} -> ${data.roles.join(', ')}`);
  }

  return newUser;
}

async function findOrCreateProvider(
  payload: any,
  accountId: string,
  data: any,
) {
  const existing = await payload.find({
    collection: 'providers',
    where: {
      account: { equals: accountId },
    },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    console.log(`  ✓ Provider already exists for account ${accountId}`);
    return existing.docs[0];
  }

  const newProvider = await payload.create({
    collection: 'providers',
    data: {
      account: accountId,
      ...data,
    },
  });
  console.log(`  ✓ Created provider: ${data.displayName}`);
  return newProvider;
}

async function findOrCreateService(
  payload: any,
  slug: string,
  data: any,
) {
  const existing = await payload.find({
    collection: 'services',
    where: {
      slug: { equals: slug },
    },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    console.log(`  ✓ Service already exists: ${slug}`);
    return existing.docs[0];
  }

  const newService = await payload.create({
    collection: 'services',
    data: {
      slug,
      ...data,
    },
  });
  console.log(`  ✓ Created service: ${data.title}`);
  return newService;
}

async function findOrCreatePatient(
  payload: any,
  ownerId: string,
  data: any,
) {
  const existing = await payload.find({
    collection: 'patients',
    where: {
      owner: { equals: ownerId },
    },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    console.log(`  ✓ Patient record already exists for user ${ownerId}`);
    return existing.docs[0];
  }

  const newPatient = await payload.create({
    collection: 'patients',
    data: {
      owner: ownerId,
      ...data,
    },
  });
  console.log(`  ✓ Created patient record: ${data.displayName}`);
  return newPatient;
}

async function findOrCreateAppointment(
  payload: any,
  clientId: string,
  serviceId: string,
  providerId: string,
  startTime: string,
) {
  const existing = await payload.find({
    collection: 'appointments',
    where: {
      and: [
        { client: { equals: clientId } },
        { service: { equals: serviceId } },
        { provider: { equals: providerId } },
        { 'schedule.start': { equals: startTime } },
      ],
    },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    return existing.docs[0];
  }

  return null; // Will create new one below
}

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  const payload = await getPayload({ config });

  try {
    // =======================
    // ADMIN USER
    // =======================
    console.log('📦 Creating admin user...');
    const adminUser = await findOrCreateUser(payload, 'admin@cyannobat.com', {
      name: 'Admin System',
      phone: '09121112223',
      nationalId: generateValidNationalId(1001),
      password: 'Admin@12345',
      roles: ['admin'],
    });

    // =======================
    // DOCTOR USERS & PROVIDERS
    // =======================
    console.log('\n📦 Creating doctor users and providers...');

    // Doctor 1: Sara Rezaei - Dermatologist
    const doctor1User = await findOrCreateUser(payload, 'sara.rezaei@cyannobat.com', {
      name: 'دکتر سارا رضایی',
      phone: '09121234567',
      nationalId: generateValidNationalId(1002),
      password: 'Doctor@12345',
      roles: ['doctor'],
    });

    const provider1 = await findOrCreateProvider(payload, doctor1User.id, {
      displayName: 'دکتر سارا رضایی',
      slug: 'dr-sara-rezaei',
      headline: 'متخصص پوست و زیبایی',
      bio: '<p>دکتر سارا رضایی با بیش از 10 سال تجربه در زمینه پوست و زیبایی</p>',
      specialties: [
        { label: 'پوست و زیبایی' },
        { label: 'لیزر درمانی' },
        { label: 'رزین درمانی' },
      ],
      contact: {
        phone: '09121234567',
        email: 'sara.rezaei@cyannobat.com',
        website: 'https://dr-sara.example.com',
      },
      location: {
        address: 'خیابان ولیعصر - پلاک 123',
        city: 'تهران',
        region: 'تهران',
        country: 'ایران',
        timeZone: 'Asia/Tehran',
      },
      availability: {
        defaultDurationMinutes: 30,
        windows: [
          { day: 'saturday', startTime: '09:00', endTime: '13:00' },
          { day: 'saturday', startTime: '15:00', endTime: '20:00' },
          { day: 'sunday', startTime: '09:00', endTime: '13:00' },
          { day: 'sunday', startTime: '15:00', endTime: '20:00' },
          { day: 'monday', startTime: '09:00', endTime: '13:00' },
          { day: 'monday', startTime: '15:00', endTime: '20:00' },
          { day: 'tuesday', startTime: '09:00', endTime: '13:00' },
          { day: 'tuesday', startTime: '15:00', endTime: '20:00' },
          { day: 'wednesday', startTime: '09:00', endTime: '13:00' },
          { day: 'wednesday', startTime: '15:00', endTime: '20:00' },
          { day: 'thursday', startTime: '09:00', endTime: '13:00' },
          { day: 'thursday', startTime: '15:00', endTime: '20:00' },
          { day: 'friday', startTime: '09:00', endTime: '13:00' },
          { day: 'friday', startTime: '15:00', endTime: '20:00' },
        ],
      },
      meta: {
        rating: 4.8,
        reviewCount: 126,
        languages: [
          { language: 'فارسی' },
          { language: 'English' },
        ],
      },
    });

    // Doctor 2: Ali Karimi - Dentist
    const doctor2User = await findOrCreateUser(payload, 'ali.karimi@cyannobat.com', {
      name: 'دکتر علی کریمی',
      phone: '09129876543',
      nationalId: generateValidNationalId(1003),
      password: 'Doctor@12345',
      roles: ['doctor'],
    });

    const provider2 = await findOrCreateProvider(payload, doctor2User.id, {
      displayName: 'دکتر علی کریمی',
      slug: 'dr-ali-karimi',
      headline: 'متخصص ایمپلنت و تعویض‌پذیری',
      bio: '<p>دکتر علی کریمی معاون دندانپزشکی دانشگاه و مقیم بین‌المللی</p>',
      specialties: [
        { label: 'دندانپزشکی' },
        { label: 'ایمپلنت' },
        { label: 'ارتودنتیکس' },
      ],
      contact: {
        phone: '09129876543',
        email: 'ali.karimi@cyannobat.com',
      },
      location: {
        address: 'خیابان نیاوران - پلاک 456',
        city: 'تهران',
        region: 'تهران',
        country: 'ایران',
        timeZone: 'Asia/Tehran',
      },
      availability: {
        defaultDurationMinutes: 45,
        windows: [
          { day: 'saturday', startTime: '10:00', endTime: '14:00' },
          { day: 'saturday', startTime: '14:00', endTime: '19:00' },
          { day: 'sunday', startTime: '10:00', endTime: '14:00' },
          { day: 'sunday', startTime: '14:00', endTime: '19:00' },
          { day: 'monday', startTime: '10:00', endTime: '14:00' },
          { day: 'monday', startTime: '14:00', endTime: '19:00' },
          { day: 'tuesday', startTime: '10:00', endTime: '14:00' },
          { day: 'tuesday', startTime: '14:00', endTime: '19:00' },
          { day: 'wednesday', startTime: '10:00', endTime: '14:00' },
          { day: 'wednesday', startTime: '14:00', endTime: '19:00' },
          { day: 'thursday', startTime: '10:00', endTime: '14:00' },
          { day: 'thursday', startTime: '14:00', endTime: '19:00' },
          { day: 'friday', startTime: '10:00', endTime: '14:00' },
          { day: 'friday', startTime: '14:00', endTime: '19:00' },
        ],
      },
      meta: {
        rating: 4.9,
        reviewCount: 89,
        languages: [
          { language: 'فارسی' },
          { language: 'English' },
        ],
      },
    });

    // Doctor 3: Maryam Ahmadi - Physiotherapist
    const doctor3User = await findOrCreateUser(payload, 'maryam.ahmadi@cyannobat.com', {
      name: 'مریم احمدی',
      phone: '09135554444',
      nationalId: generateValidNationalId(1004),
      password: 'Doctor@12345',
      roles: ['doctor'],
    });

    const provider3 = await findOrCreateProvider(payload, doctor3User.id, {
      displayName: 'مریم احمدی',
      slug: 'maryam-ahmadi',
      headline: 'فیزیوتراپیست و تراپیست حرکتی',
      bio: '<p>متخصص فیزیوتراپی ورزشی و درمانی</p>',
      specialties: [
        { label: 'فیزیوتراپی' },
        { label: 'ماساژ درمانی' },
        { label: 'ورزش درمانی' },
      ],
      contact: {
        phone: '09135554444',
        email: 'maryam.ahmadi@cyannobat.com',
      },
      location: {
        address: 'میدان انقلاب - پلاک 789',
        city: 'تهران',
        region: 'تهران',
        country: 'ایران',
        timeZone: 'Asia/Tehran',
      },
      availability: {
        defaultDurationMinutes: 50,
        windows: [
          { day: 'saturday', startTime: '08:00', endTime: '12:00' },
          { day: 'saturday', startTime: '14:00', endTime: '19:00' },
          { day: 'sunday', startTime: '08:00', endTime: '12:00' },
          { day: 'sunday', startTime: '14:00', endTime: '19:00' },
          { day: 'monday', startTime: '08:00', endTime: '12:00' },
          { day: 'monday', startTime: '14:00', endTime: '19:00' },
          { day: 'tuesday', startTime: '08:00', endTime: '12:00' },
          { day: 'tuesday', startTime: '14:00', endTime: '19:00' },
          { day: 'wednesday', startTime: '08:00', endTime: '12:00' },
          { day: 'wednesday', startTime: '14:00', endTime: '19:00' },
          { day: 'thursday', startTime: '08:00', endTime: '12:00' },
          { day: 'thursday', startTime: '14:00', endTime: '19:00' },
          { day: 'friday', startTime: '08:00', endTime: '12:00' },
          { day: 'friday', startTime: '14:00', endTime: '19:00' },
        ],
      },
      meta: {
        rating: 4.7,
        reviewCount: 156,
        languages: [
          { language: 'فارسی' },
          { language: 'English' },
        ],
      },
    });

    // =======================
    // RECEPTIONIST USER
    // =======================
    console.log('\n📦 Creating receptionist user...');
    await findOrCreateUser(payload, 'reception@cyannobat.com', {
      name: 'زهره مهدوی',
      phone: '09144443333',
      nationalId: generateValidNationalId(1005),
      password: 'Reception@12345',
      roles: ['receptionist'],
    });

    // =======================
    // PATIENT USERS
    // =======================
    console.log('\n📦 Creating patient users...');

    const patient1User = await findOrCreateUser(payload, 'patient1@example.com', {
      name: 'فاطمه زارعی',
      phone: '09112221111',
      nationalId: generateValidNationalId(1010),
      password: 'Patient@12345',
      roles: ['patient'],
    });

    const patient2User = await findOrCreateUser(payload, 'patient2@example.com', {
      name: 'محمد رضایی',
      phone: '09113332222',
      nationalId: generateValidNationalId(1011),
      password: 'Patient@12345',
      roles: ['patient'],
    });

    const patient3User = await findOrCreateUser(payload, 'patient3@example.com', {
      name: 'علی جعفری',
      phone: '09114443333',
      nationalId: generateValidNationalId(1012),
      password: 'Patient@12345',
      roles: ['patient'],
    });

    const patient4User = await findOrCreateUser(payload, 'patient4@example.com', {
      name: 'نازنین کریمی',
      phone: '09115554444',
      nationalId: generateValidNationalId(1013),
      password: 'Patient@12345',
      roles: ['patient'],
    });

    const patient5User = await findOrCreateUser(payload, 'patient5@example.com', {
      name: 'رضا علوی',
      phone: '09116665555',
      nationalId: generateValidNationalId(1014),
      password: 'Patient@12345',
      roles: ['patient'],
    });

    // =======================
    // PATIENT RECORDS
    // =======================
    console.log('\n📦 Creating patient records...');

    const patientFolder1 = await findOrCreatePatient(payload, patient1User.id, {
      displayName: 'فاطمه زارعی',
      primaryProvider: provider1.id,
      patientFolders: [
        {
          name: 'اسناد پزشکی',
          description: 'اسناد طبی و نتایج آزمایش',
        },
        {
          name: 'تصاویر و فیلم‌ها',
          description: 'تصاویر رادیولوژی و بررسی‌های تصویری',
        },
      ],
      sharingPreferences: {
        allowPatientDownload: true,
        allowPatientNotes: true,
      },
    });

    const patientFolder2 = await findOrCreatePatient(payload, patient2User.id, {
      displayName: 'محمد رضایی',
      primaryProvider: provider2.id,
      patientFolders: [
        {
          name: 'اسناد دندانپزشکی',
          description: 'نقشه‌های دندانی و نتایج معاینات',
        },
      ],
      sharingPreferences: {
        allowPatientDownload: true,
        allowPatientNotes: false,
      },
    });

    const patientFolder3 = await findOrCreatePatient(payload, patient3User.id, {
      displayName: 'علی جعفری',
      primaryProvider: provider3.id,
      patientFolders: [
        {
          name: 'فیزیوتراپی',
          description: 'نقشه‌های درمان و بیماری‌های موجود',
        },
      ],
      sharingPreferences: {
        allowPatientDownload: false,
        allowPatientNotes: false,
      },
    });

    await findOrCreatePatient(payload, patient4User.id, {
      displayName: 'نازنین کریمی',
      primaryProvider: provider1.id,
      patientFolders: [
        {
          name: 'پرونده کلی',
          description: 'پرونده‌های کلی و معاینات دوره‌ای',
        },
      ],
      sharingPreferences: {
        allowPatientDownload: true,
        allowPatientNotes: false,
      },
    });

    await findOrCreatePatient(payload, patient5User.id, {
      displayName: 'رضا علوی',
      primaryProvider: provider2.id,
      patientFolders: [
        {
          name: 'ارتودنتیکس',
          description: 'پرونده‌های درمان اعوجاج',
        },
      ],
      sharingPreferences: {
        allowPatientDownload: false,
        allowPatientNotes: true,
      },
    });

    // =======================
    // SERVICES
    // =======================
    console.log('\n📦 Creating services...');

    const service1 = await findOrCreateService(payload, 'skin-consultation', {
      title: 'مشاوره پوست و زیبایی',
      category: 'مشاوره',
      description: '<p>مشاوره جامع درباره مراقبت‌های پوستی و روش‌های زیبایی</p>',
      durationMinutes: 30,
      bufferMinutesBefore: 10,
      bufferMinutesAfter: 5,
      pricing: {
        amount: 500000,
        currency: 'USD',
        taxRate: 9,
      },
      providers: [provider1.id],
      isActive: true,
      leadTimeHours: 2,
      instructions: 'لطفاً صورت را پاک کنید و آرایش را زدایش کنید.',
    });

    const service2 = await findOrCreateService(payload, 'laser-therapy', {
      title: 'تراپی لیزر',
      category: 'درمان',
      description: '<p>درمان با لیزر برای مختلف مشکلات پوستی</p>',
      durationMinutes: 45,
      bufferMinutesBefore: 15,
      bufferMinutesAfter: 10,
      pricing: {
        amount: 1500000,
        currency: 'USD',
        taxRate: 9,
      },
      providers: [provider1.id],
      isActive: true,
      leadTimeHours: 24,
      instructions: 'حتماً از محافظ‌های خورشیدی با SPF بالا استفاده کنید.',
    });

    const service3 = await findOrCreateService(payload, 'dental-checkup', {
      title: 'معاینه دندانی',
      category: 'معاینه',
      description: '<p>معاینه جامع دندان‌ها و پیشنهاد درمان</p>',
      durationMinutes: 45,
      bufferMinutesBefore: 10,
      bufferMinutesAfter: 5,
      pricing: {
        amount: 750000,
        currency: 'USD',
      },
      providers: [provider2.id],
      isActive: true,
      leadTimeHours: 4,
    });

    const service4 = await findOrCreateService(payload, 'implant-consultation', {
      title: 'مشاوره ایمپلنت',
      category: 'مشاوره',
      description: '<p>ارزیابی و مشاوره برای درمان با ایمپلنت</p>',
      durationMinutes: 60,
      bufferMinutesBefore: 15,
      bufferMinutesAfter: 10,
      pricing: {
        amount: 1200000,
        currency: 'USD',
        taxRate: 9,
      },
      providers: [provider2.id],
      isActive: true,
      leadTimeHours: 48,
    });

    const service5 = await findOrCreateService(payload, 'physiotherapy-session', {
      title: 'جلسه فیزیوتراپی',
      category: 'درمان',
      description: '<p>درمان فیزیوتراپی جامع با تمرینات و ماساژ</p>',
      durationMinutes: 50,
      bufferMinutesBefore: 10,
      bufferMinutesAfter: 5,
      pricing: {
        amount: 800000,
        currency: 'USD',
        taxRate: 9,
      },
      providers: [provider3.id],
      isActive: true,
      leadTimeHours: 6,
      instructions: 'لباس راحت و ورزشی بپوشید.',
    });

    const service6 = await findOrCreateService(payload, 'massage-therapy', {
      title: 'ماساژ درمانی',
      category: 'درمان',
      description: '<p>ماساژ درمانی تخصصی برای تسکین درد</p>',
      durationMinutes: 60,
      bufferMinutesBefore: 5,
      bufferMinutesAfter: 10,
      pricing: {
        amount: 900000,
        currency: 'USD',
        taxRate: 9,
      },
      providers: [provider3.id],
      isActive: true,
      leadTimeHours: 3,
      instructions: 'قبل از جلسه حمام کنید و از رطوبت‌های شاداب استفاده نکنید.',
    });

    const service7 = await findOrCreateService(payload, 'follow-up-consultation', {
      title: 'مشاوره پیگیری',
      category: 'مشاوره',
      durationMinutes: 20,
      bufferMinutesBefore: 5,
      bufferMinutesAfter: 5,
      pricing: {
        amount: 300000,
        currency: 'USD',
      },
      providers: [provider1.id, provider2.id, provider3.id],
      isActive: true,
      leadTimeHours: 1,
    });

    // =======================
    // APPOINTMENTS (Multiple statuses)
    // =======================
    console.log('\n📦 Creating appointments...');

    const now = new Date();

    // Completed appointment (1 week ago)
    const completedDate = new Date(now);
    completedDate.setDate(completedDate.getDate() - 7);
    completedDate.setHours(10, 0, 0, 0);
    const completedEnd = new Date(completedDate);
    completedEnd.setMinutes(completedEnd.getMinutes() + 30);

    const appointmentCheck1 = await findOrCreateAppointment(
      payload,
      patient1User.id,
      service1.id,
      provider1.id,
      completedDate.toISOString(),
    );

    if (!appointmentCheck1) {
      await payload.create({
        collection: 'appointments',
        data: {
          client: patient1User.id,
          patientFolder: patientFolder1.id,
          service: service1.id,
          provider: provider1.id,
          schedule: {
            start: completedDate.toISOString(),
            end: completedEnd.toISOString(),
            timeZone: 'Asia/Tehran',
            location: 'کلینیک تهران - اتاق 1',
          },
          status: 'completed',
          clientNotes: 'مشاوره خوبی بود',
          internalNotes: 'Completed consultation - patient satisfied',
          patientFeedback: {
            score: 5,
            submittedAt: new Date().toISOString(),
            comment: 'دکتر بسیار حرفه‌ای و مودب بود',
          },
        },
      });
      console.log('  ✓ Created completed appointment');
    }

    // Confirmed appointment (tomorrow)
    const confirmedDate = new Date(now);
    confirmedDate.setDate(confirmedDate.getDate() + 1);
    confirmedDate.setHours(14, 0, 0, 0);
    const confirmedEnd = new Date(confirmedDate);
    confirmedEnd.setMinutes(confirmedEnd.getMinutes() + 45);

    const appointmentCheck2 = await findOrCreateAppointment(
      payload,
      patient2User.id,
      service3.id,
      provider2.id,
      confirmedDate.toISOString(),
    );

    if (!appointmentCheck2) {
      await payload.create({
        collection: 'appointments',
        data: {
          client: patient2User.id,
          patientFolder: patientFolder2.id,
          service: service3.id,
          provider: provider2.id,
          schedule: {
            start: confirmedDate.toISOString(),
            end: confirmedEnd.toISOString(),
            timeZone: 'Asia/Tehran',
            location: 'کلینیک دندانپزشکی - اتاق 3',
          },
          status: 'confirmed',
          clientNotes: 'معاینه دندانی',
          internalNotes: 'Regular checkup confirmed',
        },
      });
      console.log('  ✓ Created confirmed appointment');
    }

    // Pending appointment (3 days from now)
    const pendingDate = new Date(now);
    pendingDate.setDate(pendingDate.getDate() + 3);
    pendingDate.setHours(11, 0, 0, 0);
    const pendingEnd = new Date(pendingDate);
    pendingEnd.setMinutes(pendingEnd.getMinutes() + 50);

    const appointmentCheck3 = await findOrCreateAppointment(
      payload,
      patient3User.id,
      service5.id,
      provider3.id,
      pendingDate.toISOString(),
    );

    if (!appointmentCheck3) {
      await payload.create({
        collection: 'appointments',
        data: {
          client: patient3User.id,
          patientFolder: patientFolder3.id,
          service: service5.id,
          provider: provider3.id,
          schedule: {
            start: pendingDate.toISOString(),
            end: pendingEnd.toISOString(),
            timeZone: 'Asia/Tehran',
            location: 'کلینیک فیزیوتراپی - سالن 2',
          },
          status: 'pending',
          clientNotes: 'درخواست جلسه فیزیوتراپی',
          internalNotes: 'Pending confirmation',
        },
      });
      console.log('  ✓ Created pending appointment');
    }

    // In-progress appointment (today)
    const inProgressDate = new Date(now);
    inProgressDate.setHours(15, 0, 0, 0);
    const inProgressEnd = new Date(inProgressDate);
    inProgressEnd.setMinutes(inProgressEnd.getMinutes() + 60);

    const appointmentCheck4 = await findOrCreateAppointment(
      payload,
      patient4User.id,
      service6.id,
      provider3.id,
      inProgressDate.toISOString(),
    );

    if (!appointmentCheck4) {
      await payload.create({
        collection: 'appointments',
        data: {
          client: patient4User.id,
          service: service6.id,
          provider: provider3.id,
          schedule: {
            start: inProgressDate.toISOString(),
            end: inProgressEnd.toISOString(),
            timeZone: 'Asia/Tehran',
            location: 'کلینیک فیزیوتراپی - سالن 1',
          },
          status: 'in_progress',
          clientNotes: 'جلسه ماساژ درمانی',
          internalNotes: 'Currently in session',
        },
      });
      console.log('  ✓ Created in-progress appointment');
    }

    // Cancelled appointment (5 days from now)
    const cancelledDate = new Date(now);
    cancelledDate.setDate(cancelledDate.getDate() + 5);
    cancelledDate.setHours(09, 0, 0, 0);
    const cancelledEnd = new Date(cancelledDate);
    cancelledEnd.setMinutes(cancelledEnd.getMinutes() + 30);

    const appointmentCheck5 = await findOrCreateAppointment(
      payload,
      patient5User.id,
      service1.id,
      provider1.id,
      cancelledDate.toISOString(),
    );

    if (!appointmentCheck5) {
      await payload.create({
        collection: 'appointments',
        data: {
          client: patient5User.id,
          service: service1.id,
          provider: provider1.id,
          schedule: {
            start: cancelledDate.toISOString(),
            end: cancelledEnd.toISOString(),
            timeZone: 'Asia/Tehran',
            location: 'کلینیک تهران - اتاق 2',
          },
          status: 'cancelled',
          clientNotes: 'درخواست لغو',
          internalNotes: 'Cancelled by patient',
          cancellation: {
            cancelledAt: new Date().toISOString(),
            reason: 'مسافرت ناگهانی',
          },
        },
      });
      console.log('  ✓ Created cancelled appointment');
    }

    // No-show appointment (2 weeks ago)
    const noshowDate = new Date(now);
    noshowDate.setDate(noshowDate.getDate() - 14);
    noshowDate.setHours(13, 0, 0, 0);
    const noshowEnd = new Date(noshowDate);
    noshowEnd.setMinutes(noshowEnd.getMinutes() + 45);

    const appointmentCheck6 = await findOrCreateAppointment(
      payload,
      patient1User.id,
      service3.id,
      provider2.id,
      noshowDate.toISOString(),
    );

    if (!appointmentCheck6) {
      await payload.create({
        collection: 'appointments',
        data: {
          client: patient1User.id,
          service: service3.id,
          provider: provider2.id,
          schedule: {
            start: noshowDate.toISOString(),
            end: noshowEnd.toISOString(),
            timeZone: 'Asia/Tehran',
            location: 'کلینیک دندانپزشکی - اتاق 1',
          },
          status: 'no_show',
          internalNotes: 'Patient did not show up',
        },
      });
      console.log('  ✓ Created no-show appointment');
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Admin Login:');
    console.log('  📧 Email: admin@cyannobat.com');
    console.log('  🔑 Password: Admin@12345\n');

    console.log('📋 Doctor Logins:');
    console.log('  📧 sara.rezaei@cyannobat.com / Doctor@12345');
    console.log('  📧 ali.karimi@cyannobat.com / Doctor@12345');
    console.log('  📧 maryam.ahmadi@cyannobat.com / Doctor@12345\n');

    console.log('📋 Receptionist Login:');
    console.log('  📧 reception@cyannobat.com / Reception@12345\n');

    console.log('📋 Patient Logins:');
    console.log('  📧 patient1@example.com / Patient@12345');
    console.log('  📧 patient2@example.com / Patient@12345');
    console.log('  📧 patient3@example.com / Patient@12345');
    console.log('  📧 patient4@example.com / Patient@12345');
    console.log('  📧 patient5@example.com / Patient@12345\n');

    console.log('📊 Seeded Data Summary:');
    console.log('  ✓ 1 Admin user');
    console.log('  ✓ 3 Doctor users with full provider profiles');
    console.log('  ✓ 1 Receptionist user');
    console.log('  ✓ 5 Patient users with patient records');
    console.log('  ✓ 7 Services');
    console.log('  ✓ 6 Appointments (various statuses)');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }

  process.exit(0);
}

seed();
