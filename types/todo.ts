export interface Todo {
  id: string
  text: string
  completed: boolean
  userId: number
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
  dueDate?: Date
}

export interface UpdateTodoDto {
  text?: string
  completed?: boolean
  dueDate?: Date
}

