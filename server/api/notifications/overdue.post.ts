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
    
    // Get all overdue todos with user settings
    const result = await pool.query(
      `SELECT t.*, u.id as user_id, s.notify_on_overdue, s.notifications_enabled
       FROM todos t
       JOIN users u ON t.user_id = u.id
       LEFT JOIN user_settings s ON u.id = s.user_id
       WHERE t.completed = false
       AND t.due_date IS NOT NULL
       AND t.due_date < $1
       AND (s.notifications_enabled IS NULL OR s.notifications_enabled = TRUE)
       AND (s.notify_on_overdue IS NULL OR s.notify_on_overdue = TRUE)
       ORDER BY t.due_date ASC`,
      [today]
    )
    
    // Group todos by user
    const todosByUser = new Map<number, any[]>()
    
    for (const row of result.rows) {
      const userId = parseInt(row.user_id)
      if (!todosByUser.has(userId)) {
        todosByUser.set(userId, [])
      }
      todosByUser.get(userId)!.push(row)
    }
    
    // Send notifications to each user
    const notifications = []
    
    for (const [userId, todos] of todosByUser.entries()) {
      if (todos.length === 0) continue
      
      const todoList = todos
        .map((todo, index) => {
          const priorityEmoji = todo.priority === 'high' ? '🔴' : todo.priority === 'medium' ? '🟡' : todo.priority === 'low' ? '🔵' : ''
          const dueDate = new Date(todo.due_date).toLocaleDateString('ru-RU')
          const daysOverdue = Math.floor((today.getTime() - new Date(todo.due_date).getTime()) / (1000 * 60 * 60 * 24))
          return `${index + 1}. ${priorityEmoji} ${todo.text}\n   📅 ${dueDate} (${daysOverdue} дн. назад)`
        })
        .join('\n\n')
      
      const message = `⚠️ <b>Просроченные задачи:</b>\n\n${todoList}\n\n<i>Всего просрочено: ${todos.length}</i>`
      
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
          todosCount: todos.length
        })
      } catch (error: any) {
        console.error(`Error sending overdue notification to user ${userId}:`, error)
        notifications.push({
          userId,
          success: false,
          error: error.message
        })
      }
    }
    
    return {
      success: true,
      notifications,
      totalUsers: notifications.length,
      successfulNotifications: notifications.filter(n => n.success).length
    }
  } catch (error: any) {
    console.error('Error sending overdue notifications:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to send overdue notifications'
    })
  }
})

