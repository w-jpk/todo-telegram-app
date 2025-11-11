import { getDbPool } from '~/server/utils/db'
import type { UserSettings, UpdateUserSettingsDto } from '~/types/todo'

export default defineEventHandler(async (event) => {
  const userId = getHeader(event, 'x-telegram-user-id')
  
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'User ID is required'
    })
  }
  
  const body = await readBody<UpdateUserSettingsDto>(event)
  
  try {
    const pool = getDbPool()
    
    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1
    
    if (body.notificationsEnabled !== undefined) {
      updates.push(`notifications_enabled = $${paramIndex++}`)
      values.push(body.notificationsEnabled)
    }
    
    if (body.dailyNotifications !== undefined) {
      updates.push(`daily_notifications = $${paramIndex++}`)
      values.push(body.dailyNotifications)
    }
    
    if (body.dailyNotificationTime !== undefined) {
      updates.push(`daily_notification_time = $${paramIndex++}`)
      values.push(body.dailyNotificationTime)
    }
    
    if (body.reminderDaysBefore !== undefined) {
      updates.push(`reminder_days_before = $${paramIndex++}`)
      values.push(body.reminderDaysBefore)
    }
    
    if (body.notifyOnCreate !== undefined) {
      updates.push(`notify_on_create = $${paramIndex++}`)
      values.push(body.notifyOnCreate)
    }
    
    if (body.notifyOnUpdate !== undefined) {
      updates.push(`notify_on_update = $${paramIndex++}`)
      values.push(body.notifyOnUpdate)
    }
    
    if (body.notifyOnOverdue !== undefined) {
      updates.push(`notify_on_overdue = $${paramIndex++}`)
      values.push(body.notifyOnOverdue)
    }
    
    if (body.timezone !== undefined) {
      updates.push(`timezone = $${paramIndex++}`)
      values.push(body.timezone)
    }
    
    if (updates.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No fields to update'
      })
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(userId)
    
    // Check if settings exist, if not create them
    const existing = await pool.query(
      'SELECT user_id FROM user_settings WHERE user_id = $1',
      [userId]
    )
    
    if (existing.rows.length === 0) {
      // Create default settings first
      await pool.query(
        `INSERT INTO user_settings (user_id, notifications_enabled, daily_notifications, daily_notification_time, reminder_days_before, notify_on_create, notify_on_update, notify_on_overdue)
         VALUES ($1, TRUE, TRUE, '09:00:00', ARRAY[1, 3], FALSE, FALSE, TRUE)`,
        [userId]
      )
    }
    
    const result = await pool.query(
      `UPDATE user_settings 
       SET ${updates.join(', ')}
       WHERE user_id = $${paramIndex++}
       RETURNING *`,
      values
    )
    
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
    console.error('Error updating user settings:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update user settings'
    })
  }
})

