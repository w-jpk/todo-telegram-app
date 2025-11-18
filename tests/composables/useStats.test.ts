import { describe, it, expect, beforeEach } from 'vitest'
import { useStats } from '~/composables/useStats'
import { createMockTodo, createMockProject } from '../utils/test-helpers'

describe('useStats', () => {
  let mockTodos: any
  let mockProjects: any

  beforeEach(() => {
    mockTodos = ref([])
    mockProjects = ref([])
  })

  it('should return expected properties', () => {
    const result = useStats(mockTodos, mockProjects)

    expect(result).toHaveProperty('activePeriod')
    expect(result).toHaveProperty('timePeriods')
    expect(result).toHaveProperty('totalCompleted')
    expect(result).toHaveProperty('completionRate')
    expect(result).toHaveProperty('averageDaily')
    expect(result).toHaveProperty('currentStreak')
    expect(result).toHaveProperty('categoryStats')
    expect(result).toHaveProperty('pieSlices')
    expect(result).toHaveProperty('priorityStats')
    expect(result).toHaveProperty('heatmapData')
    expect(result).toHaveProperty('getHeatmapColor')
  })

  it('should initialize with correct default values', () => {
    const result = useStats(mockTodos, mockProjects)

    expect(result.activePeriod.value).toBe('Weekly')
    expect(result.timePeriods.value).toEqual(['Daily', 'Weekly', 'Monthly'])
  })

  it('should calculate total completed correctly', () => {
    const todos = [
      createMockTodo({ completed: true }),
      createMockTodo({ completed: false }),
      createMockTodo({ completed: true })
    ]
    mockTodos.value = todos

    const { totalCompleted } = useStats(mockTodos, mockProjects)

    expect(totalCompleted.value).toBe(2)
  })

  it('should calculate completion rate correctly', () => {
    const todos = [
      createMockTodo({ completed: true }),
      createMockTodo({ completed: false }),
      createMockTodo({ completed: true })
    ]
    mockTodos.value = todos

    const { completionRate } = useStats(mockTodos, mockProjects)

    expect(completionRate.value).toBe(67) // 2/3 * 100 rounded
  })

  it('should calculate completion rate as 0 when no todos', () => {
    const { completionRate } = useStats(mockTodos, mockProjects)

    expect(completionRate.value).toBe(0)
  })

  it('should calculate average daily correctly for weekly period', () => {
    const todos = [
      createMockTodo({ completed: true }),
      createMockTodo({ completed: true }),
      createMockTodo({ completed: true })
    ]
    mockTodos.value = todos

    const { averageDaily } = useStats(mockTodos, mockProjects)

    expect(averageDaily.value).toBe('0.4') // 3/7
  })

  it('should calculate current streak correctly', () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const todos = [
      createMockTodo({ completed: true, updatedAt: today }),
      createMockTodo({ completed: true, updatedAt: yesterday }),
      createMockTodo({ completed: false, updatedAt: today })
    ]
    mockTodos.value = todos

    const { currentStreak } = useStats(mockTodos, mockProjects)

    expect(currentStreak.value).toBe(2)
  })

  it('should calculate category stats correctly', () => {
    const project = createMockProject({ name: 'Work' })
    mockProjects.value = [project]

    const todos = [
      createMockTodo({ completed: true, project }),
      createMockTodo({ completed: true, project }),
      createMockTodo({ completed: true }) // No project
    ]
    mockTodos.value = todos

    const { categoryStats } = useStats(mockTodos, mockProjects)

    expect(categoryStats.value).toHaveLength(2)
    const workStat = categoryStats.value.find(s => s.name === 'Work')
    expect(workStat?.count).toBe(2)
  })

  it('should calculate priority stats correctly', () => {
    const todos = [
      createMockTodo({ completed: true, priority: 'high' }),
      createMockTodo({ completed: false, priority: 'high' }),
      createMockTodo({ completed: true, priority: 'medium' }),
      createMockTodo({ completed: true, priority: 'low' })
    ]
    mockTodos.value = todos

    const { priorityStats } = useStats(mockTodos, mockProjects)

    const highStat = priorityStats.value.find(s => s.level === 'High')
    expect(highStat?.total).toBe(2)
    expect(highStat?.completed).toBe(1)
    expect(highStat?.percentage).toBe(50)
  })

  it('should generate heatmap data correctly', () => {
    const today = new Date()
    const todos = [
      createMockTodo({ completed: true, dueDate: today })
    ]
    mockTodos.value = todos

    const { heatmapData } = useStats(mockTodos, mockProjects)

    expect(heatmapData.value).toHaveLength(7) // Weekly period
    const todayData = heatmapData.value.find(d => d.day === today.getDate())
    expect(todayData?.intensity).toBe(1) // 1 completed task
  })

  it('should get correct heatmap color', () => {
    const { getHeatmapColor } = useStats(mockTodos, mockProjects)

    expect(getHeatmapColor(0.9)).toBe('bg-blue-500 dark:bg-blue-600 text-white')
    expect(getHeatmapColor(0.5)).toBe('bg-blue-300 dark:bg-blue-400 text-gray-700 dark:text-gray-200')
    expect(getHeatmapColor(0.1)).toBe('bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400')
  })

  it('should calculate most productive category', () => {
    const project1 = createMockProject({ name: 'Work' })
    const project2 = createMockProject({ name: 'Personal' })
    mockProjects.value = [project1, project2]

    const todos = [
      createMockTodo({ completed: true, project: project1 }),
      createMockTodo({ completed: true, project: project1 }),
      createMockTodo({ completed: true, project: project2 })
    ]
    mockTodos.value = todos

    const { mostProductiveCategory, mostProductiveCount } = useStats(mockTodos, mockProjects)

    expect(mostProductiveCategory.value).toBe('Work')
    expect(mostProductiveCount.value).toBe(2)
  })
})