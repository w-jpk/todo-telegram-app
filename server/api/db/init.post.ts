import { initializeDatabaseSchema } from '~/server/utils/db'

/**
 * API endpoint to initialize database schema
 * Only available in dev mode for security
 */
export default defineEventHandler(async (event) => {
  // Only allow in dev mode
  if (!process.dev) {
    throw createError({
      statusCode: 403,
      message: 'Database initialization is only available in dev mode'
    })
  }

  try {
    console.log('🔄 Initializing database schema...')
    await initializeDatabaseSchema()
    console.log('✅ Database schema initialized successfully')
    
    return {
      success: true,
      message: 'Database schema initialized successfully'
    }
  } catch (error: any) {
    console.error('❌ Error initializing database schema:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to initialize database schema'
    })
  }
})

