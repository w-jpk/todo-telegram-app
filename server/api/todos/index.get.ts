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
      `SELECT t.*, p.id as project_id_full, p.name as project_name, p.color as project_color
       FROM todos t
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.user_id = $1
       ORDER BY 
         CASE t.priority
           WHEN 'high' THEN 1
           WHEN 'medium' THEN 2
           WHEN 'low' THEN 3
           ELSE 4
         END,
         t.due_date NULLS LAST,
         t.created_at DESC`,
      [userId]
    )
    
    const todos: Todo[] = result.rows.map(row => ({
      id: row.id,
      text: row.text,
      description: row.description || undefined,
      completed: row.completed,
      priority: row.priority || 'none',
      userId: parseInt(row.user_id),
      projectId: row.project_id || undefined,
      project: row.project_id_full ? {
        id: row.project_id_full,
        name: row.project_name,
        color: row.project_color,
        userId: parseInt(row.user_id),
        createdAt: new Date(),
        updatedAt: new Date()
      } : undefined,
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

