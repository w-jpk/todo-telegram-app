import { getDbPool } from '~/server/utils/db'
import type { Todo, UpdateTodoDto } from '~/types/todo'

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
  
  const body = await readBody<UpdateTodoDto>(event)
  
  try {
    const pool = getDbPool()
    
    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1
    
    if (body.text !== undefined) {
      updates.push(`text = $${paramIndex++}`)
      values.push(body.text.trim())
    }
    
    if (body.completed !== undefined) {
      updates.push(`completed = $${paramIndex++}`)
      values.push(body.completed)
    }
    
    if (body.dueDate !== undefined) {
      updates.push(`due_date = $${paramIndex++}`)
      values.push(body.dueDate || null)
    }
    
    if (updates.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No fields to update'
      })
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(userId, id)
    
    const result = await pool.query(
      `UPDATE todos 
       SET ${updates.join(', ')}
       WHERE user_id = $${paramIndex++} AND id = $${paramIndex++}
       RETURNING *`,
      values
    )
    
    if (result.rows.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Todo not found'
      })
    }
    
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
    console.error('Error updating todo:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update todo'
    })
  }
})

