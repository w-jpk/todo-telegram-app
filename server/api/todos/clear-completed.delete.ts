import { getDbPool, validateUserId } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const userId = validateUserId(getHeader(event, 'x-telegram-user-id'))
  
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

