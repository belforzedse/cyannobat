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
  console.log('🌱 Starting staff/test user seeding...\n');

  const configPath = path.resolve(process.cwd(), 'src/payload.config.ts');

  await payload.init({
    config: (await import(configPath)).default,
  });

  let created = 0;
  let updated = 0;
  let skipped = 0;

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
      console.log(`  ℹ User exists: ${user.email}`);

      // Only update if data has changed
      const updateData: Record<string, unknown> = {
        roles: user.roles,
        name: user.name,
        phone: user.phone,
        nationalId: user.nationalId,
      };

      try {
        await payload.update({
          collection: 'users',
          id: target.id,
          data: updateData as never,
          overrideAccess: true,
        });
        console.log(`  ✓ Updated user: ${user.email}`);
        updated++;
      } catch (error) {
        console.log(`  ⚠ Failed to update: ${user.email}`);
      }

      // Create or update patient record
      if (user.roles.includes('patient')) {
        const patientExists = await payload.find({
          collection: 'patients',
          where: {
            owner: {
              equals: target.id,
            },
          },
          limit: 1,
          depth: 0,
        });

        if (patientExists.docs.length > 0) {
          console.log(`  ✓ Patient record already exists`);
          skipped++;
        } else {
          try {
            await payload.create({
              collection: 'patients',
              data: {
                owner: target.id,
                displayName: user.name,
                patientFolders: [
                  {
                    name: 'اسناد پزشکی',
                    description: 'پرونده‌های بارگذاری شده توسط کلینیک',
                  },
                ],
                themePreferences: {
                  colorScheme: 'system',
                  accentColor: 'emerald',
                  density: 'comfortable',
                },
                sharingPreferences: {
                  allowPatientDownload: true,
                  allowPatientNotes: false,
                },
              } as never,
              overrideAccess: true,
            });
            console.log(`  ✓ Created patient record`);
            created++;
          } catch (error) {
            console.log(`  ⚠ Failed to create patient record`);
          }
        }
      } else {
        skipped++;
      }

      continue;
    }

    // User doesn't exist, create it
    const createData: Record<string, unknown> = {
      email: user.email,
      name: user.name,
      phone: user.phone,
      nationalId: user.nationalId,
      password: user.password,
      roles: user.roles,
    };

    try {
      const newUser = await payload.create({
        collection: 'users',
        data: createData as never,
        overrideAccess: true,
      });
      console.log(`  ✓ Created user: ${user.email}`);
      created++;

      // Create patient record if applicable
      if (user.roles.includes('patient')) {
        try {
          await payload.create({
            collection: 'patients',
            data: {
              owner: newUser.id,
              displayName: user.name,
              patientFolders: [
                {
                  name: 'اسناد پزشکی',
                  description: 'پرونده‌های بارگذاری شده توسط کلینیک',
                },
              ],
              themePreferences: {
                colorScheme: 'system',
                accentColor: 'emerald',
                density: 'comfortable',
              },
              sharingPreferences: {
                allowPatientDownload: true,
                allowPatientNotes: false,
              },
            } as never,
            overrideAccess: true,
          });
          console.log(`  ✓ Created patient record`);
          created++;
        } catch (error) {
          console.log(`  ⚠ Failed to create patient record`);
        }
      }
    } catch (error) {
      console.log(`  ❌ Failed to create user: ${user.email}`);
    }
  }

  console.log('\n✅ Staff/test user seeding complete!');
  console.log(`\n📊 Summary:`);
  console.log(`  ✓ Created: ${created}`);
  console.log(`  ✓ Updated: ${updated}`);
  console.log(`  ⊘ Skipped: ${skipped}`);

  console.log('\n📋 Default Test Logins:');
  console.log('  📧 patient@example.com / patient123!');
  console.log('  📧 doctor@example.com / doctor123!');
  console.log('  📧 reception@example.com / reception123!');

  payload.logger.info('Staff/test user seeding complete.');
  process.exit(0);
};

run().catch((error) => {
  payload.logger.error('Failed to seed staff users', error);
  process.exit(1);
});
