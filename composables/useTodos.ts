import type { Todo, CreateTodoDto, UpdateTodoDto, TodoFilter } from '~/types/todo'

export const useTodos = () => {
  const todos = ref<Todo[]>([])
  const filter = ref<TodoFilter>('all')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { $telegram } = useNuxtApp()
  const userId = computed(() => $telegram?.user?.id || null)

  // Computed properties
  const activeTodos = computed(() => todos.value.filter(todo => !todo.completed))
  const completedTodos = computed(() => todos.value.filter(todo => todo.completed))
  
  const filteredTodos = computed(() => {
    switch (filter.value) {
      case 'active':
        return activeTodos.value
      case 'completed':
        return completedTodos.value
      default:
        return todos.value
    }
  })

  const activeCount = computed(() => activeTodos.value.length)

  // Get headers for API requests
  const getHeaders = () => {
  const headers: Record<string, string> = {
    'x-telegram-user-id': userId.value?.toString() || ''
  }

  // Закодируй JSON, если есть данные
  if ($telegram?.user) {
    headers['x-telegram-user-data'] = encodeURIComponent(JSON.stringify($telegram.user))
  }

  return headers
}

  // Fetch todos
  const fetchTodos = async () => {
    if (!userId.value) return
    
    loading.value = true
    error.value = null
    
    try {
      const { data } = await $fetch<{ data: Todo[] }>('/api/todos', {
        method: 'GET',
        headers: getHeaders()
      })
      todos.value = data.map(todo => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
      }))
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch todos'
      console.error('Error fetching todos:', err)
    } finally {
      loading.value = false
    }
  }

  // Create todo
  const createTodo = async (todoData: CreateTodoDto) => {
    if (!userId.value) return null
    
    loading.value = true
    error.value = null
    
    try {
      const { data } = await $fetch<{ data: Todo }>('/api/todos', {
        method: 'POST',
        headers: getHeaders(),
        body: todoData
      })
      
      const newTodo = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined
      }
      
      todos.value.push(newTodo)
      return newTodo
    } catch (err: any) {
      error.value = err.message || 'Failed to create todo'
      console.error('Error creating todo:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Update todo
  const updateTodo = async (id: string, todoData: UpdateTodoDto) => {
    if (!userId.value) return null
    
    loading.value = true
    error.value = null
    
    try {
      const { data } = await $fetch<{ data: Todo }>(`/api/todos/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: todoData
      })
      
      const updatedTodo = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined
      }
      
      const index = todos.value.findIndex(t => t.id === id)
      if (index !== -1) {
        todos.value[index] = updatedTodo
      }
      
      return updatedTodo
    } catch (err: any) {
      error.value = err.message || 'Failed to update todo'
      console.error('Error updating todo:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Delete todo
  const deleteTodo = async (id: string) => {
    if (!userId.value) return false
    
    loading.value = true
    error.value = null
    
    try {
      await $fetch(`/api/todos/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      
      todos.value = todos.value.filter(t => t.id !== id)
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete todo'
      console.error('Error deleting todo:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Clear completed todos
  const clearCompleted = async () => {
    if (!userId.value) return false
    
    loading.value = true
    error.value = null
    
    try {
      await $fetch('/api/todos/clear-completed', {
        method: 'DELETE',
        headers: getHeaders()
      })
      
      todos.value = activeTodos.value
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to clear completed todos'
      console.error('Error clearing completed todos:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Set filter
  const setFilter = (newFilter: TodoFilter) => {
    filter.value = newFilter
  }

  return {
    todos: readonly(todos),
    filter: readonly(filter),
    loading: readonly(loading),
    error: readonly(error),
    activeTodos,
    completedTodos,
    filteredTodos,
    activeCount,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    clearCompleted,
    setFilter
  }
}

