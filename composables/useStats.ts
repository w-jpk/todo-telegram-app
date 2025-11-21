import { ref, computed } from 'vue'
import type { Todo } from '~/types/todo'

interface CategoryStat {
  name: string
  count: number
  color: string
}

interface PriorityStat {
  level: string
  completed: number
  total: number
  percentage: number
  color: string
}

interface HeatmapDay {
  date: string
  day: number
  dayName: string
  intensity: number
}

export const useStats = (todos: Ref<readonly Todo[]>, projects: Ref<readonly any[]>, settings?: Ref<any>) => {
  const { t } = useI18n()
  // Store period as key ('daily', 'weekly', 'monthly') instead of translated string
  const activePeriod = ref<'daily' | 'weekly' | 'monthly'>('weekly')
  const timePeriods = computed(() => [
    { key: 'daily' as const, label: t('stats.daily') },
    { key: 'weekly' as const, label: t('stats.weekly') },
    { key: 'monthly' as const, label: t('stats.monthly') }
  ])

  const periodStart = computed(() => {
    const now = new Date()
    const period = activePeriod.value
    if (period === 'daily') return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    if (period === 'weekly') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    if (period === 'monthly') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    return new Date(0)
  })

  const periodFilteredTodos = computed(() => {
    return todos.value.filter(todo => {
      return todo.createdAt >= periodStart.value
    })
  })

  const periodCompletedTodos = computed(() => {
    return todos.value.filter(todo => {
      return todo.completed && todo.updatedAt && todo.updatedAt >= periodStart.value
    })
  })

  const projectColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-red-500']
  const hexColors = ['#2481cc', '#7c3aed', '#059669', '#dc2626', '#ea580c', '#ca8a04']

  const getLocalDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const totalCompleted = computed(() => {
    return periodFilteredTodos.value.filter(t => t.completed).length
  })

  const completionRate = computed(() => {
    if (periodFilteredTodos.value.length === 0) return 0
    return Math.round((totalCompleted.value / periodFilteredTodos.value.length) * 100)
  })

  const averageDaily = computed(() => {
    const period = activePeriod.value
    const periodDays = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 1
    const recentCompleted = periodFilteredTodos.value.filter(t => t.completed).length
    return (recentCompleted / periodDays).toFixed(1)
  })

  const currentStreak = computed(() => {
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const period = activePeriod.value
    const periodDays = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 1

    for (let i = 0; i < periodDays; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)

      const hasCompleted = periodCompletedTodos.value.some(t => {
        if (!t.updatedAt) return false
        const updatedDate = new Date(t.updatedAt)
        updatedDate.setHours(0, 0, 0, 0)
        return updatedDate.getTime() === checkDate.getTime()
      })

      if (hasCompleted) {
        streak++
      } else if (i > 0) {
        break
      }
    }

    return streak
  })

  const categoryStats = computed(() => {
    const stats: Record<string, number> = {}
    const uncategorizedLabel = t('stats.uncategorized')

    periodCompletedTodos.value.forEach(todo => {
      const category = todo.project?.name || uncategorizedLabel
      stats[category] = (stats[category] || 0) + 1
    })

    return Object.entries(stats).map(([name, count]) => {
      let color = '#6b7280'
      if (name !== uncategorizedLabel) {
        const project = projects.value.find(p => p.name === name)
        if (project) {
          // Use project color if available, otherwise fallback to index-based color
          color = project.color || hexColors[projects.value.indexOf(project) % hexColors.length]
        }
      }
      return { name, count, color }
    })
  })

  const generatePieSlices = (categories: typeof categoryStats.value) => {
    const total = categories.reduce((sum, cat) => sum + cat.count, 0)
    if (total === 0) return []

    let currentAngle = 0
    return categories.map(cat => {
      const angle = (cat.count / total) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle = endAngle

      const outerRadius = 70
      const innerRadius = 35
      const centerX = 80
      const centerY = 80

      const x1 = centerX + outerRadius * Math.cos((startAngle * Math.PI) / 180)
      const y1 = centerY + outerRadius * Math.sin((startAngle * Math.PI) / 180)
      const x2 = centerX + outerRadius * Math.cos((endAngle * Math.PI) / 180)
      const y2 = centerY + outerRadius * Math.sin((endAngle * Math.PI) / 180)

      const x3 = centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180)
      const y3 = centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180)
      const x4 = centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180)
      const y4 = centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180)

      const largeArc = angle > 180 ? 1 : 0
      const path = `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`

      return {
        path,
        color: cat.color,
        name: cat.name,
        count: cat.count
      }
    })
  }

  const pieSlices = computed(() => generatePieSlices(categoryStats.value))

  const priorityStats = computed(() => {
    const highLabel = t('stats.high')
    const mediumLabel = t('stats.medium')
    const lowLabel = t('stats.low')
    
    const stats: Record<string, { total: number; completed: number }> = {
      [highLabel]: { total: 0, completed: 0 },
      [mediumLabel]: { total: 0, completed: 0 },
      [lowLabel]: { total: 0, completed: 0 }
    }

    periodFilteredTodos.value.forEach(todo => {
      const level = todo.priority === 'high' ? highLabel : todo.priority === 'medium' ? mediumLabel : lowLabel
      stats[level].total++
    })

    periodCompletedTodos.value.forEach(todo => {
      const level = todo.priority === 'high' ? highLabel : todo.priority === 'medium' ? mediumLabel : lowLabel
      stats[level].completed++
    })

    const colorMap: Record<string, string> = {
      [highLabel]: '#dc2626',
      [mediumLabel]: '#d97706',
      [lowLabel]: '#16a34a'
    }

    return Object.entries(stats).map(([level, data]) => ({
      level,
      completed: data.completed,
      total: data.total,
      percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      color: colorMap[level] || '#6b7280'
    }))
  })

  const heatmapData = computed(() => {
    const days: HeatmapDay[] = []
    const period = activePeriod.value
    const periodDays = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 1
    const today = new Date()
    const locale = settings?.value?.language || 'en'

    for (let i = periodDays - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const dayTasks = periodFilteredTodos.value.filter(t => {
        if (!t.dueDate) return false
        const taskDate = new Date(t.dueDate)
        return getLocalDateString(taskDate) === getLocalDateString(date)
      })

      const completedTasks = dayTasks.filter(t => t.completed).length
      const intensity = Math.min(completedTasks / 5, 1)

      days.push({
        date: getLocalDateString(date),
        day: date.getDate(),
        dayName: date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short' }),
        intensity
      })
    }

    return days
  })

  const chartData = computed(() => {
    const days = []
    const period = activePeriod.value
    const periodDays = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 1

    for (let i = periodDays - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const completedOnDate = todos.value.filter(todo => {
        if (!todo.completed || !todo.updatedAt) return false
        const updatedDate = new Date(todo.updatedAt)
        updatedDate.setHours(0, 0, 0, 0)
        return updatedDate.getTime() === date.getTime()
      }).length

      const pendingOnDate = todos.value.filter(todo => {
        if (todo.completed) return false
        const createdDate = new Date(todo.createdAt)
        createdDate.setHours(0, 0, 0, 0)
        return createdDate.getTime() === date.getTime()
      }).length

      days.push({
        date: date.toISOString().split('T')[0],
        completed: completedOnDate,
        pending: pendingOnDate,
        total: completedOnDate + pendingOnDate
      })
    }

    return days
  })

  const completedLinePoints = computed(() => {
    const maxValue = Math.max(...chartData.value.map(d => Math.max(d.completed, d.pending)), 1)
    return chartData.value.map((point, index) => {
      const x = 20 + index * (260 / Math.max(chartData.value.length - 1, 1))
      const y = 80 - (point.completed * 60 / maxValue)
      return `${x},${y}`
    }).join(' ')
  })

  const pendingLinePoints = computed(() => {
    const maxValue = Math.max(...chartData.value.map(d => Math.max(d.completed, d.pending)), 1)
    return chartData.value.map((point, index) => {
      const x = 20 + index * (260 / Math.max(chartData.value.length - 1, 1))
      const y = 80 - (point.pending * 60 / maxValue)
      return `${x},${y}`
    }).join(' ')
  })

  const heatmapGridClass = computed(() => {
    const period = activePeriod.value
    const periodDays = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 1
    if (periodDays <= 7) return 'grid-cols-7'
    if (periodDays <= 14) return 'grid-cols-7'
    return 'grid-cols-10'
  })

  const productivityPeakDay = computed(() => {
    const dayStats: Record<string, number> = {}
    const locale = settings?.value?.language || 'en'
    periodCompletedTodos.value.forEach(todo => {
      if (todo.updatedAt) {
        const day = new Date(todo.updatedAt).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long' })
        dayStats[day] = (dayStats[day] || 0) + 1
      }
    })

    const maxDay = Object.entries(dayStats).reduce((max, [day, count]) =>
      count > max.count ? { day, count } : max, { day: '', count: 0 })

    return maxDay.count > 0 ? maxDay.day : null
  })

  const completionTrend = computed(() => {
    const currentCompleted = periodCompletedTodos.value.length
    const currentTotal = periodFilteredTodos.value.length
    const currentRate = currentTotal > 0 ? (currentCompleted / currentTotal) * 100 : 0

    const period = activePeriod.value
    const periodDays = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 1
    const prevPeriodStart = new Date(periodStart.value)
    prevPeriodStart.setDate(prevPeriodStart.getDate() - periodDays)

    const prevTodos = todos.value.filter(todo => {
      return todo.createdAt >= prevPeriodStart && todo.createdAt < periodStart.value
    })

    const prevCompleted = prevTodos.filter(t => t.completed).length
    const prevRate = prevTodos.length > 0 ? (prevCompleted / prevTodos.length) * 100 : 0

    if (prevTodos.length === 0) return null
    return Math.round(currentRate - prevRate)
  })

  const mostProductiveCategory = computed(() => {
    if (categoryStats.value.length === 0) return null
    const maxCategory = categoryStats.value.reduce((max, cat) =>
      cat.count > max.count ? cat : max)
    return maxCategory.count > 0 ? maxCategory.name : null
  })

  const mostProductiveCount = computed(() => {
    if (!mostProductiveCategory.value) return 0
    const category = categoryStats.value.find(c => c.name === mostProductiveCategory.value)
    return category ? category.count : 0
  })

  const getHeatmapColor = (intensity: number) => {
    if (intensity >= 0.8) return 'bg-blue-500 dark:bg-blue-600 text-white'
    if (intensity >= 0.6) return 'bg-blue-400 dark:bg-blue-500 text-white'
    if (intensity >= 0.4) return 'bg-blue-300 dark:bg-blue-400 text-gray-700 dark:text-gray-200'
    if (intensity >= 0.2) return 'bg-blue-200 dark:bg-blue-300 text-gray-700 dark:text-gray-200'
    return 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
  }

  return {
    activePeriod,
    timePeriods,
    totalCompleted,
    completionRate,
    averageDaily,
    currentStreak,
    categoryStats,
    pieSlices,
    priorityStats,
    heatmapData,
    chartData,
    completedLinePoints,
    pendingLinePoints,
    heatmapGridClass,
    productivityPeakDay,
    completionTrend,
    mostProductiveCategory,
    mostProductiveCount,
    getHeatmapColor
  }
}