<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <div class="fixed top-0 w-full bg-white shadow-sm z-50">
      <div class="flex items-center justify-between px-4 py-3">
        <h1 class="text-xl font-bold text-gray-900">Stats</h1>
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <i class="fas fa-user text-white text-sm"></i>
          </div>
          <button class="p-1 cursor-pointer">
            <i class="fas fa-ellipsis-v text-gray-600"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="pt-16 pb-20 px-4">
      <!-- Time Period Selector -->
      <div class="flex space-x-2 mb-6 overflow-x-auto scrollbar-hide">
        <button
          v-for="period in timePeriods"
          :key="period"
          :class="{
            'bg-blue-500 text-white': activePeriod === period,
            'bg-white text-gray-600': activePeriod !== period
          }"
          class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium shadow-sm cursor-pointer"
          @click="activePeriod = period"
        >
          {{ period }}
        </button>
      </div>

      <!-- Overview Cards -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="text-2xl font-bold text-gray-900">{{ totalCompleted }}</div>
          <div class="text-sm text-gray-600">Tasks Completed</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="text-2xl font-bold text-blue-500">{{ completionRate }}%</div>
          <div class="text-sm text-gray-600">Completion Rate</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="text-2xl font-bold text-green-500">{{ averageDaily }}</div>
          <div class="text-sm text-gray-600">Daily Average</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="text-2xl font-bold text-purple-500">{{ currentStreak }}</div>
          <div class="text-sm text-gray-600">Current Streak</div>
        </div>
      </div>

      <!-- Completion Rate Chart -->
      <div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <h3 class="font-medium text-gray-900 mb-4">Tasks by Priority</h3>
        <div class="relative h-32">
          <svg viewBox="0 0 300 120" class="w-full h-full">
            <rect v-for="(priority, index) in priorityStats" :key="priority.level" :x="index * 50 + 20" :y="100 - (priority.total * 80 / Math.max(...priorityStats.map(p => p.total), 1))" :width="30" :height="(priority.total * 80 / Math.max(...priorityStats.map(p => p.total), 1))" :fill="priority.color" />
            <text v-for="(priority, index) in priorityStats" :key="priority.level + '-label'" :x="index * 50 + 35" y="115" text-anchor="middle" class="text-xs fill-gray-600">{{ priority.level }}</text>
          </svg>
        </div>
      </div>

      <!-- Category Distribution -->
      <div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <h3 class="font-medium text-gray-900 mb-4">Tasks by Category</h3>
        <div class="flex items-center justify-between">
          <div class="relative w-32 h-32">
            <svg viewBox="0 0 120 120" class="w-full h-full">
              <circle cx="60" cy="60" r="60" fill="#f3f4f6" />
              <path v-for="slice in pieSlices" :key="slice.name" :d="slice.path" :fill="slice.color" />
            </svg>
          </div>
          <div class="flex-1 ml-6 space-y-2">
            <div v-for="category in categoryStats" :key="category.name" class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: category.color }"></div>
                <span class="text-sm text-gray-700">{{ category.name }}</span>
              </div>
              <span class="text-sm font-medium text-gray-900">{{ category.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Priority Level Analytics -->
      <div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <h3 class="font-medium text-gray-900 mb-4">Tasks by Priority</h3>
        <div class="space-y-3">
          <div v-for="priority in priorityStats" :key="priority.level" class="flex items-center space-x-3">
            <div class="w-16 text-sm text-gray-600">{{ priority.level }}</div>
            <div class="flex-1 bg-gray-200 rounded-full h-3">
              <div
                :class="priority.color"
                :style="{ width: priority.percentage + '%' }"
                class="h-3 rounded-full transition-all duration-300"
              ></div>
            </div>
            <div class="text-sm font-medium text-gray-900">{{ priority.completed }}/{{ priority.total }}</div>
          </div>
        </div>
      </div>

      <!-- Daily Progress Heatmap -->
      <div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <h3 class="font-medium text-gray-900 mb-4">Daily Activity</h3>
        <div class="grid grid-cols-7 gap-1">
          <div v-for="day in heatmapData" :key="day.date" class="text-center">
            <div class="text-xs text-gray-500 mb-1">{{ day.dayName }}</div>
            <div
              :class="getHeatmapColor(day.intensity)"
              class="w-8 h-8 rounded-lg mx-auto flex items-center justify-center"
            >
              <span class="text-xs font-medium">{{ day.day }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Insights -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 mb-6 text-white">
        <h3 class="font-medium mb-3">Performance Insights</h3>
        <div class="space-y-2">
          <div class="flex items-start space-x-2">
            <i class="fas fa-lightbulb text-yellow-300 mt-0.5"></i>
            <p class="text-sm">Your productivity peaks on Tuesday and Wednesday. Consider scheduling important tasks during these days.</p>
          </div>
          <div class="flex items-start space-x-2">
            <i class="fas fa-trophy text-yellow-300 mt-0.5"></i>
            <p class="text-sm">Great job! You've maintained a {{ currentStreak }}-day completion streak. Keep up the momentum!</p>
          </div>
          <div class="flex items-start space-x-2">
            <i class="fas fa-chart-line text-green-300 mt-0.5"></i>
            <p class="text-sm">Your work category completion rate improved by 15% this week compared to last week.</p>
          </div>
        </div>
      </div>

      <!-- Weekly Comparison -->
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <h3 class="font-medium text-gray-900 mb-4">Completion Overview</h3>
        <div class="relative h-28">
          <svg viewBox="0 0 300 100" class="w-full h-full">
            <rect x="50" :y="80 - (chartData.completed * 60 / Math.max(chartData.total, 1))" width="50" :height="(chartData.completed * 60 / Math.max(chartData.total, 1))" fill="#3b82f6" />
            <rect x="150" :y="80 - (chartData.pending * 60 / Math.max(chartData.total, 1))" width="50" :height="(chartData.pending * 60 / Math.max(chartData.total, 1))" fill="#ef4444" />
            <text x="75" y="90" text-anchor="middle" class="text-xs fill-gray-600">Completed</text>
            <text x="175" y="90" text-anchor="middle" class="text-xs fill-gray-600">Pending</text>
          </svg>
        </div>
        <div class="flex justify-between mt-3 text-xs text-gray-600">
          <span>{{ chartData.completed }} completed</span>
          <span>{{ chartData.pending }} pending</span>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
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

const { todos, activeTodos, completedTodos, fetchTodos } = useTodos()
const { projects, fetchProjects } = useProjects()

const activePeriod = ref('Weekly')
const timePeriods = ref(['Daily', 'Weekly', 'Monthly'])

const periodStart = computed(() => {
  const now = new Date()
  switch (activePeriod.value) {
    case 'Daily': return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    case 'Weekly': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case 'Monthly': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    default: return new Date(0)
  }
})

const periodFilteredTodos = computed(() => {
  return todos.value.filter(todo => {
    return todo.createdAt >= periodStart.value
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
  // Calculate average tasks completed per day (last 7 days)
  const last7Days = new Date()
  last7Days.setDate(last7Days.getDate() - 7)
  const recentCompleted = todos.value.filter(t => {
    if (!t.completed || !t.updatedAt) return false
    return new Date(t.updatedAt) >= last7Days
  }).length
  return (recentCompleted / 7).toFixed(1)
})

const currentStreak = computed(() => {
  // Calculate current streak of days with at least one completed task
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)
    
    const hasCompleted = todos.value.some(t => {
      if (!t.completed || !t.updatedAt) return false
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

  periodFilteredTodos.value.forEach(todo => {
    const category = todo.project?.name || 'Uncategorized'
    stats[category] = (stats[category] || 0) + 1
  })

  return Object.entries(stats).map(([name, count]) => {
    let color = '#6b7280'
    if (name !== 'Uncategorized') {
      const project = projects.value.find(p => p.name === name)
      if (project) {
        const index = projects.value.indexOf(project)
        color = hexColors[index % hexColors.length]
      }
    }
    return { name, count, color }
  })
})

const pieSlices = computed(() => {
  const total = categoryStats.value.reduce((sum, cat) => sum + cat.count, 0)
  if (total === 0) return []

  let currentAngle = 0
  return categoryStats.value.map(cat => {
    const angle = (cat.count / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    // Convert to path
    const radius = 60
    const x1 = radius + radius * Math.cos((startAngle * Math.PI) / 180)
    const y1 = radius + radius * Math.sin((startAngle * Math.PI) / 180)
    const x2 = radius + radius * Math.cos((endAngle * Math.PI) / 180)
    const y2 = radius + radius * Math.sin((endAngle * Math.PI) / 180)
    const largeArc = angle > 180 ? 1 : 0
    const path = `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

    return {
      path,
      color: cat.color.replace('bg-', '#').replace('-500', ''),
      name: cat.name,
      count: cat.count
    }
  })
})

const priorityStats = computed(() => {
  const stats: Record<string, { total: number; completed: number }> = {
    'High': { total: 0, completed: 0 },
    'Medium': { total: 0, completed: 0 },
    'Low': { total: 0, completed: 0 }
  }

  periodFilteredTodos.value.forEach(todo => {
    const level = todo.priority === 'high' ? 'High' : todo.priority === 'medium' ? 'Medium' : 'Low'
    stats[level].total++
    if (todo.completed) {
      stats[level].completed++
    }
  })

  const colorMap: Record<string, string> = {
    'High': '#dc2626',
    'Medium': '#d97706',
    'Low': '#16a34a'
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
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    const dayTasks = todos.value.filter(t => {
      if (!t.dueDate) return false
      const taskDate = new Date(t.dueDate)
      return getLocalDateString(taskDate) === getLocalDateString(date)
    })

    const intensity = Math.min(dayTasks.length / 5, 1) // Normalize to 0-1

    days.push({
      date: getLocalDateString(date),
      day: date.getDate(),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      intensity
    })
  }

  return days
})

const chartData = computed(() => {

  return {

    total: periodFilteredTodos.value.length,

    completed: periodFilteredTodos.value.filter(t => t.completed).length,

    pending: periodFilteredTodos.value.filter(t => !t.completed).length

  }

})

const getHeatmapColor = (intensity: number) => {
  if (intensity >= 0.8) return 'bg-blue-500 text-white'
  if (intensity >= 0.6) return 'bg-blue-400 text-white'
  if (intensity >= 0.4) return 'bg-blue-300 text-gray-700'
  if (intensity >= 0.2) return 'bg-blue-200 text-gray-700'
  return 'bg-gray-200 text-gray-600'
}

onMounted(async () => {
  await Promise.all([fetchProjects(), fetchTodos()])
})
</script>

