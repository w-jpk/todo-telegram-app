import { Pool } from 'pg'

let pool: Pool | null = null

let schemaInitialized = false

export function getDbPool(): Pool {
  if (!pool) {
    const config = useRuntimeConfig()
    const databaseUrl = config.databaseUrl
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set')
    }
    
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
    
    // Initialize database schema asynchronously (don't await to avoid blocking)
    if (!schemaInitialized) {
      initializeSchema(pool).then(() => {
        schemaInitialized = true
      }).catch((error) => {
        console.error('Error initializing database schema:', error)
        // Don't throw - allow app to continue, schema might already exist
      })
    }
  }
  
  return pool
}

async function initializeSchema(pool: Pool) {
  const client = await pool.connect()
  
  try {
    // Create users table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255),
        username VARCHAR(255),
        language_code VARCHAR(10),
        is_premium BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create projects table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(7) DEFAULT '#2481cc',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, name)
      )
    `)
    
    // Create todos table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
        parent_id UUID REFERENCES todos(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        priority VARCHAR(10) DEFAULT 'none' CHECK (priority IN ('none', 'low', 'medium', 'high')),
        due_date TIMESTAMP,
        recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('daily', 'weekly', 'monthly', 'yearly')),
        recurrence_interval INTEGER DEFAULT 1,
        recurrence_end_date TIMESTAMP,
        recurrence_days_of_week INTEGER[],
        recurrence_day_of_month INTEGER,
        is_recurring BOOLEAN DEFAULT FALSE,
        recurrence_parent_id UUID REFERENCES todos(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create index on user_id for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id)
    `)
    
    // Create index on completed for filtering
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed)
    `)
    
    // Create index on due_date for notifications
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date)
    `)
    
    // Create index on priority for filtering
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority)
    `)
    
    // Create index on project_id for filtering
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_todos_project_id ON todos(project_id)
    `)
    
    // Create index on projects user_id
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)
    `)
    
    // Create index on parent_id for subtasks
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_todos_parent_id ON todos(parent_id)
    `)
    
    // Create index on recurring fields
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_todos_is_recurring ON todos(is_recurring)
    `)
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_todos_recurrence_parent_id ON todos(recurrence_parent_id)
    `)
    
    // Create tags table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(50) NOT NULL,
        color VARCHAR(7) DEFAULT '#6366f1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, name)
      )
    `)
    
    // Create index on tags user_id
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id)
    `)
    
    // Create todo_tags junction table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS todo_tags (
        todo_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
        tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (todo_id, tag_id)
      )
    `)
    
    // Create indexes on todo_tags
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_todo_tags_todo_id ON todo_tags(todo_id)
    `)
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_todo_tags_tag_id ON todo_tags(tag_id)
    `)
    
    // Create user_settings table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        notifications_enabled BOOLEAN DEFAULT TRUE,
        daily_notifications BOOLEAN DEFAULT TRUE,
        daily_notification_time TIME DEFAULT '09:00:00',
        reminder_days_before INTEGER[] DEFAULT ARRAY[1, 3],
        notify_on_create BOOLEAN DEFAULT FALSE,
        notify_on_update BOOLEAN DEFAULT FALSE,
        notify_on_overdue BOOLEAN DEFAULT TRUE,
        timezone VARCHAR(50) DEFAULT 'UTC',
        theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
        language VARCHAR(10) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Add missing columns to user_settings table if they don't exist
    try {
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS vibration_enabled BOOLEAN DEFAULT TRUE`)
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS default_priority VARCHAR(10) DEFAULT 'medium'`)
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS default_sort_by VARCHAR(20) DEFAULT 'dueDate'`)
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS auto_archive_completed BOOLEAN DEFAULT FALSE`)
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS archive_after_days INTEGER DEFAULT 30`)
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS show_completed_tasks BOOLEAN DEFAULT TRUE`)
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS confirm_delete_task BOOLEAN DEFAULT TRUE`)
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS font_size VARCHAR(10) DEFAULT 'medium'`)
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS animations_enabled BOOLEAN DEFAULT TRUE`)
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS compact_view BOOLEAN DEFAULT FALSE`)
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY'`)
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS time_format VARCHAR(10) DEFAULT '24h'`)
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS auto_sync BOOLEAN DEFAULT TRUE`)
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS sync_frequency VARCHAR(20) DEFAULT 'daily'`)
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS backup_frequency VARCHAR(20) DEFAULT 'weekly'`)
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS data_retention_days INTEGER DEFAULT 365`)
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS analytics_enabled BOOLEAN DEFAULT TRUE`)
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS crash_reporting_enabled BOOLEAN DEFAULT TRUE`)
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS data_encryption_enabled BOOLEAN DEFAULT TRUE`)
      await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20) DEFAULT 'private'`)
      console.log('✅ Updated user_settings table with additional columns')
    } catch (error) {
      console.log('ℹ️  Some columns may already exist or update skipped')
    }

    // Create index on user_settings
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_settings_notifications ON user_settings(notifications_enabled, daily_notifications)
    `)
    
    // Create default project for existing users
    await client.query(`
      INSERT INTO projects (id, user_id, name, color)
      SELECT gen_random_uuid(), id, 'Inbox', '#2481cc'
      FROM users
      WHERE NOT EXISTS (
        SELECT 1 FROM projects WHERE projects.user_id = users.id AND projects.name = 'Inbox'
      )
    `)
    
    // Create default settings for existing users
    await client.query(`
      INSERT INTO user_settings (
        user_id, notifications_enabled, daily_notifications, daily_notification_time,
        reminder_days_before, notify_on_create, notify_on_update, notify_on_overdue,
        timezone, theme, language, vibration_enabled, default_priority, default_sort_by,
        auto_archive_completed, archive_after_days, show_completed_tasks, confirm_delete_task,
        font_size, animations_enabled, compact_view, date_format, time_format,
        auto_sync, sync_frequency, backup_frequency, data_retention_days,
        analytics_enabled, crash_reporting_enabled, data_encryption_enabled, profile_visibility
      )
      SELECT
        id, TRUE, TRUE, '09:00:00', ARRAY[1, 3], FALSE, FALSE, TRUE,
        'UTC', 'light', 'en', TRUE, 'medium', 'dueDate',
        FALSE, 30, TRUE, TRUE,
        'medium', TRUE, FALSE, 'DD/MM/YYYY', '24h',
        TRUE, 'daily', 'weekly', 365,
        TRUE, TRUE, TRUE, 'private'
      FROM users
      WHERE NOT EXISTS (
        SELECT 1 FROM user_settings WHERE user_settings.user_id = users.id
      )
    `)
    
    console.log('Database schema initialized successfully')
  } catch (error) {
    console.error('Error initializing database schema:', error)
  } finally {
    client.release()
  }
}

export async function closeDbPool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}

/**
 * Explicitly initialize database schema
 * Can be called directly to ensure schema is set up
 * @returns Promise that resolves when schema is initialized
 */
export async function initializeDatabaseSchema(): Promise<void> {
  const dbPool = getDbPool()
  await initializeSchema(dbPool)
  schemaInitialized = true
}

/**
 * Validates and parses userId from header
 * In dev mode, uses default test user ID (123456789) if header is not provided
 * @param userIdHeader - The userId header value
 * @returns Parsed userId as number
 * @throws createError if userId is invalid
 */
export function validateUserId(userIdHeader: string | null | undefined): number {
  // In dev mode, use default test user ID if header is not provided
  if (!userIdHeader) {
    if (process.dev) {
      console.warn('⚠️  Dev mode: No user ID header provided, using default test user ID: 123456789')
      return 123456789
    }
    throw createError({
      statusCode: 401,
      message: 'User ID is required'
    })
  }
  
  const userId = parseInt(userIdHeader, 10)
  if (isNaN(userId) || userId <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Invalid user ID format'
    })
  }
  
  return userId
}

/**
 * Validates UUID format
 * @param id - The UUID string to validate
 * @returns true if valid UUID
 * @throws createError if UUID is invalid
 */
export function validateUUID(id: string | null | undefined): string {
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID is required'
    })
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid ID format (must be UUID)'
    })
  }
  
  return id
}

