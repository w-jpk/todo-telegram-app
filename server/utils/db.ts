import { Pool } from 'pg'

let pool: Pool | null = null

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
    
    // Initialize database schema
    initializeSchema(pool)
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
        text TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        priority VARCHAR(10) DEFAULT 'none' CHECK (priority IN ('none', 'low', 'medium', 'high')),
        due_date TIMESTAMP,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
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
      INSERT INTO user_settings (user_id, notifications_enabled, daily_notifications, daily_notification_time, reminder_days_before, notify_on_create, notify_on_update, notify_on_overdue)
      SELECT id, TRUE, TRUE, '09:00:00', ARRAY[1, 3], FALSE, FALSE, TRUE
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
 * Validates and parses userId from header
 * @param userIdHeader - The userId header value
 * @returns Parsed userId as number
 * @throws createError if userId is invalid
 */
export function validateUserId(userIdHeader: string | null | undefined): number {
  if (!userIdHeader) {
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

