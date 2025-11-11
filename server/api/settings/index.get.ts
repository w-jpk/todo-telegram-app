import { getDbPool } from '~/server/utils/db'
import type { UserSettings } from '~/types/todo'

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
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    )
    
    if (result.rows.length === 0) {
      // Create default settings
      await pool.query(
        `INSERT INTO user_settings (user_id, notifications_enabled, daily_notifications, daily_notification_time, reminder_days_before, notify_on_create, notify_on_update, notify_on_overdue)
         VALUES ($1, TRUE, TRUE, '09:00:00', ARRAY[1, 3], FALSE, FALSE, TRUE)
         RETURNING *`,
        [userId]
      )
      
      const newResult = await pool.query(
        'SELECT * FROM user_settings WHERE user_id = $1',
        [userId]
      )
      
      const row = newResult.rows[0]
      const settings: UserSettings = {
        userId: parseInt(row.user_id),
        notificationsEnabled: row.notifications_enabled,
        dailyNotifications: row.daily_notifications,
        dailyNotificationTime: row.daily_notification_time,
        reminderDaysBefore: row.reminder_days_before || [1, 3],
        notifyOnCreate: row.notify_on_create,
        notifyOnUpdate: row.notify_on_update,
        notifyOnOverdue: row.notify_on_overdue,
        timezone: row.timezone || 'UTC',
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
      
      return {
        data: settings
      }
    }
    
    const row = result.rows[0]
    const settings: UserSettings = {
      userId: parseInt(row.user_id),
      notificationsEnabled: row.notifications_enabled,
      dailyNotifications: row.daily_notifications,
      dailyNotificationTime: row.daily_notification_time,
      reminderDaysBefore: row.reminder_days_before || [1, 3],
      notifyOnCreate: row.notify_on_create,
      notifyOnUpdate: row.notify_on_update,
      notifyOnOverdue: row.notify_on_overdue,
      timezone: row.timezone || 'UTC',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
    
    return {
      data: settings
    }
  } catch (error: any) {
    console.error('Error fetching user settings:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch user settings'
    })
  }
})

