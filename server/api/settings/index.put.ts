import { getDbPool, validateUserId } from '~/server/utils/db'
import type { UserSettings, UpdateUserSettingsDto } from '~/types/todo'

export default defineEventHandler(async (event) => {
  const userId = validateUserId(getHeader(event, 'x-telegram-user-id'))
  
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

    if (body.theme !== undefined) {
      updates.push(`theme = $${paramIndex++}`)
      values.push(body.theme)
    }

    if (body.language !== undefined) {
      updates.push(`language = $${paramIndex++}`)
      values.push(body.language)
    }

    // Advanced notifications
    if ((body as any).vibrationEnabled !== undefined) {
      updates.push(`vibration_enabled = $${paramIndex++}`)
      values.push((body as any).vibrationEnabled)
    }

    // App behavior
    if ((body as any).defaultPriority !== undefined) {
      updates.push(`default_priority = $${paramIndex++}`)
      values.push((body as any).defaultPriority)
    }

    if ((body as any).defaultSortBy !== undefined) {
      updates.push(`default_sort_by = $${paramIndex++}`)
      values.push((body as any).defaultSortBy)
    }

    if ((body as any).autoArchiveCompleted !== undefined) {
      updates.push(`auto_archive_completed = $${paramIndex++}`)
      values.push((body as any).autoArchiveCompleted)
    }

    if ((body as any).archiveAfterDays !== undefined) {
      updates.push(`archive_after_days = $${paramIndex++}`)
      values.push((body as any).archiveAfterDays)
    }

    if ((body as any).showCompletedTasks !== undefined) {
      updates.push(`show_completed_tasks = $${paramIndex++}`)
      values.push((body as any).showCompletedTasks)
    }

    if ((body as any).confirmDeleteTask !== undefined) {
      updates.push(`confirm_delete_task = $${paramIndex++}`)
      values.push((body as any).confirmDeleteTask)
    }

    // Appearance
    if ((body as any).fontSize !== undefined) {
      updates.push(`font_size = $${paramIndex++}`)
      values.push((body as any).fontSize)
    }

    if ((body as any).animationsEnabled !== undefined) {
      updates.push(`animations_enabled = $${paramIndex++}`)
      values.push((body as any).animationsEnabled)
    }

    if ((body as any).compactView !== undefined) {
      updates.push(`compact_view = $${paramIndex++}`)
      values.push((body as any).compactView)
    }

    // Language & Region
    if ((body as any).dateFormat !== undefined) {
      updates.push(`date_format = $${paramIndex++}`)
      values.push((body as any).dateFormat)
    }

    if ((body as any).timeFormat !== undefined) {
      updates.push(`time_format = $${paramIndex++}`)
      values.push((body as any).timeFormat)
    }

    // Data & Sync
    if ((body as any).autoSync !== undefined) {
      updates.push(`auto_sync = $${paramIndex++}`)
      values.push((body as any).autoSync)
    }

    if ((body as any).syncFrequency !== undefined) {
      updates.push(`sync_frequency = $${paramIndex++}`)
      values.push((body as any).syncFrequency)
    }

    if ((body as any).backupFrequency !== undefined) {
      updates.push(`backup_frequency = $${paramIndex++}`)
      values.push((body as any).backupFrequency)
    }

    if ((body as any).dataRetentionDays !== undefined) {
      updates.push(`data_retention_days = $${paramIndex++}`)
      values.push((body as any).dataRetentionDays)
    }

    // Privacy & Security
    if ((body as any).analyticsEnabled !== undefined) {
      updates.push(`analytics_enabled = $${paramIndex++}`)
      values.push((body as any).analyticsEnabled)
    }

    if ((body as any).crashReportingEnabled !== undefined) {
      updates.push(`crash_reporting_enabled = $${paramIndex++}`)
      values.push((body as any).crashReportingEnabled)
    }

    if ((body as any).dataEncryptionEnabled !== undefined) {
      updates.push(`data_encryption_enabled = $${paramIndex++}`)
      values.push((body as any).dataEncryptionEnabled)
    }

    // Profile
    if ((body as any).displayName !== undefined) {
      updates.push(`display_name = $${paramIndex++}`)
      values.push((body as any).displayName)
    }

    if ((body as any).bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`)
      values.push((body as any).bio)
    }

    if ((body as any).profileVisibility !== undefined) {
      updates.push(`profile_visibility = $${paramIndex++}`)
      values.push((body as any).profileVisibility)
    }
    
    if (updates.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No fields to update'
      })
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    // Add userId to values array, then use paramIndex for WHERE clause
    values.push(userId)
    const userIdParamIndex = paramIndex
    
    // Check if settings exist, if not create them
    const existing = await pool.query(
      'SELECT user_id FROM user_settings WHERE user_id = $1',
      [userId]
    )
    
    if (existing.rows.length === 0) {
      // Create default settings first
      await pool.query(
        `INSERT INTO user_settings (user_id, notifications_enabled, daily_notifications, daily_notification_time, reminder_days_before, notify_on_create, notify_on_update, notify_on_overdue, theme, language)
         VALUES ($1, TRUE, TRUE, '09:00:00', ARRAY[1, 3], FALSE, FALSE, TRUE, 'light', 'en')`,
        [userId]
      )
    }
    
    const result = await pool.query(
      `UPDATE user_settings 
       SET ${updates.join(', ')}
       WHERE user_id = $${userIdParamIndex}
       RETURNING *`,
      values
    )
    
    const row = result.rows[0]
    const settings: UserSettings = {
      userId: parseInt(row.user_id),
      // Basic notifications
      notificationsEnabled: row.notifications_enabled,
      dailyNotifications: row.daily_notifications,
      dailyNotificationTime: row.daily_notification_time,
      reminderDaysBefore: row.reminder_days_before || [1, 3],
      notifyOnCreate: row.notify_on_create,
      notifyOnUpdate: row.notify_on_update,
      notifyOnOverdue: row.notify_on_overdue,
      // Advanced notifications
      vibrationEnabled: row.vibration_enabled ?? true,
      // App behavior
      defaultPriority: row.default_priority || 'medium',
      defaultSortBy: row.default_sort_by || 'dueDate',
      autoArchiveCompleted: row.auto_archive_completed ?? false,
      archiveAfterDays: row.archive_after_days ?? 30,
      showCompletedTasks: row.show_completed_tasks ?? true,
      confirmDeleteTask: row.confirm_delete_task ?? true,
      // Appearance
      timezone: row.timezone || 'UTC',
      theme: row.theme || 'light',
      fontSize: row.font_size || 'medium',
      animationsEnabled: row.animations_enabled ?? true,
      compactView: row.compact_view ?? false,
      // Language & Region
      language: row.language || 'en',
      dateFormat: row.date_format || 'DD/MM/YYYY',
      timeFormat: row.time_format || '24h',
      // Data & Sync
      autoSync: row.auto_sync ?? true,
      syncFrequency: row.sync_frequency || 'daily',
      backupFrequency: row.backup_frequency || 'weekly',
      dataRetentionDays: row.data_retention_days ?? 365,
      // Privacy & Security
      analyticsEnabled: row.analytics_enabled ?? true,
      crashReportingEnabled: row.crash_reporting_enabled ?? true,
      dataEncryptionEnabled: row.data_encryption_enabled ?? true,
      // Profile
      profileVisibility: row.profile_visibility || 'private',
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

