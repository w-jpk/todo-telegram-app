import cron from 'node-cron'
import { getDbPool } from '~/server/utils/db'

export default defineNitroPlugin((nitroApp) => {
  // Only run in production or if explicitly enabled
  if (process.env.NODE_ENV === 'development' && !process.env.ENABLE_SCHEDULER) {
    console.log('Scheduler disabled in development mode. Set ENABLE_SCHEDULER=true to enable.')
    return
  }

  const config = useRuntimeConfig()
  const botToken = config.telegramBotToken

  if (!botToken) {
    console.warn('Telegram bot token not configured. Scheduler will not send notifications.')
    return
  }

  // Helper function to send notification
  const sendNotification = async (userId: number, message: string) => {
    try {
      await $fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        body: {
          chat_id: userId,
          text: message,
          parse_mode: 'HTML'
        }
      })
      return true
    } catch (error: any) {
      console.error(`Error sending notification to user ${userId}:`, error)
      return false
    }
  }

  // Daily notifications - runs every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily notifications scheduler...')
    
    try {
      const pool = getDbPool()
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const result = await pool.query(
        `SELECT t.*, u.id as user_id, s.notifications_enabled, s.daily_notifications, s.daily_notification_time, s.timezone
         FROM todos t
         JOIN users u ON t.user_id = u.id
         LEFT JOIN user_settings s ON u.id = s.user_id
         WHERE t.completed = false 
         AND t.due_date IS NOT NULL
         AND t.due_date >= $1
         AND t.due_date < $2
         AND (s.notifications_enabled IS NULL OR s.notifications_enabled = TRUE)
         AND (s.daily_notifications IS NULL OR s.daily_notifications = TRUE)
         ORDER BY t.due_date ASC`,
        [today, tomorrow]
      )

      const todosByUser = new Map<number, any[]>()

      for (const row of result.rows) {
        const userId = parseInt(row.user_id)
        if (!todosByUser.has(userId)) {
          todosByUser.set(userId, [])
        }
        todosByUser.get(userId)!.push(row)
      }

      let successCount = 0
      let failCount = 0

      for (const [userId, todos] of todosByUser.entries()) {
        if (todos.length === 0) continue

        const todoList = todos
          .map((todo, index) => {
            const priorityEmoji = todo.priority === 'high' ? '🔴' : todo.priority === 'medium' ? '🟡' : todo.priority === 'low' ? '🔵' : ''
            return `${index + 1}. ${priorityEmoji} ${todo.text}`
          })
          .join('\n')

        const message = `📋 <b>Задачи на сегодня:</b>\n\n${todoList}\n\n<i>Всего задач: ${todos.length}</i>`

        const success = await sendNotification(userId, message)
        if (success) {
          successCount++
        } else {
          failCount++
        }
      }

      console.log(`Daily notifications sent: ${successCount} successful, ${failCount} failed`)
    } catch (error: any) {
      console.error('Error in daily notifications scheduler:', error)
    }
  }, {
    timezone: 'UTC'
  })

  // Reminders - runs every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running reminders scheduler...')
    
    try {
      const pool = getDbPool()
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const usersResult = await pool.query(
        `SELECT DISTINCT u.id as user_id, s.reminder_days_before, s.notifications_enabled, s.notify_on_overdue
         FROM users u
         LEFT JOIN user_settings s ON u.id = s.user_id
         WHERE (s.notifications_enabled IS NULL OR s.notifications_enabled = TRUE)`
      )

      let totalSent = 0

      for (const userRow of usersResult.rows) {
        const userId = parseInt(userRow.user_id)
        const reminderDays = userRow.reminder_days_before || [1, 3]

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

            const daysText = daysBefore === 1 ? 'завтра' : `через ${daysBefore} дня`
            const message = `⏰ <b>Напоминание: задачи ${daysText}</b>\n\n${todoList}\n\n<i>Всего задач: ${todosResult.rows.length}</i>`

            await sendNotification(userId, message)
            totalSent++
          }
        }
      }

      console.log(`Reminders sent: ${totalSent} notifications`)
    } catch (error: any) {
      console.error('Error in reminders scheduler:', error)
    }
  }, {
    timezone: 'UTC'
  })

  // Overdue notifications - runs every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running overdue notifications scheduler...')
    
    try {
      const pool = getDbPool()
      const today = new Date()
      today.setHours(0, 0, 0, 0)

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

      const todosByUser = new Map<number, any[]>()

      for (const row of result.rows) {
        const userId = parseInt(row.user_id)
        if (!todosByUser.has(userId)) {
          todosByUser.set(userId, [])
        }
        todosByUser.get(userId)!.push(row)
      }

      let successCount = 0

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

        const success = await sendNotification(userId, message)
        if (success) {
          successCount++
        }
      }

      console.log(`Overdue notifications sent: ${successCount} users notified`)
    } catch (error: any) {
      console.error('Error in overdue notifications scheduler:', error)
    }
  }, {
    timezone: 'UTC'
  })

  console.log('✅ Notification scheduler initialized')
  console.log('   - Daily notifications: every day at 9:00 AM UTC')
  console.log('   - Reminders: every day at 9:00 AM UTC')
  console.log('   - Overdue notifications: every day at 9:00 AM UTC')
})

