import { getDbPool } from '~/server/utils/db'
import type { Todo, CreateTodoDto } from '~/types/todo'

export default defineEventHandler(async (event) => {
  const userId = getHeader(event, 'x-telegram-user-id')
  
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'User ID is required'
    })
  }
  
  const body = await readBody<CreateTodoDto>(event)
  
  if (!body.text || !body.text.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Task text is required'
    })
  }
  
  try {
    const pool = getDbPool()
    
    // Get user data from header if provided
    const userDataHeader = getHeader(event, 'x-telegram-user-data')
    let userData = null
    if (userDataHeader) {
      try {
        userData = JSON.parse(userDataHeader)
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    // Ensure user exists (user data will be updated via auth endpoint)
    if (userData) {
      await pool.query(
        `INSERT INTO users (id, first_name, last_name, username, language_code, is_premium, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET 
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           username = EXCLUDED.username,
           language_code = EXCLUDED.language_code,
           is_premium = EXCLUDED.is_premium,
           updated_at = CURRENT_TIMESTAMP`,
        [
          userId,
          userData.first_name || 'User',
          userData.last_name || null,
          userData.username || null,
          userData.language_code || null,
          userData.is_premium || false
        ]
      )
    } else {
      // Fallback: ensure user exists with minimal data
      await pool.query(
        `INSERT INTO users (id, first_name, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP`,
        [userId, 'User']
      )
    }
    
    // Create todo
    const result = await pool.query(
      `INSERT INTO todos (user_id, text, completed, due_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [userId, body.text.trim(), false, body.dueDate || null]
    )
    
    const row = result.rows[0]
    const todo: Todo = {
      id: row.id,
      text: row.text,
      completed: row.completed,
      userId: parseInt(row.user_id),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      dueDate: row.due_date || undefined
    }
    
    return {
      data: todo
    }
  } catch (error: any) {
    console.error('Error creating todo:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to create todo'
    })
  }
})

