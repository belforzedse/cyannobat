// @ts-nocheck
import { getPayload } from 'payload'
import config from '@payload-config'

async function clearDatabase() {
  console.log('🗑️  Clearing database...')

  const payload = await getPayload({ config })

  try {
    // Delete all appointments
    const appointments = await payload.find({ collection: 'appointments', limit: 1000 })
    console.log(`Deleting ${appointments.docs.length} appointments...`)
    for (const doc of appointments.docs) {
      await payload.delete({ collection: 'appointments', id: doc.id })
    }

    // Delete all services
    const services = await payload.find({ collection: 'services', limit: 1000 })
    console.log(`Deleting ${services.docs.length} services...`)
    for (const doc of services.docs) {
      await payload.delete({ collection: 'services', id: doc.id })
    }

    // Delete all providers
    const providers = await payload.find({ collection: 'providers', limit: 1000 })
    console.log(`Deleting ${providers.docs.length} providers...`)
    for (const doc of providers.docs) {
      await payload.delete({ collection: 'providers', id: doc.id })
    }

    // Delete all users
    const users = await payload.find({ collection: 'users', limit: 1000 })
    console.log(`Deleting ${users.docs.length} users...`)
    for (const doc of users.docs) {
      await payload.delete({ collection: 'users', id: doc.id })
    }

    console.log('✅ Database cleared successfully!')

  } catch (error) {
    console.error('❌ Error clearing database:', error)
    throw error
  }

  process.exit(0)
}

clearDatabase()
