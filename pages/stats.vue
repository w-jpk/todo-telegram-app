<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <!-- Header -->
    <AppHeader title="Stats" />

    <!-- Content Area -->
    <div class="pt-16 pb-20 px-4">
      <!-- Time Period Selector -->
      <div class="flex space-x-2 mb-6 overflow-x-auto scrollbar-hide">
        <button
          v-for="period in timePeriods"
          :key="period"
          :class="{
            'bg-blue-500 text-white': activePeriod === period,
            'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400': activePeriod !== period
          }"
          class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium shadow-sm cursor-pointer"
          @click="activePeriod = period"
        >
          {{ period }}
        </button>
      </div>

      <!-- Overview Cards -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalCompleted }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="text-2xl font-bold text-blue-500">{{ completionRate }}%</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="text-2xl font-bold text-green-500">{{ averageDaily }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Daily Average</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="text-2xl font-bold text-purple-500">{{ currentStreak }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
        </div>
      </div>

      <!-- Completion Rate Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
        <h3 class="font-medium text-gray-900 dark:text-white mb-4">Tasks by Priority</h3>
        <div class="relative h-32">
          <svg viewBox="0 0 300 120" class="w-full h-full">
            <defs>
              <linearGradient id="highGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#b91c1c;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="mediumGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#d97706;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#b45309;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="lowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#16a34a;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#15803d;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect v-for="(priority, index) in priorityStats" :key="priority.level" :x="index * 50 + 20" :y="100 - (priority.total * 80 / Math.max(...priorityStats.map(p => p.total), 1))" :width="30" :height="(priority.total * 80 / Math.max(...priorityStats.map(p => p.total), 1))" :fill="`url(#${priority.level.toLowerCase()}Gradient)`" rx="4" class="transition-all duration-500 hover:opacity-80" />
            <text v-for="(priority, index) in priorityStats" :key="priority.level + '-label'" :x="index * 50 + 35" y="115" text-anchor="middle" class="text-xs fill-gray-600 dark:fill-gray-400 font-medium">{{ priority.level }}</text>
            <text v-for="(priority, index) in priorityStats" :key="priority.level + '-value'" :x="index * 50 + 35" :y="95 - (priority.total * 80 / Math.max(...priorityStats.map(p => p.total), 1))" text-anchor="middle" class="text-xs fill-white font-semibold">{{ priority.total }}</text>
          </svg>
        </div>
      </div>

      <!-- Category Distribution -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-6 text-lg">Tasks by Category</h3>
        <div class="flex flex-col lg:flex-row items-center justify-between">
          <div class="relative w-40 h-40 mb-6 lg:mb-0">
            <svg viewBox="0 0 160 160" class="w-full h-full drop-shadow-xl">
              <!-- Background circle for donut effect -->
              <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" stroke-width="12" class="dark:stroke-gray-600" />
              <circle cx="80" cy="80" r="35" fill="#ffffff" class="dark:fill-gray-800" />

              <defs>
                <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="3" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.15)"/>
                </filter>
              </defs>

              <!-- Donut slices -->
              <path v-for="slice in pieSlices" :key="slice.name" :d="slice.path" :fill="slice.color" filter="url(#donutShadow)" class="transition-all duration-300 hover:opacity-80" stroke="#ffffff" stroke-width="2" />

              <!-- Center text -->
              <text x="80" y="75" text-anchor="middle" class="text-lg font-bold fill-gray-900 dark:fill-white">{{ categoryStats.length }}</text>
              <text x="80" y="90" text-anchor="middle" class="text-xs fill-gray-600 dark:fill-gray-400">Categories</text>
            </svg>
          </div>

          <div class="flex-1 lg:ml-8 space-y-3 w-full lg:w-auto">
            <div v-for="(category, index) in categoryStats" :key="category.name"
                 class="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:shadow-md transition-all duration-200 group">
              <div class="flex items-center space-x-4">
                <div class="relative">
                  <div class="w-5 h-5 rounded-full shadow-lg ring-2 ring-white dark:ring-gray-800" :style="{ backgroundColor: category.color }"></div>
                  <div class="absolute -top-1 -right-1 w-3 h-3 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <span class="text-xs font-bold" :style="{ color: category.color }">{{ index + 1 }}</span>
                  </div>
                </div>
                <div>
                  <span class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">{{ category.name }}</span>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ Math.round((category.count / categoryStats.reduce((sum, c) => sum + c.count, 0)) * 100) }}% of total</div>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <div class="text-right">
                  <div class="text-lg font-bold text-gray-900 dark:text-white">{{ category.count }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">tasks</div>
                </div>
                <div class="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                  <div class="h-3 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"
                       :style="{ width: (category.count / Math.max(...categoryStats.map(c => c.count))) * 100 + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Priority Level Analytics -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
        <h3 class="font-medium text-gray-900 dark:text-white mb-4">Tasks by Priority</h3>
        <div class="space-y-4">
          <div v-for="priority in priorityStats" :key="priority.level" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 transition-all duration-200 hover:shadow-md">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-3">
                <div class="w-4 h-4 rounded-full shadow-sm" :style="{ backgroundColor: priority.color }"></div>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ priority.level }}</span>
              </div>
              <span class="text-sm font-bold text-gray-600 dark:text-gray-400">{{ priority.percentage }}%</span>
            </div>
            <div class="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-4 mb-2 shadow-inner">
              <div
                :style="{ width: priority.percentage + '%', backgroundColor: priority.color }"
                class="h-4 rounded-full transition-all duration-1000 ease-out shadow-sm"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>{{ priority.completed }} completed</span>
              <span>{{ priority.total - priority.completed }} pending</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Daily Progress Heatmap -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
        <h3 class="font-medium text-gray-900 dark:text-white mb-4">Daily Activity</h3>
        <div class="overflow-x-auto">
          <div :class="`grid gap-2 ${heatmapGridClass}`">
            <div v-for="day in heatmapData" :key="day.date" class="text-center group">
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">{{ day.dayName }}</div>
              <div
                :class="getHeatmapColor(day.intensity)"
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl mx-auto flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer group-hover:brightness-110"
              >
                <span class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white drop-shadow-sm">{{ day.day }}</span>
              </div>
              <div class="mt-1 text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{{ Math.round(day.intensity * 100) }}%</div>
            </div>
          </div>
        </div>
        <div class="flex justify-center items-center mt-4 space-x-2 text-xs text-gray-600 dark:text-gray-400">
          <span>Less</span>
          <div class="flex space-x-1">
            <div class="w-3 h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div class="w-3 h-3 rounded bg-blue-200 dark:bg-blue-900"></div>
            <div class="w-3 h-3 rounded bg-blue-300 dark:bg-blue-800"></div>
            <div class="w-3 h-3 rounded bg-blue-400 dark:bg-blue-700"></div>
            <div class="w-3 h-3 rounded bg-blue-500 dark:bg-blue-600"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      <!-- Performance Insights -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 mb-6 text-white">
        <h3 class="font-medium mb-3">Performance Insights</h3>
        <div class="space-y-2">
          <div v-if="productivityPeakDay" class="flex items-start space-x-2">
            <i class="fas fa-lightbulb text-yellow-300 mt-0.5"></i>
            <p class="text-sm">Your productivity peaks on {{ productivityPeakDay }}. Consider scheduling important tasks during these days.</p>
          </div>
          <div v-if="currentStreak > 0" class="flex items-start space-x-2">
            <i class="fas fa-trophy text-yellow-300 mt-0.5"></i>
            <p class="text-sm">Great job! You've maintained a {{ currentStreak }}-day completion streak. Keep up the momentum!</p>
          </div>
          <div v-if="completionTrend !== null" class="flex items-start space-x-2">
            <i :class="completionTrend >= 0 ? 'fas fa-chart-line text-green-300' : 'fas fa-chart-line text-red-300'" class="mt-0.5"></i>
            <p class="text-sm">Your completion rate {{ completionTrend >= 0 ? 'improved' : 'decreased' }} by {{ Math.abs(completionTrend) }}% compared to last {{ activePeriod.toLowerCase() }}.</p>
          </div>
          <div v-if="mostProductiveCategory" class="flex items-start space-x-2">
            <i class="fas fa-star text-yellow-300 mt-0.5"></i>
            <p class="text-sm">Your most productive category is {{ mostProductiveCategory }} with {{ mostProductiveCount }} completed tasks.</p>
          </div>
          <div v-if="parseFloat(averageDaily) > 0" class="flex items-start space-x-2">
            <i class="fas fa-calendar-check text-green-300 mt-0.5"></i>
            <p class="text-sm">You're completing an average of {{ averageDaily }} tasks per day. {{ parseFloat(averageDaily) >= 3 ? 'Excellent productivity!' : parseFloat(averageDaily) >= 1.5 ? 'Good progress!' : 'Keep building momentum!' }}</p>
          </div>
        </div>
      </div>

      <!-- Completion Overview Line Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 class="font-medium text-gray-900 dark:text-white mb-4">Completion Overview</h3>
        <div class="relative h-32">
          <svg viewBox="0 0 300 120" class="w-full h-full">
            <defs>
              <linearGradient id="completedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0.05" />
              </linearGradient>
              <linearGradient id="pendingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#ef4444;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#ef4444;stop-opacity:0.05" />
              </linearGradient>
            </defs>

            <!-- Grid lines -->
            <line x1="0" y1="20" x2="300" y2="20" stroke="#e5e7eb" stroke-width="1" class="dark:stroke-gray-600" />
            <line x1="0" y1="40" x2="300" y2="40" stroke="#e5e7eb" stroke-width="1" class="dark:stroke-gray-600" />
            <line x1="0" y1="60" x2="300" y2="60" stroke="#e5e7eb" stroke-width="1" class="dark:stroke-gray-600" />
            <line x1="0" y1="80" x2="300" y2="80" stroke="#e5e7eb" stroke-width="1" class="dark:stroke-gray-600" />
            <line x1="0" y1="100" x2="300" y2="100" stroke="#e5e7eb" stroke-width="1" class="dark:stroke-gray-600" />

            <!-- Area under completed line -->
            <polygon
              :points="`20,100 ${completedLinePoints} 280,100`"
              fill="url(#completedGradient)"
              class="transition-all duration-500"
            />

            <!-- Area under pending line -->
            <polygon
              :points="`20,100 ${pendingLinePoints} 280,100`"
              fill="url(#pendingGradient)"
              class="transition-all duration-500"
            />

            <!-- Line for completed tasks -->
            <polyline
              :points="completedLinePoints"
              fill="none"
              stroke="#3b82f6"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="drop-shadow-sm"
            />

            <!-- Line for pending tasks -->
            <polyline
              :points="pendingLinePoints"
              fill="none"
              stroke="#ef4444"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="drop-shadow-sm"
            />

            <!-- Data points for completed -->
            <circle v-for="(point, index) in chartData" :key="'completed-' + index"
              :cx="20 + index * (260 / Math.max(chartData.length - 1, 1))"
              :cy="80 - (point.completed * 60 / Math.max(...chartData.map(d => Math.max(d.completed, d.pending)), 1))"
              r="4" fill="#3b82f6" stroke="#ffffff" stroke-width="2" class="drop-shadow-sm" />

            <!-- Data points for pending -->
            <circle v-for="(point, index) in chartData" :key="'pending-' + index"
              :cx="20 + index * (260 / Math.max(chartData.length - 1, 1))"
              :cy="80 - (point.pending * 60 / Math.max(...chartData.map(d => Math.max(d.completed, d.pending)), 1))"
              r="4" fill="#ef4444" stroke="#ffffff" stroke-width="2" class="drop-shadow-sm" />
          </svg>
        </div>
        <div class="flex justify-center space-x-6 mt-4">
          <span class="flex items-center text-sm">
            <div class="w-4 h-4 bg-blue-500 rounded-full mr-2 shadow-sm"></div>
            <span class="text-gray-700 dark:text-gray-300 font-medium">Completed</span>
          </span>
          <span class="flex items-center text-sm">
            <div class="w-4 h-4 bg-red-500 rounded-full mr-2 shadow-sm"></div>
            <span class="text-gray-700 dark:text-gray-300 font-medium">Pending</span>
          </span>
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
import AppHeader from '~/components/AppHeader.vue'

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
const { fetchSettings } = useSettings()

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
  // Calculate average tasks completed per day for the selected period
  const periodDays = activePeriod.value === 'Weekly' ? 7 : activePeriod.value === 'Monthly' ? 30 : 1
  const recentCompleted = periodFilteredTodos.value.filter(t => t.completed).length
  return (recentCompleted / periodDays).toFixed(1)
})

const currentStreak = computed(() => {
  // Calculate current streak of days with at least one completed task within the selected period
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const periodDays = activePeriod.value === 'Weekly' ? 7 : activePeriod.value === 'Monthly' ? 30 : 1

  for (let i = 0; i < periodDays; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)

    const hasCompleted = periodFilteredTodos.value.some(t => {
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

    // Donut chart: outer radius 70, inner radius 35
    const outerRadius = 70
    const innerRadius = 35
    const centerX = 80
    const centerY = 80

    // Outer arc points
    const x1 = centerX + outerRadius * Math.cos((startAngle * Math.PI) / 180)
    const y1 = centerY + outerRadius * Math.sin((startAngle * Math.PI) / 180)
    const x2 = centerX + outerRadius * Math.cos((endAngle * Math.PI) / 180)
    const y2 = centerY + outerRadius * Math.sin((endAngle * Math.PI) / 180)

    // Inner arc points
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
  const periodDays = activePeriod.value === 'Weekly' ? 7 : activePeriod.value === 'Monthly' ? 30 : 1
  const today = new Date()

  for (let i = periodDays - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    const dayTasks = periodFilteredTodos.value.filter(t => {
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
  const days = []
  const periodDays = activePeriod.value === 'Weekly' ? 7 : activePeriod.value === 'Monthly' ? 30 : 1

  for (let i = periodDays - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const dayTodos = todos.value.filter(todo => {
      const todoDate = new Date(todo.createdAt)
      todoDate.setHours(0, 0, 0, 0)
      return todoDate.getTime() === date.getTime()
    })

    days.push({
      date: date.toISOString().split('T')[0],
      completed: dayTodos.filter(t => t.completed).length,
      pending: dayTodos.filter(t => !t.completed).length,
      total: dayTodos.length
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
  const periodDays = activePeriod.value === 'Weekly' ? 7 : activePeriod.value === 'Monthly' ? 30 : 1
  if (periodDays <= 7) return 'grid-cols-7'
  if (periodDays <= 14) return 'grid-cols-7' // Still 7 columns but more rows
  return 'grid-cols-10' // For monthly, use 10 columns
})

const productivityPeakDay = computed(() => {
  // Find the day with most completed tasks
  const dayStats: Record<string, number> = {}
  periodFilteredTodos.value.forEach(todo => {
    if (todo.completed && todo.updatedAt) {
      const day = new Date(todo.updatedAt).toLocaleDateString('en-US', { weekday: 'long' })
      dayStats[day] = (dayStats[day] || 0) + 1
    }
  })

  const maxDay = Object.entries(dayStats).reduce((max, [day, count]) =>
    count > max.count ? { day, count } : max, { day: '', count: 0 })

  return maxDay.count > 0 ? maxDay.day : null
})

const completionTrend = computed(() => {
  // Compare current period with previous period
  const currentPeriod = periodFilteredTodos.value.filter(t => t.completed).length
  const periodDays = activePeriod.value === 'Weekly' ? 7 : activePeriod.value === 'Monthly' ? 30 : 1
  const currentRate = periodFilteredTodos.value.length > 0 ? (currentPeriod / periodFilteredTodos.value.length) * 100 : 0

  // Calculate previous period
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

onMounted(async () => {
  await Promise.all([fetchProjects(), fetchTodos(), fetchSettings()])
})
</script>

