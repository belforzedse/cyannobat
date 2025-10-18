import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const payload = await getPayload({ config })

    // Try to query users to see if database is initialized
    try {
      await payload.find({
        collection: 'users',
        limit: 1,
      })
      return NextResponse.json({
        status: 'Database already initialized',
      })
    } catch {
      // Database not initialized, Payload should auto-initialize
      // If we get here, the database is being accessed now
      return NextResponse.json({
        status: 'Database initialization attempted',
      })
    }
  } catch (error) {
    console.error('DB init error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 },
    )
  }
}
