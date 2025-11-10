import { getDbPool } from '~/server/utils/db'
import type { TelegramUser } from '~/types/todo'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    initData: string
    user: TelegramUser
  }>(event)
  
  if (!body.user || !body.user.id) {
    throw createError({
      statusCode: 400,
      message: 'User data is required'
    })
  }
  
  try {
    const pool = getDbPool()
    const user = body.user
    
    // Create or update user
    await pool.query(
      `INSERT INTO users (id, first_name, last_name, username, language_code, is_premium, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       ON CONFLICT (id) 
       DO UPDATE SET 
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         username = EXCLUDED.username,
         language_code = EXCLUDED.language_code,
         is_premium = EXCLUDED.is_premium,
         updated_at = CURRENT_TIMESTAMP`,
      [
        user.id,
        user.first_name,
        user.last_name || null,
        user.username || null,
        user.language_code || null,
        user.is_premium || false
      ]
    )
    
    return {
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username
      }
    }
  } catch (error: any) {
    console.error('Error authenticating user:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to authenticate user'
    })
  }
})

