import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRecurringTasks } from '~/composables/useRecurringTasks'
import { createMockRecurringTodo, createMockRecurrenceRule, createMockTodo } from '../utils/test-helpers'

describe('useRecurringTasks', () => {
  let mockCreateTodo: any

  beforeEach(() => {
    mockCreateTodo = vi.fn()
    vi.clearAllMocks()
  })

  it('should return expected properties', () => {
    const result = useRecurringTasks()

    expect(result).toHaveProperty('calculateNextDate')
    expect(result).toHaveProperty('shouldGenerateInstance')
    expect(result).toHaveProperty('generateNextInstance')
    expect(result).toHaveProperty('processRecurringTasks')
    expect(result).toHaveProperty('getRecurrenceDescription')
  })

  it('should calculate next date for daily recurrence', () => {
    const { calculateNextDate } = useRecurringTasks()
    const baseDate = new Date('2023-01-01')
    const rule = createMockRecurrenceRule({ type: 'daily', interval: 1 })

    const nextDate = calculateNextDate(baseDate, rule)

    expect(nextDate.getDate()).toBe(2)
    expect(nextDate.getMonth()).toBe(0)
    expect(nextDate.getFullYear()).toBe(2023)
  })

  it('should calculate next date for weekly recurrence', () => {
    const { calculateNextDate } = useRecurringTasks()
    const baseDate = new Date('2023-01-01') // Sunday
    const rule = createMockRecurrenceRule({ type: 'weekly', interval: 1, daysOfWeek: [1] }) // Monday

    const nextDate = calculateNextDate(baseDate, rule)

    expect(nextDate.getDay()).toBe(1) // Monday
  })

  it('should calculate next date for monthly recurrence', () => {
    const { calculateNextDate } = useRecurringTasks()
    const baseDate = new Date('2023-01-01')
    const rule = createMockRecurrenceRule({ type: 'monthly', interval: 1, dayOfMonth: 15 })

    const nextDate = calculateNextDate(baseDate, rule)

    expect(nextDate.getDate()).toBe(15)
    expect(nextDate.getMonth()).toBe(0)
    expect(nextDate.getFullYear()).toBe(2023)
  })

  it('should calculate next date for yearly recurrence', () => {
    const { calculateNextDate } = useRecurringTasks()
    const baseDate = new Date('2023-01-01')
    const rule = createMockRecurrenceRule({ type: 'yearly', interval: 1 })

    const nextDate = calculateNextDate(baseDate, rule)

    expect(nextDate.getFullYear()).toBe(2024)
  })

  it('should determine if instance should be generated', () => {
    const { shouldGenerateInstance } = useRecurringTasks()

    const pastDueTodo = createMockRecurringTodo({
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      completed: false
    })

    const futureDueTodo = createMockRecurringTodo({
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      completed: false
    })

    const completedTodo = createMockRecurringTodo({
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      completed: true
    })

    expect(shouldGenerateInstance(pastDueTodo)).toBe(true)
    expect(shouldGenerateInstance(futureDueTodo)).toBe(false)
    expect(shouldGenerateInstance(completedTodo)).toBe(false)
  })

  it('should generate next instance', async () => {
    const mockNewTodo = createMockRecurringTodo({ id: 'new-id' })
    mockCreateTodo.mockResolvedValue(mockNewTodo)

    const { generateNextInstance } = useRecurringTasks(mockCreateTodo)
    const todo = createMockRecurringTodo()

    const result = await generateNextInstance(todo)

    expect(result).toEqual(mockNewTodo)
    expect(mockCreateTodo).toHaveBeenCalled()
  })

  it('should not generate instance if end date reached', async () => {
    const { generateNextInstance } = useRecurringTasks(mockCreateTodo)
    const todo = createMockRecurringTodo({
      recurrenceRule: createMockRecurrenceRule({
        endDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
      })
    })

    const result = await generateNextInstance(todo)

    expect(result).toBe(null)
    expect(mockCreateTodo).not.toHaveBeenCalled()
  })

  it('should process recurring tasks', async () => {
    const mockNewTodo = createMockRecurringTodo({ id: 'new-id' })
    mockCreateTodo.mockResolvedValue(mockNewTodo)

    const { processRecurringTasks } = useRecurringTasks(mockCreateTodo)

    const todos = [
      createMockRecurringTodo({ id: '1' }),
      createMockTodo({ id: '2', isRecurring: false }),
      createMockRecurringTodo({ id: '3', completed: true })
    ]

    await processRecurringTasks(todos)

    expect(mockCreateTodo).toHaveBeenCalledTimes(1)
  })

  it('should get recurrence description for daily', () => {
    const { getRecurrenceDescription } = useRecurringTasks()
    const rule = createMockRecurrenceRule({ type: 'daily', interval: 1 })

    const description = getRecurrenceDescription(rule)

    expect(description).toBe('Ежедневно')
  })

  it('should get recurrence description for weekly with days', () => {
    const { getRecurrenceDescription } = useRecurringTasks()
    const rule = createMockRecurrenceRule({ type: 'weekly', interval: 1, daysOfWeek: [1, 3] })

    const description = getRecurrenceDescription(rule)

    expect(description).toContain('Еженедельно')
  })

  it('should get recurrence description with end date', () => {
    const { getRecurrenceDescription } = useRecurringTasks()
    const endDate = new Date('2023-12-31')
    const rule = createMockRecurrenceRule({ type: 'daily', interval: 1, endDate })

    const description = getRecurrenceDescription(rule)

    expect(description).toContain('до')
  })
})