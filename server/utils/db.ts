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
    
    // Create todos table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
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

