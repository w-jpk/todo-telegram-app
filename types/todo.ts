export type TodoPriority = 'none' | 'low' | 'medium' | 'high'

export interface Project {
  id: string
  name: string
  color: string
  userId: number
  createdAt: Date
  updatedAt: Date
}

export interface Todo {
  id: string
  text: string
  description?: string
  completed: boolean
  priority: TodoPriority
  userId: number
  projectId?: string
  project?: Project
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
}

export type TodoFilter = 'all' | 'active' | 'completed'

export interface CreateTodoDto {
  text: string
  description?: string
  priority?: TodoPriority
  projectId?: string
  dueDate?: Date
}

export interface UpdateTodoDto {
  text?: string
  description?: string
  completed?: boolean
  priority?: TodoPriority
  projectId?: string
  dueDate?: Date
}

export interface CreateProjectDto {
  name: string
  color?: string
}

export interface UpdateProjectDto {
  name?: string
  color?: string
}

export interface UserSettings {
  userId: number
  notificationsEnabled: boolean
  dailyNotifications: boolean
  dailyNotificationTime: string // HH:mm:ss format
  reminderDaysBefore: number[]
  notifyOnCreate: boolean
  notifyOnUpdate: boolean
  notifyOnOverdue: boolean
  timezone: string
  theme: 'light' | 'dark' | 'auto'
  language: string
  createdAt: Date
  updatedAt: Date
}

export interface UpdateUserSettingsDto {
  notificationsEnabled?: boolean
  dailyNotifications?: boolean
  dailyNotificationTime?: string
  reminderDaysBefore?: number[]
  notifyOnCreate?: boolean
  notifyOnUpdate?: boolean
  notifyOnOverdue?: boolean
  timezone?: string
  theme?: 'light' | 'dark' | 'auto'
  language?: string
}

