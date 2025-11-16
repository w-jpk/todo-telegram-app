import { getDbPool, validateUserId } from '~/server/utils/db'
import type { Todo, CreateTodoDto } from '~/types/todo'

export default defineEventHandler(async (event) => {
  const userId = validateUserId(getHeader(event, 'x-telegram-user-id'))
  
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
        const decoded = decodeURIComponent(userDataHeader)
      userData = JSON.parse(decoded)
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
    
    // Get or create default project if projectId not provided
    let projectId = body.projectId || null
    if (!projectId) {
      const defaultProject = await pool.query(
        'SELECT id FROM projects WHERE user_id = $1 AND name = $2',
        [userId, 'Inbox']
      )
      if (defaultProject.rows.length > 0) {
        projectId = defaultProject.rows[0].id
      }
    }
    
    // Create todo
    const result = await pool.query(
      `INSERT INTO todos (user_id, project_id, text, description, completed, priority, due_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        userId,
        projectId,
        body.text.trim(),
        body.description?.trim() || null,
        false,
        body.priority || 'none',
        body.dueDate || null
      ]
    )
    
    // Get project info if exists
    let project = null
    if (projectId) {
      const projectResult = await pool.query(
        'SELECT * FROM projects WHERE id = $1',
        [projectId]
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
    
    // Send notification if enabled
    try {
      const settingsResult = await pool.query(
        'SELECT notify_on_create, notifications_enabled FROM user_settings WHERE user_id = $1',
        [userId]
      )
      
      if (settingsResult.rows.length > 0) {
        const settings = settingsResult.rows[0]
        if (settings.notifications_enabled && settings.notify_on_create) {
          const config = useRuntimeConfig()
          const botToken = config.telegramBotToken
          
          if (botToken) {
            const notificationText = `✅ <b>Создана новая задача:</b>\n\n${todo.text}${todo.dueDate ? `\n📅 Срок: ${new Date(todo.dueDate).toLocaleDateString('ru-RU')}` : ''}`
            
            await $fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              body: {
                chat_id: userId,
                text: notificationText,
                parse_mode: 'HTML'
              }
            }).catch((err) => {
              console.error('Error sending create notification:', err)
            })
          }
        }
      }
    } catch (notifError) {
      // Don't fail todo creation if notification fails
      console.error('Error sending notification:', notifError)
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

