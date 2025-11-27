import cron from 'node-cron'
import { getDbPool } from '~/server/utils/db'

interface UserSettingsRow {
  user_id: string
  notifications_enabled: boolean
  daily_notifications: boolean
  daily_notification_time: string | null
  timezone: string | null
  reminder_days_before: number[] | null
  notify_on_overdue: boolean
  quiet_hours_start: string | null
  quiet_hours_end: string | null
  auto_archive_completed: boolean
  archive_after_days: number | null
  backup_frequency: string | null
  last_backup_date: Date | null
  data_retention_days: number | null
}

const DEFAULT_DAILY_TIME = '09:00'

const normalizeTimeString = (value?: string | null, fallback: string = DEFAULT_DAILY_TIME) => {
  if (!value) return fallback
  const segments = value.split(':')
  const hour = segments[0]?.padStart(2, '0') ?? '00'
  const minute = segments[1]?.padStart(2, '0') ?? '00'
  return `${hour}:${minute}`
}

const resolveTimezone = (timezone?: string | null) => {
  const zone = timezone || 'UTC'
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: zone })
    return zone
  } catch {
    return 'UTC'
  }
}

const getUserTimeInfo = (timezone?: string | null) => {
  const zone = resolveTimezone(timezone)
  const now = new Date()

  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  })

  const parts = timeFormatter.formatToParts(now)
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00'
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00'

  return {
    isoDate: dateFormatter.format(now), // YYYY-MM-DD
    time: `${hour}:${minute}`,
    minutesOfDay: parseInt(hour, 10) * 60 + parseInt(minute, 10),
    timezone: zone
  }
}

const timeStringToMinutes = (value?: string | null) => {
  if (!value) return null
  const [hour, minute] = value.split(':').map((segment) => parseInt(segment, 10))
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null
  return hour * 60 + minute
}

const isWithinQuietHours = (currentMinutes: number, quietStart?: string | null, quietEnd?: string | null) => {
  const start = timeStringToMinutes(quietStart)
  const end = timeStringToMinutes(quietEnd)

  if (start === null || end === null) {
    return false
  }

  if (start === end) {
    return false
  }

  if (start < end) {
    return currentMinutes >= start && currentMinutes < end
  }

  return currentMinutes >= start || currentMinutes < end
}

const parseNumberArray = (value: any, fallback: number[] = [1]) => {
  if (Array.isArray(value) && value.length > 0) {
    return value.map((num) => Number(num)).filter((num) => !Number.isNaN(num))
  }

  if (typeof value === 'string') {
    return value
      .replace(/[{}]/g, '')
      .split(',')
      .filter(Boolean)
      .map((num) => Number(num))
      .filter((num) => !Number.isNaN(num))
  }

  return fallback
}

const dailyNotificationTracker = new Map<number, string>()
const reminderNotificationTracker = new Map<number, string>()
const overdueNotificationTracker = new Map<number, string>()

export default defineNitroPlugin(() => {
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

  const fetchUserSettings = async (pool: ReturnType<typeof getDbPool>) => {
    const result = await pool.query<UserSettingsRow>(`
      SELECT
        u.id as user_id,
        COALESCE(s.notifications_enabled, TRUE) AS notifications_enabled,
        COALESCE(s.daily_notifications, TRUE) AS daily_notifications,
        COALESCE(s.daily_notification_time, '09:00:00') AS daily_notification_time,
        COALESCE(s.timezone, 'UTC') AS timezone,
        s.reminder_days_before,
        COALESCE(s.notify_on_overdue, TRUE) AS notify_on_overdue,
        s.quiet_hours_start,
        s.quiet_hours_end,
        COALESCE(s.auto_archive_completed, FALSE) AS auto_archive_completed,
        COALESCE(s.archive_after_days, 30) AS archive_after_days,
        COALESCE(s.backup_frequency, 'weekly') AS backup_frequency,
        s.last_backup_date,
        COALESCE(s.data_retention_days, 365) AS data_retention_days
      FROM users u
      LEFT JOIN user_settings s ON u.id = s.user_id
    `)

    return result.rows
  }

  const logSchedulerStatus = () => {
    console.log('✅ Notification scheduler initialized (per-minute checks)')
    console.log('   - Daily notifications respect user-defined time & timezone')
    console.log('   - Reminders follow user timezone and reminder_days_before')
    console.log('   - Overdue notifications respect user timezone')
  }

  // Daily notifications - check every minute and send at user-defined time
  cron.schedule('* * * * *', async () => {
    try {
      const pool = getDbPool()
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const userSettings = await fetchUserSettings(pool)

      for (const row of userSettings) {
        const userId = Number(row.user_id)
        if (!userId) continue
        if (!row.notifications_enabled || !row.daily_notifications) continue

        const userTimeInfo = getUserTimeInfo(row.timezone)
        const targetTime = normalizeTimeString(row.daily_notification_time, DEFAULT_DAILY_TIME)

        if (userTimeInfo.time !== targetTime) {
          continue
        }

        if (isWithinQuietHours(userTimeInfo.minutesOfDay, row.quiet_hours_start, row.quiet_hours_end)) {
          continue
        }

        if (dailyNotificationTracker.get(userId) === userTimeInfo.isoDate) {
          continue
        }

        const todosResult = await pool.query(
          `SELECT t.*
           FROM todos t
           WHERE t.user_id = $1
             AND t.completed = false 
             AND t.due_date IS NOT NULL
             AND t.due_date >= $2
             AND t.due_date < $3
           ORDER BY t.due_date ASC`,
          [userId, today, tomorrow]
        )

        if (todosResult.rows.length === 0) {
          dailyNotificationTracker.set(userId, userTimeInfo.isoDate)
          continue
        }

        const todoList = todosResult.rows
          .map((todo, index) => {
            const priorityEmoji = todo.priority === 'high' ? '🔴' : todo.priority === 'medium' ? '🟡' : todo.priority === 'low' ? '🔵' : ''
            return `${index + 1}. ${priorityEmoji} ${todo.text}`
          })
          .join('\n')

        const message = `📋 <b>Задачи на сегодня:</b>\n\n${todoList}\n\n<i>Всего задач: ${todosResult.rows.length}</i>`

        await sendNotification(userId, message)
        dailyNotificationTracker.set(userId, userTimeInfo.isoDate)
      }
    } catch (error: any) {
      console.error('Error in daily notifications scheduler:', error)
    }
  }, {
    timezone: 'UTC'
  })

  // Reminders - check every minute, respect user timezone (time from daily settings)
  cron.schedule('* * * * *', async () => {
    try {
      const pool = getDbPool()
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const userSettings = await fetchUserSettings(pool)

      for (const row of userSettings) {
        const userId = Number(row.user_id)
        if (!userId) continue
        if (!row.notifications_enabled) continue

        const reminderDays = parseNumberArray(row.reminder_days_before, [1])
        if (reminderDays.length === 0) continue

        const userTimeInfo = getUserTimeInfo(row.timezone)
        const reminderTime = normalizeTimeString(row.daily_notification_time, DEFAULT_DAILY_TIME)

        if (userTimeInfo.time !== reminderTime) {
          continue
        }

        if (isWithinQuietHours(userTimeInfo.minutesOfDay, row.quiet_hours_start, row.quiet_hours_end)) {
          continue
        }

        if (reminderNotificationTracker.get(userId) === userTimeInfo.isoDate) {
          continue
        }

        let notificationsSent = 0

        for (const daysBefore of reminderDays) {
          if (Number.isNaN(daysBefore)) continue

          const reminderDateStart = new Date(today)
          reminderDateStart.setDate(reminderDateStart.getDate() + daysBefore)
          reminderDateStart.setHours(0, 0, 0, 0)

          const reminderDateEnd = new Date(reminderDateStart)
          reminderDateEnd.setHours(23, 59, 59, 999)

          const todosResult = await pool.query(
            `SELECT t.*
             FROM todos t
             WHERE t.user_id = $1
               AND t.completed = false
               AND t.due_date IS NOT NULL
               AND t.due_date >= $2
               AND t.due_date <= $3
             ORDER BY t.due_date ASC`,
            [userId, reminderDateStart, reminderDateEnd]
          )

          if (todosResult.rows.length === 0) {
            continue
          }

          const todoList = todosResult.rows
            .map((todo, index) => {
              const priorityEmoji = todo.priority === 'high' ? '🔴' : todo.priority === 'medium' ? '🟡' : todo.priority === 'low' ? '🔵' : ''
              const dueDate = new Date(todo.due_date).toLocaleDateString('ru-RU')
              return `${index + 1}. ${priorityEmoji} ${todo.text} (${dueDate})`
            })
            .join('\n')

          const message = `🌅 <b>Напоминание о задачах на ${daysBefore === 1 ? 'завтра' : `+${daysBefore} дней`}:</b>\n\n${todoList}\n\n<i>Всего задач: ${todosResult.rows.length}</i>`

          await sendNotification(userId, message)
          notificationsSent++
        }

        if (notificationsSent > 0) {
          reminderNotificationTracker.set(userId, userTimeInfo.isoDate)
        } else {
          // Даже если задач нет, считаем день обработанным для уменьшения нагрузки
          reminderNotificationTracker.set(userId, userTimeInfo.isoDate)
        }
      }
    } catch (error: any) {
      console.error('Error in reminders scheduler:', error)
    }
  }, {
    timezone: 'UTC'
  })

  // Auto-backup data - check daily at 2 AM UTC
  cron.schedule('0 2 * * *', async () => {
    try {
      const pool = getDbPool()
      const userSettings = await fetchUserSettings(pool)

      for (const row of userSettings) {
        const userId = Number(row.user_id)
        if (!userId) continue

        // Check if backup is needed based on backup_frequency
        const lastBackup = row.last_backup_date ? new Date(row.last_backup_date) : null
        const now = new Date()
        let shouldBackup = false

        if (!lastBackup) {
          shouldBackup = true
        } else {
          const daysSinceLastBackup = Math.floor((now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60 * 24))
          switch (row.backup_frequency) {
            case 'daily':
              shouldBackup = daysSinceLastBackup >= 1
              break
            case 'weekly':
              shouldBackup = daysSinceLastBackup >= 7
              break
            case 'monthly':
              shouldBackup = daysSinceLastBackup >= 30
              break
          }
        }

        if (shouldBackup) {
          // Perform backup by calling export API internally
          try {
            const exportUrl = `http://localhost:${process.env.PORT || 3000}/api/export/json`
            const response = await fetch(exportUrl, {
              headers: {
                'x-telegram-user-id': userId.toString()
              }
            })

            if (response.ok) {
              console.log(`Auto-backup completed for user ${userId}`)
            } else {
              console.error(`Auto-backup failed for user ${userId}: ${response.status}`)
            }
          } catch (error) {
            console.error(`Auto-backup error for user ${userId}:`, error)
          }
        }
      }
    } catch (error: any) {
      console.error('Error in auto-backup scheduler:', error)
    }
  }, {
    timezone: 'UTC'
  })

  // Data cleanup - check daily at 3 AM UTC
  cron.schedule('0 3 * * *', async () => {
    try {
      const pool = getDbPool()
      const userSettings = await fetchUserSettings(pool)

      for (const row of userSettings) {
        const userId = Number(row.user_id)
        if (!userId) continue

        // Get data retention days setting
        const dataRetentionDays = row.data_retention_days || 365
        const retentionDate = new Date()
        retentionDate.setDate(retentionDate.getDate() - dataRetentionDays)

        // Delete old completed todos beyond retention period
        const result = await pool.query(
          `DELETE FROM todos
           WHERE user_id = $1
             AND completed = true
             AND updated_at < $2`,
          [userId, retentionDate]
        )

        if (result.rowCount && result.rowCount > 0) {
          console.log(`Data cleanup: deleted ${result.rowCount} old completed todos for user ${userId}`)
        }
      }
    } catch (error: any) {
      console.error('Error in data cleanup scheduler:', error)
    }
  }, {
    timezone: 'UTC'
  })

  // Auto-archive completed tasks - check daily at midnight UTC
  cron.schedule('0 0 * * *', async () => {
    try {
      const pool = getDbPool()
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const userSettings = await fetchUserSettings(pool)

      for (const row of userSettings) {
        const userId = Number(row.user_id)
        if (!userId) continue
        if (!row.auto_archive_completed) continue

        const archiveAfterDays = row.archive_after_days || 30
        const archiveDate = new Date(today)
        archiveDate.setDate(archiveDate.getDate() - archiveAfterDays)

        // Delete completed tasks older than archive_after_days
        const result = await pool.query(
          `DELETE FROM todos
           WHERE user_id = $1
             AND completed = true
             AND updated_at < $2`,
          [userId, archiveDate]
        )

        if (result.rowCount && result.rowCount > 0) {
          console.log(`Auto-archived ${result.rowCount} completed tasks for user ${userId}`)
        }
      }
    } catch (error: any) {
      console.error('Error in auto-archive scheduler:', error)
    }
  }, {
    timezone: 'UTC'
  })

  // Overdue notifications - check every minute, respect timezone
  cron.schedule('* * * * *', async () => {
    try {
      const pool = getDbPool()
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const userSettings = await fetchUserSettings(pool)

      for (const row of userSettings) {
        const userId = Number(row.user_id)
        if (!userId) continue
        if (!row.notifications_enabled || !row.notify_on_overdue) continue

        const userTimeInfo = getUserTimeInfo(row.timezone)
        const overdueTime = normalizeTimeString(row.daily_notification_time, DEFAULT_DAILY_TIME)

        if (userTimeInfo.time !== overdueTime) {
          continue
        }

        if (isWithinQuietHours(userTimeInfo.minutesOfDay, row.quiet_hours_start, row.quiet_hours_end)) {
          continue
        }

        if (overdueNotificationTracker.get(userId) === userTimeInfo.isoDate) {
          continue
        }

        const result = await pool.query(
          `SELECT t.*
           FROM todos t
           WHERE t.user_id = $1
             AND t.completed = false
             AND t.due_date IS NOT NULL
             AND t.due_date < $2
           ORDER BY t.due_date ASC`,
          [userId, today]
        )

        if (result.rows.length === 0) {
          overdueNotificationTracker.set(userId, userTimeInfo.isoDate)
          continue
        }

        const todoList = result.rows
          .map((todo, index) => {
            const priorityEmoji = todo.priority === 'high' ? '🔴' : todo.priority === 'medium' ? '🟡' : todo.priority === 'low' ? '🔵' : ''
            const dueDate = new Date(todo.due_date).toLocaleDateString('ru-RU')
            const daysOverdue = Math.floor((today.getTime() - new Date(todo.due_date).getTime()) / (1000 * 60 * 60 * 24))
            return `${index + 1}. ${priorityEmoji} ${todo.text}\n   📅 ${dueDate} (${daysOverdue} дн. назад)`
          })
          .join('\n\n')

        const message = `⚠️ <b>Просроченные задачи:</b>\n\n${todoList}\n\n<i>Всего просрочено: ${result.rows.length}</i>`

        await sendNotification(userId, message)
        overdueNotificationTracker.set(userId, userTimeInfo.isoDate)
      }
    } catch (error: any) {
      console.error('Error in overdue notifications scheduler:', error)
    }
  }, {
    timezone: 'UTC'
  })

  logSchedulerStatus()
})

