import payload from 'payload'
import path from 'path'

const USERS_TO_SEED = [
  {
    email: 'patient@example.com',
    password: 'patient123!',
    roles: ['patient'],
  },
  {
    email: 'doctor@example.com',
    password: 'doctor123!',
    roles: ['doctor'],
  },
  {
    email: 'reception@example.com',
    password: 'reception123!',
    roles: ['receptionist'],
  },
]

const run = async () => {
  const configPath = path.resolve(process.cwd(), 'src/payload.config.ts')

  await payload.init({
    config: (await import(configPath)).default,
  })

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
    })

    if (existing.docs.length > 0) {
      const target = existing.docs[0]
      await payload.update({
        collection: 'users',
        id: target.id,
        data: {
          roles: user.roles,
        },
        overrideAccess: true,
      })
      continue
    }

    await payload.create({
      collection: 'users',
      data: user,
      overrideAccess: true,
    })
  }

  payload.logger.info('Seeded default patient/doctor/receptionist users.')
  process.exit(0)
}

run().catch((error) => {
  payload.logger.error('Failed to seed staff users', error)
  process.exit(1)
})
