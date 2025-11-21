export type TodoPriority = 'none' | 'low' | 'medium' | 'high'

export interface Project {
  id: string
  name: string
  color: string
  userId: number
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  id: string
  name: string
  color: string
  userId: number
  createdAt: Date
  updatedAt: Date
}

export interface RecurrenceRule {
  type: RecurrenceType
  interval: number // every N days/weeks/months/years
  endDate?: Date
  daysOfWeek?: number[] // for weekly recurrence (0-6, Sunday-Saturday)
  dayOfMonth?: number // for monthly recurrence
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
  parentId?: string
  subtasks?: Todo[]
  tags?: Tag[]
  recurrenceRule?: RecurrenceRule
  isRecurring?: boolean
  recurrenceParentId?: string // ID of the original recurring task
  order?: number
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
  parentId?: string
  tagIds?: string[]
  dueDate?: Date
  recurrenceRule?: RecurrenceRule
}

export interface UpdateTodoDto {
  text?: string
  description?: string
  completed?: boolean
  priority?: TodoPriority
  projectId?: string
  tagIds?: string[]
  dueDate?: Date
  recurrenceRule?: RecurrenceRule
}

export interface CreateTagDto {
  name: string
  color?: string
}

export interface UpdateTagDto {
  name?: string
  color?: string
}

export interface CreateProjectDto {
  name: string
  color?: string
}

export interface UpdateProjectDto {
  name?: string
  color?: string
}

export type SortOption = 'dueDate' | 'priority' | 'createdAt' | 'text'
export type FontSize = 'small' | 'medium' | 'large'
export type SyncFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual'
export type BackupFrequency = 'daily' | 'weekly' | 'monthly' | 'manual'
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface UserSettings {
  userId: number
  // Basic notifications
  notificationsEnabled: boolean
  dailyNotifications: boolean
  dailyNotificationTime: string // HH:mm:ss format
  reminderDaysBefore: number[]
  notifyOnOverdue: boolean

  // Advanced notifications
  quietHoursStart?: string // HH:mm format
  quietHoursEnd?: string // HH:mm format
  vibrationEnabled: boolean

  // App behavior
  defaultPriority: TodoPriority
  defaultSortBy: SortOption
  autoArchiveCompleted: boolean
  archiveAfterDays: number
  showCompletedTasks: boolean
  confirmDeleteTask: boolean

  // Appearance
  timezone: string
  theme: 'light' | 'dark' | 'auto'
  accentColor?: string
  fontSize: FontSize
  animationsEnabled: boolean
  compactView: boolean

  // Language & Region
  language: string
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  timeFormat: '12h' | '24h'

  // Data & Sync
  autoSync: boolean
  syncFrequency: SyncFrequency
  backupFrequency: BackupFrequency
  dataRetentionDays: number
  lastBackupDate?: Date

  // Privacy & Security
  analyticsEnabled: boolean
  crashReportingEnabled: boolean
  dataEncryptionEnabled: boolean

  // Profile
  displayName?: string
  bio?: string
  profileVisibility: 'public' | 'private' | 'contacts'

  createdAt: Date
  updatedAt: Date
}

export interface UpdateUserSettingsDto {
  // Basic notifications
  notificationsEnabled?: boolean
  dailyNotifications?: boolean
  dailyNotificationTime?: string
  reminderDaysBefore?: number[]
  notifyOnOverdue?: boolean

  // Advanced notifications
  quietHoursStart?: string
  quietHoursEnd?: string
  vibrationEnabled?: boolean

  // App behavior
  defaultPriority?: TodoPriority
  defaultSortBy?: SortOption
  autoArchiveCompleted?: boolean
  archiveAfterDays?: number
  showCompletedTasks?: boolean
  confirmDeleteTask?: boolean

  // Appearance
  timezone?: string
  theme?: 'light' | 'dark' | 'auto'
  accentColor?: string
  fontSize?: FontSize
  animationsEnabled?: boolean
  compactView?: boolean

  // Language & Region
  language?: string
  dateFormat?: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  timeFormat?: '12h' | '24h'

  // Data & Sync
  autoSync?: boolean
  syncFrequency?: SyncFrequency
  backupFrequency?: BackupFrequency
  dataRetentionDays?: number
  lastBackupDate?: Date

  // Privacy & Security
  analyticsEnabled?: boolean
  crashReportingEnabled?: boolean
  dataEncryptionEnabled?: boolean

  // Profile
  displayName?: string
  bio?: string
  profileVisibility?: 'public' | 'private' | 'contacts'
}

