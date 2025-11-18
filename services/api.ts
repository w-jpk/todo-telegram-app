import type { Todo, CreateTodoDto, UpdateTodoDto, Project, CreateProjectDto, UpdateProjectDto, UserSettings, UpdateUserSettingsDto } from '~/types/todo'

class ApiService {
  private baseURL = '/api'

  private getHeaders() {
    const { $telegram } = useNuxtApp()
    const userId = $telegram?.user?.id

    if (!userId) {
      throw new Error('User ID is not available')
    }

    const headers: Record<string, string> = {
      'x-telegram-user-id': userId.toString(),
      'Content-Type': 'application/json'
    }

    if ($telegram?.user) {
      headers['x-telegram-user-data'] = encodeURIComponent(JSON.stringify($telegram.user))
    }

    return headers
  }

  private async request<T>(endpoint: string, options: any = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: this.getHeaders(),
      ...options
    }

    try {
      const response = await $fetch<{ data: T }>(url, config)
      return response.data
    } catch (error: any) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Todos
  async getTodos(params?: { page?: number; limit?: number; completed?: boolean }) {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', params.page.toString())
    if (params?.limit) query.set('limit', params.limit.toString())
    if (params?.completed !== undefined) query.set('completed', params.completed.toString())

    return this.request<Todo[]>(`/todos?${query.toString()}`)
  }

  async createTodo(data: CreateTodoDto) {
    return this.request<Todo>('/todos', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateTodo(id: string, data: UpdateTodoDto) {
    return this.request<Todo>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteTodo(id: string) {
    return this.request<void>(`/todos/${id}`, {
      method: 'DELETE'
    })
  }

  async clearCompletedTodos() {
    return this.request<void>('/todos/clear-completed', {
      method: 'DELETE'
    })
  }

  async reorderTodos(taskIds: string[]) {
    return this.request('/todos/reorder', {
      method: 'POST',
      body: JSON.stringify({ taskIds })
    })
  }

  // Projects
  async getProjects() {
    return this.request<Project[]>('/projects')
  }

  async createProject(data: CreateProjectDto) {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateProject(id: string, data: UpdateProjectDto) {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteProject(id: string) {
    return this.request<void>(`/projects/${id}`, {
      method: 'DELETE'
    })
  }

  // Settings
  async getSettings() {
    return this.request<UserSettings>('/settings')
  }

  async updateSettings(data: UpdateUserSettingsDto) {
    return this.request<UserSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // Tags
  async getTags() {
    return this.request('/tags')
  }

  async createTag(data: { name: string; color: string }) {
    return this.request('/tags', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Export/Import
  async exportData(format: 'json' | 'csv' | 'todoist') {
    return this.request(`/export/${format}`)
  }

  async importData(data: any) {
    return this.request('/import', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

export const apiService = new ApiService()