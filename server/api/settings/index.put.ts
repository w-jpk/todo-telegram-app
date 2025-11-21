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
    
    if (body.notifyOnOverdue !== undefined) {
      updates.push(`notify_on_overdue = $${paramIndex++}`)
      values.push(body.notifyOnOverdue)
    }
    
    // Advanced notifications
    if (body.quietHoursStart !== undefined) {
      updates.push(`quiet_hours_start = $${paramIndex++}`)
      values.push(body.quietHoursStart)
    }
    
    if (body.quietHoursEnd !== undefined) {
      updates.push(`quiet_hours_end = $${paramIndex++}`)
      values.push(body.quietHoursEnd)
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
    if (body.vibrationEnabled !== undefined) {
      updates.push(`vibration_enabled = $${paramIndex++}`)
      values.push(body.vibrationEnabled)
    }

    // App behavior
    if (body.defaultPriority !== undefined) {
      updates.push(`default_priority = $${paramIndex++}`)
      values.push(body.defaultPriority)
    }

    if (body.defaultSortBy !== undefined) {
      updates.push(`default_sort_by = $${paramIndex++}`)
      values.push(body.defaultSortBy)
    }

    if (body.autoArchiveCompleted !== undefined) {
      updates.push(`auto_archive_completed = $${paramIndex++}`)
      values.push(body.autoArchiveCompleted)
    }

    if (body.archiveAfterDays !== undefined) {
      updates.push(`archive_after_days = $${paramIndex++}`)
      values.push(body.archiveAfterDays)
    }

    if (body.showCompletedTasks !== undefined) {
      updates.push(`show_completed_tasks = $${paramIndex++}`)
      values.push(body.showCompletedTasks)
    }

    if (body.confirmDeleteTask !== undefined) {
      updates.push(`confirm_delete_task = $${paramIndex++}`)
      values.push(body.confirmDeleteTask)
    }

    // Appearance
    if (body.accentColor !== undefined) {
      updates.push(`accent_color = $${paramIndex++}`)
      values.push(body.accentColor)
    }

    if (body.fontSize !== undefined) {
      updates.push(`font_size = $${paramIndex++}`)
      values.push(body.fontSize)
    }

    if (body.animationsEnabled !== undefined) {
      updates.push(`animations_enabled = $${paramIndex++}`)
      values.push(body.animationsEnabled)
    }

    if (body.compactView !== undefined) {
      updates.push(`compact_view = $${paramIndex++}`)
      values.push(body.compactView)
    }

    // Language & Region
    if (body.dateFormat !== undefined) {
      updates.push(`date_format = $${paramIndex++}`)
      values.push(body.dateFormat)
    }

    if (body.timeFormat !== undefined) {
      updates.push(`time_format = $${paramIndex++}`)
      values.push(body.timeFormat)
    }

    // Data & Sync
    if (body.autoSync !== undefined) {
      updates.push(`auto_sync = $${paramIndex++}`)
      values.push(body.autoSync)
    }

    if (body.syncFrequency !== undefined) {
      updates.push(`sync_frequency = $${paramIndex++}`)
      values.push(body.syncFrequency)
    }

    if (body.backupFrequency !== undefined) {
      updates.push(`backup_frequency = $${paramIndex++}`)
      values.push(body.backupFrequency)
    }

    if (body.dataRetentionDays !== undefined) {
      updates.push(`data_retention_days = $${paramIndex++}`)
      values.push(body.dataRetentionDays)
    }

    // Privacy & Security
    if (body.analyticsEnabled !== undefined) {
      updates.push(`analytics_enabled = $${paramIndex++}`)
      values.push(body.analyticsEnabled)
    }

    if (body.crashReportingEnabled !== undefined) {
      updates.push(`crash_reporting_enabled = $${paramIndex++}`)
      values.push(body.crashReportingEnabled)
    }

    if (body.dataEncryptionEnabled !== undefined) {
      updates.push(`data_encryption_enabled = $${paramIndex++}`)
      values.push(body.dataEncryptionEnabled)
    }

    // Profile
    if (body.displayName !== undefined) {
      updates.push(`display_name = $${paramIndex++}`)
      values.push(body.displayName)
    }

    if (body.bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`)
      values.push(body.bio)
    }

    if (body.profileVisibility !== undefined) {
      updates.push(`profile_visibility = $${paramIndex++}`)
      values.push(body.profileVisibility)
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
        `INSERT INTO user_settings (user_id, notifications_enabled, daily_notifications, daily_notification_time, reminder_days_before, notify_on_overdue, theme, language, accent_color)
         VALUES ($1, TRUE, TRUE, '09:00:00', ARRAY[1, 3], TRUE, 'light', 'en', '#3B82F6')`,
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
      notifyOnOverdue: row.notify_on_overdue,
      // Advanced notifications
      quietHoursStart: row.quiet_hours_start,
      quietHoursEnd: row.quiet_hours_end,
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
      accentColor: row.accent_color || '#3B82F6',
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
      displayName: row.display_name,
      bio: row.bio,
      profileVisibility: row.profile_visibility || 'private',
      // Data & Sync
      lastBackupDate: row.last_backup_date,
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

