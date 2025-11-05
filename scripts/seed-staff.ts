import payload from 'payload';
import path from 'path';

const USERS_TO_SEED = [
  {
    email: 'patient@example.com',
    name: 'کاربر بیمار',
    phone: '09100000001',
    nationalId: '0084575948',
    password: 'patient123!',
    roles: ['patient'],
  },
  {
    email: 'doctor@example.com',
    name: 'دکتر نمونه',
    phone: '09100000002',
    nationalId: '0010350829',
    password: 'doctor123!',
    roles: ['doctor'],
  },
  {
    email: 'reception@example.com',
    name: 'مسئول پذیرش',
    phone: '09100000003',
    nationalId: '0499370899',
    password: 'reception123!',
    roles: ['receptionist'],
  },
];

const run = async () => {
  const configPath = path.resolve(process.cwd(), 'src/payload.config.ts');

  await payload.init({
    config: (await import(configPath)).default,
  });

  for (const user of USERS_TO_SEED) {
    const existing = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: user.email,
        },
      },
      limit: 1,
      depth: 0,
    });

    if (existing.docs.length > 0) {
      const target = existing.docs[0];
      const updateData: Record<string, unknown> = {
        roles: user.roles,
        name: user.name,
        phone: user.phone,
        nationalId: user.nationalId,
      };
      await payload.update({
        collection: 'users',
        id: target.id,
        data: updateData as never,
        overrideAccess: true,
      });

      if (user.roles.includes('patient')) {
        await payload.upsert({
          collection: 'patients',
          where: {
            owner: {
              equals: target.id,
            },
          },
          data: {
            owner: target.id,
            displayName: user.name,
            themePreferences: {
              colorScheme: 'system',
              accentColor: 'emerald',
              density: 'comfortable',
            },
          },
          overrideAccess: true,
        });
      }
      continue;
    }

    const createData: Record<string, unknown> = {
      email: user.email,
      name: user.name,
      phone: user.phone,
      nationalId: user.nationalId,
      password: user.password,
      roles: user.roles,
    };

    await payload.create({
      collection: 'users',
      data: createData as never,
      overrideAccess: true,
    });

    if (user.roles.includes('patient')) {
      const created = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: user.email,
          },
        },
        limit: 1,
        depth: 0,
      });

      const ownerId = created.docs[0]?.id;
      if (ownerId) {
        await payload.create({
          collection: 'patients',
          data: {
            owner: ownerId,
            displayName: user.name,
            patientFolders: [
              {
                name: 'اسناد پزشکی',
                description: 'پرونده‌های بارگذاری شده توسط کلینیک',
              },
            ],
          } as never,
          overrideAccess: true,
        });
      }
    }
  }

  payload.logger.info('Seeded default patient/doctor/receptionist users.');
  process.exit(0);
};

run().catch((error) => {
  payload.logger.error('Failed to seed staff users', error);
  process.exit(1);
});
