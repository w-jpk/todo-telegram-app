import type { Todo, CreateTodoDto, UpdateTodoDto, TodoFilter } from '~/types/todo'
import { useRecurringTasks } from './useRecurringTasks'

export const useTodos = () => {
  const todos = useState<Todo[]>('todos:list', () => [])
  const filter = useState<TodoFilter>('todos:filter', () => 'all')
  const loading = useState<boolean>('todos:loading', () => false)
  const error = useState<string | null>('todos:error', () => null)
  const currentPage = useState<number>('todos:currentPage', () => 1)
  const hasNextPage = useState<boolean>('todos:hasNextPage', () => true)
  const totalCount = useState<number>('todos:totalCount', () => 0)
  const pageSize = useState<number>('todos:pageSize', () => 50)

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
    if (!userId.value) {
      throw new Error('User ID is not available. Please wait for Telegram initialization.')
    }

    const headers: Record<string, string> = {
      'x-telegram-user-id': userId.value.toString()
    }

    // Закодируй JSON, если есть данные
    if ($telegram?.user) {
      headers['x-telegram-user-data'] = encodeURIComponent(JSON.stringify($telegram.user))
    }

    return headers
  }

  // Fetch todos with pagination
  const fetchTodos = async (page: number = 1, append: boolean = false, retryCount: number = 0) => {
    if (!userId.value) {
      console.warn('[useTodos] User ID not available, cannot fetch todos')
      return
    }

    loading.value = true
    error.value = null

    try {
      const headers = getHeaders()
      
      // Log for debugging in production
      if (process.env.NODE_ENV === 'production' && retryCount === 0) {
        console.log('[useTodos] Fetching todos:', {
          userId: userId.value,
          page,
          headers: { 'x-telegram-user-id': headers['x-telegram-user-id'] }
        })
      }

      const { data, pagination } = await $fetch<{
        data: Todo[],
        pagination: {
          page: number,
          limit: number,
          total: number,
          totalPages: number,
          hasNext: boolean,
          hasPrev: boolean
        }
      }>('/api/todos', {
        method: 'GET',
        headers,
        query: {
          page,
          limit: pageSize.value
        }
      })

      const processedTodos = data.map(todo => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
      }))

      if (append) {
        todos.value = [...todos.value, ...processedTodos]
      } else {
        todos.value = processedTodos
      }

      currentPage.value = pagination.page
      hasNextPage.value = pagination.hasNext
      totalCount.value = pagination.total

      // Process recurring tasks to generate new instances if needed
      await processRecurringTasks(todos.value)
      
      if (process.env.NODE_ENV === 'production') {
        console.log('[useTodos] Successfully fetched todos:', {
          count: data.length,
          total: pagination.total,
          userId: userId.value
        })
      }
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || 'Failed to fetch todos'
      const statusCode = err.statusCode || err.status
      
      console.error('[useTodos] Error fetching todos:', {
        error: errorMessage,
        statusCode,
        userId: userId.value,
        retryCount,
        errorDetails: err
      })
      
      // Retry once if it's a 401 (unauthorized) and we have userId
      if (statusCode === 401 && userId.value && retryCount === 0) {
        console.log('[useTodos] Retrying fetch after 500ms...')
        await new Promise(resolve => setTimeout(resolve, 500))
        return fetchTodos(page, append, retryCount + 1)
      }
      
      error.value = errorMessage
    } finally {
      loading.value = false
    }
  }

  // Load next page
  const loadNextPage = async () => {
    if (hasNextPage.value && !loading.value) {
      await fetchTodos(currentPage.value + 1, true)
    }
  }

  // Reset pagination
  const resetPagination = () => {
    currentPage.value = 1
    hasNextPage.value = true
    totalCount.value = 0
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

      todos.value = [...todos.value, newTodo]
      return newTodo
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || 'Failed to create todo'
      error.value = errorMessage
      console.error('Error creating todo:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const { processRecurringTasks } = useRecurringTasks(createTodo)

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
        const nextTodos = [...todos.value]
        nextTodos[index] = updatedTodo
        todos.value = nextTodos
      }

      return updatedTodo
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || 'Failed to update todo'
      error.value = errorMessage
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
      const errorMessage = err.data?.message || err.message || 'Failed to delete todo'
      error.value = errorMessage
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

      todos.value = todos.value.filter(todo => !todo.completed)
      return true
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || 'Failed to clear completed todos'
      error.value = errorMessage
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
    currentPage: readonly(currentPage),
    hasNextPage: readonly(hasNextPage),
    totalCount: readonly(totalCount),
    pageSize: readonly(pageSize),
    activeTodos,
    completedTodos,
    filteredTodos,
    activeCount,
    fetchTodos,
    loadNextPage,
    resetPagination,
    createTodo,
    updateTodo,
    deleteTodo,
    clearCompleted,
    setFilter
  }
}

