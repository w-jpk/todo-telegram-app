import { getDbPool, validateUserId } from '~/server/utils/db'
import type { UserSettings } from '~/types/todo'

export default defineEventHandler(async (event) => {
  // Get userId header - check both lowercase and original case
  const userIdHeader = getHeader(event, 'x-telegram-user-id') || getHeader(event, 'X-Telegram-User-Id')
  const userId = validateUserId(userIdHeader)
  
  try {
    const pool = getDbPool()
    const result = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    )
    
    if (result.rows.length === 0) {
      // Create default settings
      await pool.query(
        `INSERT INTO user_settings (
          user_id, notifications_enabled, daily_notifications, daily_notification_time,
          reminder_days_before, notify_on_overdue,
          timezone, theme, language, vibration_enabled, default_priority, default_sort_by,
          auto_archive_completed, archive_after_days, show_completed_tasks, confirm_delete_task,
          font_size, animations_enabled, compact_view, date_format, time_format,
          auto_sync, sync_frequency, backup_frequency, data_retention_days,
          analytics_enabled, crash_reporting_enabled, data_encryption_enabled,
          accent_color
        ) VALUES (
          $1, TRUE, TRUE, '09:00:00', ARRAY[1, 3], TRUE,
          'UTC', 'light', 'en', TRUE, 'medium', 'dueDate',
          FALSE, 30, TRUE, TRUE, 'medium', TRUE, FALSE, 'DD/MM/YYYY', '24h',
          TRUE, 'daily', 'weekly', 365, TRUE, TRUE, TRUE,
          '#3B82F6'
        ) RETURNING *`,
        [userId]
      )
      
      const newResult = await pool.query(
        'SELECT * FROM user_settings WHERE user_id = $1',
        [userId]
      )
      
      const row = newResult.rows[0]
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
        // Data & Sync
        lastBackupDate: row.last_backup_date,
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
      // Data & Sync
      lastBackupDate: row.last_backup_date,
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

