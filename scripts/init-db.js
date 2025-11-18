#!/usr/bin/env node

/**
 * Database Initialization Script
 * Creates all required tables for the Todo Telegram App
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function createTables() {
  // Database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔄 Connecting to database...');

    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    console.log('🏗️  Creating tables...');

    // Create users table
    await pool.query(`
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
    `);
    console.log('✅ Created users table');

    // Create projects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(7) DEFAULT '#2481cc',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, name)
      )
    `);
    console.log('✅ Created projects table');

    // Create todos table
    await pool.query(`
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
    `);
    console.log('✅ Created todos table');

    // Create user_settings table
    await pool.query(`
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
    `);
    console.log('✅ Created user_settings table');

    // Add new columns to existing user_settings table if they don't exist
    try {
      await pool.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto'))`);
      await pool.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en'`);
      console.log('✅ Updated user_settings table with new columns');
    } catch (error) {
      console.log('ℹ️  Columns may already exist or update skipped');
    }

    // Add new columns to existing todos table if they don't exist (for recurring tasks and subtasks)
    try {
      await pool.query(`ALTER TABLE todos ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES todos(id) ON DELETE CASCADE`);
      await pool.query(`ALTER TABLE todos ADD COLUMN IF NOT EXISTS recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('daily', 'weekly', 'monthly', 'yearly'))`);
      await pool.query(`ALTER TABLE todos ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1`);
      await pool.query(`ALTER TABLE todos ADD COLUMN IF NOT EXISTS recurrence_end_date TIMESTAMP`);
      await pool.query(`ALTER TABLE todos ADD COLUMN IF NOT EXISTS recurrence_days_of_week INTEGER[]`);
      await pool.query(`ALTER TABLE todos ADD COLUMN IF NOT EXISTS recurrence_day_of_month INTEGER`);
      await pool.query(`ALTER TABLE todos ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE`);
      await pool.query(`ALTER TABLE todos ADD COLUMN IF NOT EXISTS recurrence_parent_id UUID REFERENCES todos(id) ON DELETE CASCADE`);
      console.log('✅ Updated todos table with recurring task columns');
    } catch (error) {
      console.log('ℹ️  Columns may already exist or update skipped');
    }

    console.log('📊 Creating indexes...');

    // Create tags table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(50) NOT NULL,
        color VARCHAR(7) DEFAULT '#6366f1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, name)
      )
    `);
    console.log('✅ Created tags table');

    // Create todo_tags junction table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todo_tags (
        todo_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
        tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (todo_id, tag_id)
      )
    `);
    console.log('✅ Created todo_tags table');

    // Create indexes for todos table
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_todos_project_id ON todos(project_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_todos_parent_id ON todos(parent_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_todos_is_recurring ON todos(is_recurring)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_todos_recurrence_parent_id ON todos(recurrence_parent_id)`);

    // Create indexes for projects table
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)`);

    // Create indexes for tags table
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id)`);

    // Create indexes for todo_tags table
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_todo_tags_todo_id ON todo_tags(todo_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_todo_tags_tag_id ON todo_tags(tag_id)`);

    // Create indexes for user_settings table
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_settings_notifications ON user_settings(notifications_enabled, daily_notifications)`);

    console.log('✅ Created all indexes');

    console.log('🎯 Setting up default data...');

    // Create default "Inbox" project for existing users
    const inboxResult = await pool.query(`
      INSERT INTO projects (id, user_id, name, color)
      SELECT gen_random_uuid(), id, 'Inbox', '#2481cc'
      FROM users
      WHERE NOT EXISTS (
        SELECT 1 FROM projects WHERE projects.user_id = users.id AND projects.name = 'Inbox'
      )
    `);

    if (inboxResult.rowCount > 0) {
      console.log(`✅ Created ${inboxResult.rowCount} default "Inbox" projects`);
    }

    // Create default settings for existing users
    const settingsResult = await pool.query(`
      INSERT INTO user_settings (user_id, notifications_enabled, daily_notifications, daily_notification_time, reminder_days_before, notify_on_create, notify_on_update, notify_on_overdue, theme, language)
      SELECT id, TRUE, TRUE, '09:00:00', ARRAY[1, 3], FALSE, FALSE, TRUE, 'light', 'en'
      FROM users
      WHERE NOT EXISTS (
        SELECT 1 FROM user_settings WHERE user_settings.user_id = users.id
      )
    `);

    if (settingsResult.rowCount > 0) {
      console.log(`✅ Created default settings for ${settingsResult.rowCount} users`);
    }


    console.log('🎉 Database initialization completed successfully!');
    console.log('');
    console.log('📋 Tables created:');
    console.log('  - users');
    console.log('  - projects');
    console.log('  - todos');
    console.log('  - tags');
    console.log('  - todo_tags');
    console.log('  - user_settings');
    console.log('');
    console.log('🔍 Indexes created:');
    console.log('  - idx_todos_user_id');
    console.log('  - idx_todos_completed');
    console.log('  - idx_todos_due_date');
    console.log('  - idx_todos_priority');
    console.log('  - idx_todos_project_id');
    console.log('  - idx_todos_parent_id');
    console.log('  - idx_todos_is_recurring');
    console.log('  - idx_todos_recurrence_parent_id');
    console.log('  - idx_projects_user_id');
    console.log('  - idx_tags_user_id');
    console.log('  - idx_todo_tags_todo_id');
    console.log('  - idx_todo_tags_tag_id');
    console.log('  - idx_user_settings_notifications');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.log('');
  console.log('Please set DATABASE_URL in your .env file:');
  console.log('DATABASE_URL=postgresql://username:password@localhost:5432/database_name');
  process.exit(1);
}

// Run the script
createTables().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});