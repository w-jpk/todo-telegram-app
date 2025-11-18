import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTodos } from '~/composables/useTodos'
import { createMockTodo, createMockCreateTodoDto } from '../utils/test-helpers'

// Mock $fetch globally
const mockFetch = vi.fn() as any
mockFetch.raw = vi.fn()
mockFetch.create = vi.fn(() => mockFetch)
global.$fetch = mockFetch

describe('useTodos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({ data: [] })
  })

  it('should return expected properties', () => {
    const result = useTodos()

    expect(result).toHaveProperty('todos')
    expect(result).toHaveProperty('filter')
    expect(result).toHaveProperty('loading')
    expect(result).toHaveProperty('error')
    expect(result).toHaveProperty('activeTodos')
    expect(result).toHaveProperty('completedTodos')
    expect(result).toHaveProperty('filteredTodos')
    expect(result).toHaveProperty('activeCount')
    expect(result).toHaveProperty('fetchTodos')
    expect(result).toHaveProperty('createTodo')
    expect(result).toHaveProperty('updateTodo')
    expect(result).toHaveProperty('deleteTodo')
    expect(result).toHaveProperty('clearCompleted')
    expect(result).toHaveProperty('setFilter')
  })

  it('should initialize with correct default values', () => {
    const result = useTodos()

    expect(result.todos.value).toEqual([])
    expect(result.filter.value).toBe('all')
    expect(result.loading.value).toBe(false)
    expect(result.error.value).toBe(null)
  })

  it('should filter todos correctly', async () => {
    const { fetchTodos, todos, setFilter, filteredTodos } = useTodos()
    
    const todo1 = createMockTodo({ id: '1', completed: false, text: 'Active Todo' })
    const todo2 = createMockTodo({ id: '2', completed: true, text: 'Completed Todo' })
    
    mockFetch.mockResolvedValueOnce({ data: [todo1, todo2] })
    await fetchTodos()

    setFilter('active')
    expect(filteredTodos.value).toHaveLength(1)
    expect(filteredTodos.value[0].id).toBe('1')

    setFilter('completed')
    expect(filteredTodos.value).toHaveLength(1)
    expect(filteredTodos.value[0].id).toBe('2')

    setFilter('all')
    expect(filteredTodos.value).toHaveLength(2)
  })

  it('should calculate active count correctly', async () => {
    const { fetchTodos, todos, activeCount } = useTodos()
    
    const mockTodos = [
      createMockTodo({ id: '1', completed: false }),
      createMockTodo({ id: '2', completed: true }),
      createMockTodo({ id: '3', completed: false })
    ]

    mockFetch.mockResolvedValueOnce({ data: mockTodos })
    await fetchTodos()

    expect(activeCount.value).toBe(2)
  })

  it('should fetch todos successfully', async () => {
    const mockTodos = [
      createMockTodo({ id: '1', text: 'Todo 1' }),
      createMockTodo({ id: '2', text: 'Todo 2' })
    ]
    
    mockFetch.mockResolvedValue({ data: mockTodos })
    
    const { fetchTodos, todos, loading } = useTodos()
    
    await fetchTodos()
    
    expect(mockFetch).toHaveBeenCalledWith('/api/todos', {
      method: 'GET',
      headers: expect.objectContaining({
        'x-telegram-user-id': expect.any(String)
      })
    })
    expect(todos.value).toHaveLength(2)
    expect(loading.value).toBe(false)
  })

  it('should handle fetch todos error', async () => {
    const errorMessage = 'Failed to fetch todos'
    mockFetch.mockRejectedValue(new Error(errorMessage))
    
    const { fetchTodos, error, loading } = useTodos()
    
    await fetchTodos()
    
    expect(error.value).toBe(errorMessage)
    expect(loading.value).toBe(false)
  })

  it('should create todo successfully', async () => {
    const newTodo = createMockTodo({ id: 'new-id', text: 'New Todo' })
    mockFetch.mockResolvedValue({ data: newTodo })
    
    const { createTodo, todos } = useTodos()
    const todoData = createMockCreateTodoDto({ text: 'New Todo' })
    
    const result = await createTodo(todoData)
    
    expect(result).toEqual(newTodo)
    expect(mockFetch).toHaveBeenCalledWith('/api/todos', {
      method: 'POST',
      headers: expect.any(Object),
      body: todoData
    })
  })

  it('should not fetch todos if userId is missing', async () => {
    const { fetchTodos } = useTodos()

    // Mock useNuxtApp to return null user
    vi.mocked(useNuxtApp).mockReturnValueOnce({
      $telegram: { user: null }
    } as any)

    await fetchTodos()

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should handle network errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { fetchTodos, error } = useTodos()

    await fetchTodos()

    expect(error.value).toBe('Network error')
  })

  it('should handle empty response', async () => {
    mockFetch.mockResolvedValueOnce({ data: null })

    const { fetchTodos, todos } = useTodos()

    await fetchTodos()

    expect(todos.value).toEqual([])
  })

  it('should handle malformed response data', async () => {
    mockFetch.mockResolvedValueOnce({ data: 'invalid' })

    const { fetchTodos, todos } = useTodos()

    await fetchTodos()

    expect(todos.value).toEqual([])
  })

  it('should handle create todo with invalid data', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Invalid data'))

    const { createTodo, error } = useTodos()
    const invalidData = { text: '' } // Invalid: empty text

    const result = await createTodo(invalidData as any)

    expect(result).toBe(null)
    expect(error.value).toBe('Invalid data')
  })

  it('should handle update todo with non-existent id', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Todo not found'))

    const { updateTodo, error } = useTodos()

    const result = await updateTodo('non-existent-id', { completed: true })

    expect(result).toBe(null)
    expect(error.value).toBe('Todo not found')
  })

  it('should handle delete todo with non-existent id', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Todo not found'))

    const { deleteTodo, error } = useTodos()

    const result = await deleteTodo('non-existent-id')

    expect(result).toBe(false)
    expect(error.value).toBe('Todo not found')
  })

  it('should handle clear completed with no completed todos', async () => {
    mockFetch.mockResolvedValueOnce({})

    const { clearCompleted } = useTodos()

    const result = await clearCompleted()

    expect(result).toBe(true)
  })

  it('should handle concurrent operations', async () => {
    mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100)))

    const { fetchTodos, loading } = useTodos()

    // Start multiple concurrent requests
    const promises = [fetchTodos(), fetchTodos(), fetchTodos()]

    await Promise.all(promises)

    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('should handle very large todo lists', async () => {
    const largeTodoList = Array.from({ length: 1000 }, (_, i) =>
      createMockTodo({ id: `todo-${i}`, text: `Todo ${i}` })
    )

    mockFetch.mockResolvedValueOnce({ data: largeTodoList })

    const { fetchTodos, todos } = useTodos()

    await fetchTodos()

    expect(todos.value).toHaveLength(1000)
  })

  it('should handle todos with special characters', async () => {
    const specialTodo = createMockTodo({
      text: 'Todo with émojis 🎉 and spëcial chärs',
      description: 'Description with <script>alert("xss")</script>'
    })

    mockFetch.mockResolvedValueOnce({ data: [specialTodo] })

    const { fetchTodos, todos } = useTodos()

    await fetchTodos()

    expect(todos.value[0].text).toBe('Todo with émojis 🎉 and spëcial chärs')
  })
})