import { getDbPool, validateUserId, validateUUID } from '~/server/utils/db'
import type { Todo, UpdateTodoDto } from '~/types/todo'

export default defineEventHandler(async (event) => {
  const userId = validateUserId(getHeader(event, 'x-telegram-user-id'))
  const id = validateUUID(getRouterParam(event, 'id'))
  
  const body = await readBody<UpdateTodoDto>(event)
  
  try {
    const pool = getDbPool()
    
    // Get old todo to check if it was completed before update
    const oldTodoResult = await pool.query(
      'SELECT completed FROM todos WHERE user_id = $1 AND id = $2',
      [userId, id]
    )
    
    if (oldTodoResult.rows.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Todo not found'
      })
    }
    
    const wasCompletedBefore = oldTodoResult.rows[0].completed
    
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

    if (body.recurrenceRule !== undefined) {
      if (body.recurrenceRule) {
        updates.push(`recurrence_type = $${paramIndex++}`)
        updates.push(`recurrence_interval = $${paramIndex++}`)
        updates.push(`recurrence_end_date = $${paramIndex++}`)
        updates.push(`recurrence_days_of_week = $${paramIndex++}`)
        updates.push(`recurrence_day_of_month = $${paramIndex++}`)
        updates.push(`is_recurring = $${paramIndex++}`)
        values.push(body.recurrenceRule.type)
        values.push(body.recurrenceRule.interval)
        values.push(body.recurrenceRule.endDate || null)
        values.push(body.recurrenceRule.daysOfWeek || null)
        values.push(body.recurrenceRule.dayOfMonth || null)
        values.push(true)
      } else {
        updates.push(`recurrence_type = $${paramIndex++}`)
        updates.push(`recurrence_interval = $${paramIndex++}`)
        updates.push(`recurrence_end_date = $${paramIndex++}`)
        updates.push(`recurrence_days_of_week = $${paramIndex++}`)
        updates.push(`recurrence_day_of_month = $${paramIndex++}`)
        updates.push(`is_recurring = $${paramIndex++}`)
        values.push(null, null, null, null, null, false)
      }
    }

    // Handle tags update separately
    if (body.tagIds !== undefined) {
      // Delete existing tag relationships
      await pool.query(
        'DELETE FROM todo_tags WHERE todo_id = $1',
        [id]
      )

      // Insert new tag relationships using parameterized queries to prevent SQL injection
      if (body.tagIds.length > 0) {
        for (const tagId of body.tagIds) {
          await pool.query(
            'INSERT INTO todo_tags (todo_id, tag_id) VALUES ($1, $2)',
            [id, tagId]
          )
        }
      }
    }

    if (updates.length === 0 && body.tagIds === undefined && body.recurrenceRule === undefined) {
      throw createError({
        statusCode: 400,
        message: 'No fields to update'
      })
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    // Add userId and id to values array, then use paramIndex for WHERE clause
    values.push(userId, id)
    const userIdParamIndex = paramIndex
    const idParamIndex = paramIndex + 1
    
    const result = await pool.query(
      `UPDATE todos 
       SET ${updates.join(', ')}
       WHERE user_id = $${userIdParamIndex} AND id = $${idParamIndex}
       RETURNING *`,
      values
    )
    
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

    // Get tags for the todo
    const tagsResult = await pool.query(
      'SELECT t.* FROM tags t INNER JOIN todo_tags tt ON t.id = tt.tag_id WHERE tt.todo_id = $1',
      [row.id]
    )

    const tags = tagsResult.rows.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      userId: parseInt(tag.user_id),
      createdAt: tag.created_at,
      updatedAt: tag.updated_at
    }))

    const recurrenceRule = row.is_recurring ? {
      type: row.recurrence_type,
      interval: row.recurrence_interval,
      endDate: row.recurrence_end_date || undefined,
      daysOfWeek: row.recurrence_days_of_week || undefined,
      dayOfMonth: row.recurrence_day_of_month || undefined
    } : undefined

    const todo: Todo = {
      id: row.id,
      text: row.text,
      description: row.description || undefined,
      completed: row.completed,
      priority: row.priority || 'none',
      userId: parseInt(row.user_id),
      projectId: row.project_id || undefined,
      project: project || undefined,
      tags,
      recurrenceRule,
      isRecurring: row.is_recurring,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      dueDate: row.due_date || undefined
    }
    
    // Send notification if enabled and task was completed
    if (body.completed === true && !wasCompletedBefore) {
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

