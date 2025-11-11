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
    
    if (body.description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      values.push(body.description?.trim() || null)
    }
    
    if (body.completed !== undefined) {
      updates.push(`completed = $${paramIndex++}`)
      values.push(body.completed)
    }
    
    if (body.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`)
      values.push(body.priority || 'none')
    }
    
    if (body.projectId !== undefined) {
      updates.push(`project_id = $${paramIndex++}`)
      values.push(body.projectId || null)
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
    
    // Get project info if exists
    let project = null
    if (result.rows[0].project_id) {
      const projectResult = await pool.query(
        'SELECT * FROM projects WHERE id = $1',
        [result.rows[0].project_id]
      )
      if (projectResult.rows.length > 0) {
        const p = projectResult.rows[0]
        project = {
          id: p.id,
          name: p.name,
          color: p.color,
          userId: parseInt(p.user_id),
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }
      }
    }
    
    const row = result.rows[0]
    const todo: Todo = {
      id: row.id,
      text: row.text,
      description: row.description || undefined,
      completed: row.completed,
      priority: row.priority || 'none',
      userId: parseInt(row.user_id),
      projectId: row.project_id || undefined,
      project: project || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      dueDate: row.due_date || undefined
    }
    
    // Send notification if enabled and task was completed
    if (body.completed === true && !result.rows[0].completed) {
      try {
        const settingsResult = await pool.query(
          'SELECT notify_on_update, notifications_enabled FROM user_settings WHERE user_id = $1',
          [userId]
        )
        
        if (settingsResult.rows.length > 0) {
          const settings = settingsResult.rows[0]
          if (settings.notifications_enabled && settings.notify_on_update) {
            const config = useRuntimeConfig()
            const botToken = config.telegramBotToken
            
            if (botToken) {
              const notificationText = `🎉 <b>Задача выполнена!</b>\n\n${todo.text}`
              
              await $fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                body: {
                  chat_id: userId,
                  text: notificationText,
                  parse_mode: 'HTML'
                }
              }).catch((err) => {
                console.error('Error sending update notification:', err)
              })
            }
          }
        }
      } catch (notifError) {
        // Don't fail todo update if notification fails
        console.error('Error sending notification:', notifError)
      }
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

