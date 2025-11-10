import { getDbPool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const userId = getHeader(event, 'x-telegram-user-id')
  
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'User ID is required'
    })
  }
  
  try {
    const pool = getDbPool()
    
    const result = await pool.query(
      'DELETE FROM todos WHERE user_id = $1 AND completed = true RETURNING id',
      [userId]
    )
    
    return {
      success: true,
      message: 'Completed todos deleted successfully',
      deletedCount: result.rows.length
    }
  } catch (error: any) {
    console.error('Error clearing completed todos:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to clear completed todos'
    })
  }
})

