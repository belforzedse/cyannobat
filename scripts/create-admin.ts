import { getPayload } from 'payload'
import config from '../src/payload.config.js'

async function createAdmin() {
  try {
    const payload = await getPayload({ config })

    console.log('Creating admin user...')

    const admin = await payload.create({
      collection: 'users',
      data: {
        email: 'admin@cyannobat.local',
        password: 'Admin123!@#',
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('Email: admin@cyannobat.local')
    console.log('Password: Admin123!@#')
    console.log('Admin ID:', admin.id)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin:', error)
    process.exit(1)
  }
}

createAdmin()
