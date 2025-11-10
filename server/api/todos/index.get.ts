import { getDbPool } from '~/server/utils/db'
import type { Todo } from '~/types/todo'

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
      'SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )
    
    const todos: Todo[] = result.rows.map(row => ({
      id: row.id,
      text: row.text,
      completed: row.completed,
      userId: parseInt(row.user_id),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      dueDate: row.due_date || undefined
    }))
    
    return {
      data: todos
    }
  } catch (error: any) {
    console.error('Error fetching todos:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch todos'
    })
  }
})

