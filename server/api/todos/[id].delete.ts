import { getDbPool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const userId = getHeader(event, 'x-telegram-user-id')
  const id = getRouterParam(event, 'id')
  
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'User ID is required'
    })
  }
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Todo ID is required'
    })
  }
  
  try {
    const pool = getDbPool()
    
    const result = await pool.query(
      'DELETE FROM todos WHERE user_id = $1 AND id = $2 RETURNING id',
      [userId, id]
    )
    
    if (result.rows.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Todo not found'
      })
    }
    
    return {
      success: true,
      message: 'Todo deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting todo:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to delete todo'
    })
  }
})

