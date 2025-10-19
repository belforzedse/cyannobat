import { getPayload } from 'payload'
import config from '@payload-config'

async function seed() {
  console.log('🌱 Starting database seeding...')

  const payload = await getPayload({ config })

  try {
    // Create admin user
    console.log('Creating admin user...')
    const adminUser = await payload.create({
      collection: 'users',
      data: {
        email: 'admin@cyannobat.com',
        password: 'admin123',
        role: 'admin',
      },
    })

    // Create provider users
    console.log('Creating provider users...')
    const provider1User = await payload.create({
      collection: 'users',
      data: {
        email: 'sara.rezaei@cyannobat.com',
        password: 'provider123',
        role: 'provider',
      },
    })

    const provider2User = await payload.create({
      collection: 'users',
      data: {
        email: 'ali.karimi@cyannobat.com',
        password: 'provider123',
        role: 'provider',
      },
    })

    const provider3User = await payload.create({
      collection: 'users',
      data: {
        email: 'maryam.ahmadi@cyannobat.com',
        password: 'provider123',
        role: 'provider',
      },
    })

    // Create client user
    console.log('Creating client user...')
    const clientUser = await payload.create({
      collection: 'users',
      data: {
        email: 'client@example.com',
        password: 'client123',
        role: 'user',
      },
    })

    // Create providers
    console.log('Creating providers...')
    const provider1 = await payload.create({
      collection: 'providers',
      data: {
        name: 'دکتر سارا رضایی',
        bio: 'متخصص پوست و مو با ۱۰ سال سابقه کاری',
        specialties: ['پوست', 'مو', 'لیزر'],
        user: provider1User.id,
        avatar: undefined,
        contactInfo: {
          phone: '۰۹۱۲۳۴۵۶۷۸۹',
          email: 'sara.rezaei@cyannobat.com',
        },
      },
    })

    const provider2 = await payload.create({
      collection: 'providers',
      data: {
        name: 'دکتر علی کریمی',
        bio: 'متخصص دندانپزشکی زیبایی و ترمیمی',
        specialties: ['دندانپزشکی', 'ایمپلنت', 'زیبایی'],
        user: provider2User.id,
        avatar: undefined,
        contactInfo: {
          phone: '۰۹۱۲۳۴۵۶۷۸۸',
          email: 'ali.karimi@cyannobat.com',
        },
      },
    })

    const provider3 = await payload.create({
      collection: 'providers',
      data: {
        name: 'مریم احمدی',
        bio: 'کارشناس ماساژ درمانی و فیزیوتراپی',
        specialties: ['ماساژ', 'فیزیوتراپی', 'طب سوزنی'],
        user: provider3User.id,
        avatar: undefined,
        contactInfo: {
          phone: '۰۹۱۲۳۴۵۶۷۸۷',
          email: 'maryam.ahmadi@cyannobat.com',
        },
      },
    })

    // Create services
    console.log('Creating services...')
    const service1 = await payload.create({
      collection: 'services',
      data: {
        name: 'پیگیری روند درمان',
        description: 'بررسی پیشرفت درمان و تنظیم برنامه جدید',
        duration: 30,
        price: 500000,
        category: 'مشاوره',
        providers: [provider1.id],
        isActive: true,
      },
    })

    const service2 = await payload.create({
      collection: 'services',
      data: {
        name: 'انتخاب خدمت درمانی',
        description: 'مشاوره اولیه برای انتخاب خدمت مناسب',
        duration: 45,
        price: 750000,
        category: 'مشاوره',
        providers: [provider1.id, provider2.id],
        isActive: true,
      },
    })

    const service3 = await payload.create({
      collection: 'services',
      data: {
        name: 'انتخاب تاریخ و زمان خدمت',
        description: 'تنظیم وقت نوبت برای خدمات درمانی',
        duration: 60,
        price: 1000000,
        category: 'نوبت‌دهی',
        providers: [provider2.id],
        isActive: true,
      },
    })

    const service4 = await payload.create({
      collection: 'services',
      data: {
        name: 'دریافت نظر دوم',
        description: 'مشاوره تخصصی برای دریافت نظر پزشک دوم',
        duration: 30,
        price: 600000,
        category: 'مشاوره',
        providers: [provider3.id],
        isActive: true,
      },
    })

    const service5 = await payload.create({
      collection: 'services',
      data: {
        name: 'چک‌آپ دوره‌ای',
        description: 'معاینات دوره‌ای و بررسی وضعیت سلامت',
        duration: 45,
        price: 800000,
        category: 'معاینه',
        providers: [provider1.id, provider3.id],
        isActive: true,
      },
    })

    const service6 = await payload.create({
      collection: 'services',
      data: {
        name: 'ظهور علائم جدید',
        description: 'بررسی و تشخیص علائم جدید بیماری',
        duration: 60,
        price: 900000,
        category: 'تشخیص',
        providers: [provider2.id, provider3.id],
        isActive: true,
      },
    })

    // Create sample appointments
    console.log('Creating sample appointments...')
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)
    nextWeek.setHours(14, 0, 0, 0)

    await payload.create({
      collection: 'appointments',
      data: {
        client: clientUser.id,
        service: service1.id,
        provider: provider1.id,
        schedule: {
          start: tomorrow.toISOString(),
        },
        status: 'confirmed',
        notes: 'اولین ویزیت - بررسی کامل',
      },
    })

    await payload.create({
      collection: 'appointments',
      data: {
        client: clientUser.id,
        service: service3.id,
        provider: provider2.id,
        schedule: {
          start: nextWeek.toISOString(),
        },
        status: 'pending',
        notes: 'نوبت دوم - پیگیری درمان',
      },
    })

    console.log('✅ Database seeded successfully!')
    console.log('\n📋 Login credentials:')
    console.log('Admin: admin@cyannobat.com / admin123')
    console.log('Provider 1: sara.rezaei@cyannobat.com / provider123')
    console.log('Provider 2: ali.karimi@cyannobat.com / provider123')
    console.log('Provider 3: maryam.ahmadi@cyannobat.com / provider123')
    console.log('Client: client@example.com / client123')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }

  process.exit(0)
}

seed()
