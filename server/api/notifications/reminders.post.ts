import { getDbPool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const botToken = config.telegramBotToken
  
  if (!botToken) {
    throw createError({
      statusCode: 500,
      message: 'Telegram bot token is not configured'
    })
  }
  
  try {
    const pool = getDbPool()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Get all users with their settings and reminder days
    const usersResult = await pool.query(
      `SELECT DISTINCT u.id as user_id, s.reminder_days_before, s.notifications_enabled, s.notify_on_overdue
       FROM users u
       LEFT JOIN user_settings s ON u.id = s.user_id
       WHERE (s.notifications_enabled IS NULL OR s.notifications_enabled = TRUE)
       AND (s.reminder_days_before IS NOT NULL OR s.reminder_days_before = ARRAY[1, 3])`
    )
    
    const notifications = []
    
    for (const userRow of usersResult.rows) {
      const userId = parseInt(userRow.user_id)
      const reminderDays = userRow.reminder_days_before || [1]
      
      // Get todos for each reminder day
      for (const daysBefore of reminderDays) {
        const reminderDate = new Date(today)
        reminderDate.setDate(reminderDate.getDate() + daysBefore)
        reminderDate.setHours(23, 59, 59, 999)
        
        const reminderDateStart = new Date(reminderDate)
        reminderDateStart.setHours(0, 0, 0, 0)
        
        const todosResult = await pool.query(
          `SELECT t.*
           FROM todos t
           WHERE t.user_id = $1
           AND t.completed = false
           AND t.due_date IS NOT NULL
           AND t.due_date >= $2
           AND t.due_date <= $3
           ORDER BY t.due_date ASC`,
          [userId, reminderDateStart, reminderDate]
        )
        
        if (todosResult.rows.length > 0) {
          const todoList = todosResult.rows
            .map((todo, index) => {
              const priorityEmoji = todo.priority === 'high' ? '🔴' : todo.priority === 'medium' ? '🟡' : todo.priority === 'low' ? '🔵' : ''
              const dueDate = new Date(todo.due_date).toLocaleDateString('ru-RU')
              return `${index + 1}. ${priorityEmoji} ${todo.text} (${dueDate})`
            })
            .join('\n')
          
          const message = `🌅 <b>Доброе утро! Напоминаем о задачах на завтра:</b>\n\n${todoList}\n\n<i>Всего задач: ${todosResult.rows.length}</i>\n\nУспехов в выполнении! 🚀`
          
          try {
            await $fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              body: {
                chat_id: userId,
                text: message,
                parse_mode: 'HTML'
              }
            })
            
            notifications.push({
              userId,
              success: true,
              daysBefore,
              todosCount: todosResult.rows.length
            })
          } catch (error: any) {
            console.error(`Error sending reminder to user ${userId}:`, error)
            notifications.push({
              userId,
              success: false,
              daysBefore,
              error: error.message
            })
          }
        }
      }
    }
    
    return {
      success: true,
      notifications,
      totalUsers: new Set(notifications.map(n => n.userId)).size,
      successfulNotifications: notifications.filter(n => n.success).length
    }
  } catch (error: any) {
    console.error('Error sending reminders:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to send reminders'
    })
  }
})

