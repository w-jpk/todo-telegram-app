import type { Todo, Project, CreateTodoDto, UpdateTodoDto } from '~/types/todo'

/**
 * Test helper utilities for creating mock data
 */

export const mockUserId = 123456789

export function createMockTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'test-todo-id-' + Math.random().toString(36).substr(2, 9),
    text: 'Test Todo',
    description: 'Test Description',
    completed: false,
    priority: 'medium',
    userId: mockUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }
}

export function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'test-project-id-' + Math.random().toString(36).substr(2, 9),
    name: 'Test Project',
    color: '#2481cc',
    userId: mockUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }
}

export function createMockCreateTodoDto(overrides: Partial<CreateTodoDto> = {}): CreateTodoDto {
  return {
    text: 'New Test Todo',
    priority: 'medium',
    ...overrides
  }
}

export function createMockUpdateTodoDto(overrides: Partial<UpdateTodoDto> = {}): UpdateTodoDto {
  return {
    text: 'Updated Test Todo',
    ...overrides
  }
}

export function createMockSettings(overrides: Partial<any> = {}): any {
  return {
    userId: mockUserId,
    language: 'en',
    theme: 'light',
    notificationsEnabled: true,
    dailyNotifications: true,
    dailyNotificationTime: '09:00',
    ...overrides
  }
}

export function createMockUpdateSettingsDto(overrides: Partial<any> = {}): any {
  return {
    language: 'ru',
    theme: 'dark',
    ...overrides
  }
}

export function createMockRecurrenceRule(overrides: Partial<any> = {}): any {
  return {
    type: 'daily',
    interval: 1,
    ...overrides
  }
}

export function createMockRecurringTodo(overrides: Partial<any> = {}): any {
  return {
    ...createMockTodo(),
    isRecurring: true,
    recurrenceRule: createMockRecurrenceRule(),
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    ...overrides
  }
}

/**
 * Wait for async operations to complete
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Mock fetch response
 */
export function createMockFetchResponse(data: any, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data)
  }
}

