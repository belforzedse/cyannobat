import { getPayload } from 'payload'
import path from 'path'

async function createAdmin() {
  try {
    const configPath = path.resolve(process.cwd(), 'src/payload.config.ts')
    const payload = await getPayload({
      config: (await import(configPath)).default,
    })

    console.log('Creating admin user...')

    const email = 'admin@cyannobat.local'
    const password = 'Admin123!@#'

    const existing = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    const roles: Array<'admin'> = ['admin']

    const userData = {
      email,
      password,
      name: 'Cyan Nobat Admin',
      phone: '09120000000',
      roles,
    }

    const admin =
      existing.totalDocs > 0
        ? await payload.update({
            collection: 'users',
            id: existing.docs[0].id,
            data: userData,
          })
        : await payload.create({
            collection: 'users',
            data: userData,
          })

    console.log('Admin user ready!')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('Admin ID:', admin.id)

    process.exit(0)
  } catch (error) {
    console.error('Error creating admin:', error)
    process.exit(1)
  }
}

createAdmin()
