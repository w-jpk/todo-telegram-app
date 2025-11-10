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
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // Get all active todos due today or upcoming
    const result = await pool.query(
      `SELECT t.*, u.id as user_id
       FROM todos t
       JOIN users u ON t.user_id = u.id
       WHERE t.completed = false 
       AND t.due_date IS NOT NULL
       AND t.due_date >= $1
       AND t.due_date < $2
       ORDER BY t.due_date ASC`,
      [today, tomorrow]
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
        .map((todo, index) => `${index + 1}. ${todo.text}`)
        .join('\n')
      
      const message = `📋 <b>Задачи на сегодня:</b>\n\n${todoList}`
      
      try {
        const response = await $fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
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
        console.error(`Error sending notification to user ${userId}:`, error)
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
    console.error('Error sending daily notifications:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to send daily notifications'
    })
  }
})

