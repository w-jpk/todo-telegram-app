-- Database Initialization Script for Todo Telegram App
-- Run this script to create all required tables and indexes

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  username VARCHAR(255),
  language_code VARCHAR(10),
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#2481cc',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

-- Create todos table
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
);

-- Create user_settings table
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
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_project_id ON todos(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_notifications ON user_settings(notifications_enabled, daily_notifications);

-- Create default "Inbox" project for existing users
INSERT INTO projects (id, user_id, name, color)
SELECT gen_random_uuid(), id, 'Inbox', '#2481cc'
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM projects WHERE projects.user_id = users.id AND projects.name = 'Inbox'
);

-- Create default settings for existing users
INSERT INTO user_settings (user_id, notifications_enabled, daily_notifications, daily_notification_time, reminder_days_before, notify_on_create, notify_on_update, notify_on_overdue)
SELECT id, TRUE, TRUE, '09:00:00', ARRAY[1, 3], FALSE, FALSE, TRUE
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM user_settings WHERE user_settings.user_id = users.id
);