<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <!-- Header -->
    <!-- <AppHeader title="Stats" /> -->
    <!-- Content Area -->
    <div v-if="isLoading" class="pt-16 pb-20 px-4 flex justify-center items-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
    <div v-else class="pt-16 pb-20 px-4">
      <!-- Time Period Selector and Export -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex space-x-2 overflow-x-auto scrollbar-hide">
          <button v-for="period in timePeriods" :key="period" :class="{
            'bg-blue-500 text-white': activePeriod === period,
            'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400': activePeriod !== period
          }" class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium shadow-sm cursor-pointer"
            @click="activePeriod = period">
            {{ period }}
          </button>
        </div>
        <button @click="exportStats"
          class="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium shadow-sm hover:bg-green-600 transition-colors">
          <i class="fas fa-download mr-2"></i>Export
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


      <!-- Category Distribution -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-6 text-lg">Tasks by Category</h3>
        <div class="flex flex-col lg:flex-row items-center justify-between">
          <div class="relative w-40 h-40 mb-6 lg:mb-0">
            <svg viewBox="0 0 160 160" class="w-full h-full drop-shadow-xl" aria-label="Tasks by Category Donut Chart">
              <!-- Background circle for donut effect -->
              <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" stroke-width="12"
                class="dark:stroke-gray-600" />
              <circle cx="80" cy="80" r="35" fill="#ffffff" class="dark:fill-gray-800" />

              <defs>
                <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="3" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.15)" />
                </filter>
              </defs>

              <!-- Donut slices -->
              <path v-for="slice in pieSlices" :key="slice.name" :d="slice.path" :fill="slice.color"
                filter="url(#donutShadow)" class="transition-all duration-300 hover:opacity-80" stroke="#ffffff"
                stroke-width="2" />

              <!-- Center text -->
              <text x="80" y="75" text-anchor="middle" class="text-lg font-bold fill-gray-900 dark:fill-white">{{
                categoryStats.length }}</text>
              <text x="80" y="90" text-anchor="middle"
                class="text-xs fill-gray-600 dark:fill-gray-400">Categories</text>
            </svg>
          </div>

          <div class="flex-1 lg:ml-8 space-y-3 w-full lg:w-auto">
            <div v-for="(category, index) in categoryStats" :key="category.name"
              class="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:shadow-md transition-all duration-200 group">
              <div class="flex items-center space-x-4">
                <div class="relative">
                  <div class="w-5 h-5 rounded-full shadow-lg ring-2 ring-white dark:ring-gray-800"
                    :style="{ backgroundColor: category.color }"></div>
                  <div
                    class="absolute -top-1 -right-1 w-3 h-3 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <span class="text-xs font-bold" :style="{ color: category.color }">{{ index + 1 }}</span>
                  </div>
                </div>
                <div>
                  <span
                    class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">{{
                    category.name }}</span>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{Math.round((category.count /
                    categoryStats.reduce((sum, c) => sum + c.count, 0)) * 100) }}% of total</div>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <div class="text-right">
                  <div class="text-lg font-bold text-gray-900 dark:text-white">{{ category.count }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">tasks</div>
                </div>
                <div class="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                  <div
                    class="h-3 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"
                    :style="{ width: (category.count / Math.max(...categoryStats.map(c => c.count))) * 100 + '%' }">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Priority Level Analytics -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm" aria-label="Tasks by Priority Analytics">
        <h3 class="font-medium text-gray-900 dark:text-white mb-4">Tasks by Priority</h3>
        <div class="space-y-4">
          <div v-for="priority in priorityStats" :key="priority.level"
            class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 transition-all duration-200 hover:shadow-md">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-3">
                <div class="w-4 h-4 rounded-full shadow-sm" :style="{ backgroundColor: priority.color }"></div>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ priority.level }}</span>
              </div>
              <span class="text-sm font-bold text-gray-600 dark:text-gray-400">{{ priority.percentage }}%</span>
            </div>
            <div class="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-4 mb-2 shadow-inner">
              <div :style="{ width: priority.percentage + '%', backgroundColor: priority.color }"
                class="h-4 rounded-full transition-all duration-1000 ease-out shadow-sm"></div>
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
          <div :class="`grid gap-2 ${heatmapGridClass}`" aria-label="Daily Activity Heatmap">
            <div v-for="day in heatmapData" :key="day.date" class="text-center group">
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">{{ day.dayName }}</div>
              <div :class="getHeatmapColor(day.intensity)"
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl mx-auto flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer group-hover:brightness-110">
                <span class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white drop-shadow-sm">{{ day.day
                  }}</span>
              </div>
              <div
                class="mt-1 text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {{ Math.round(day.intensity * 100) }}%</div>
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
            <p class="text-sm">Your productivity peaks on {{ productivityPeakDay }}. Consider scheduling important tasks
              during these days.</p>
          </div>
          <div v-if="currentStreak > 0" class="flex items-start space-x-2">
            <i class="fas fa-trophy text-yellow-300 mt-0.5"></i>
            <p class="text-sm">Great job! You've maintained a {{ currentStreak }}-day completion streak. Keep up the
              momentum!</p>
          </div>
          <div v-if="completionTrend !== null" class="flex items-start space-x-2">
            <i :class="completionTrend >= 0 ? 'fas fa-chart-line text-green-300' : 'fas fa-chart-line text-red-300'"
              class="mt-0.5"></i>
            <p class="text-sm">Your completion rate {{ completionTrend >= 0 ? 'improved' : 'decreased' }} by {{
              Math.abs(completionTrend) }}% compared to last {{ activePeriod.toLowerCase() }}.</p>
          </div>
          <div v-if="mostProductiveCategory" class="flex items-start space-x-2">
            <i class="fas fa-star text-yellow-300 mt-0.5"></i>
            <p class="text-sm">Your most productive category is {{ mostProductiveCategory }} with {{ mostProductiveCount
              }} completed tasks.</p>
          </div>
          <div v-if="parseFloat(averageDaily) > 0" class="flex items-start space-x-2">
            <i class="fas fa-calendar-check text-green-300 mt-0.5"></i>
            <p class="text-sm">You're completing an average of {{ averageDaily }} tasks per day. {{ parseFloat(averageDaily) >= 3 ? 'Excellent productivity!' : parseFloat(averageDaily) >= 1.5 ? 'Good progress!' : 'Keep building momentum!' }}</p>
          </div>
        </div>
      </div>

      <!-- Completion Overview Line Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-6">
        <h3 class="font-medium text-gray-900 dark:text-white mb-4">Completion Overview</h3>
        <div class="relative h-32">
          <svg viewBox="0 0 300 120" class="w-full h-full" aria-label="Completion Overview Line Chart">
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
            <polygon :points="`20,100 ${completedLinePoints} 280,100`" fill="url(#completedGradient)"
              class="transition-all duration-500" />

            <!-- Area under pending line -->
            <polygon :points="`20,100 ${pendingLinePoints} 280,100`" fill="url(#pendingGradient)"
              class="transition-all duration-500" />

            <!-- Line for completed tasks -->
            <polyline :points="completedLinePoints" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"
              stroke-linejoin="round" class="drop-shadow-sm" />

            <!-- Line for pending tasks -->
            <polyline :points="pendingLinePoints" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round"
              stroke-linejoin="round" class="drop-shadow-sm" />

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

      <!-- Productivity Trends -->
      <!-- <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 class="font-medium text-gray-900 dark:text-white mb-4">Productivity Trends</h3>
        <div class="relative h-40">
          <svg viewBox="0 0 300 140" class="w-full h-full" aria-label="Productivity Trends Chart">
            <defs>
              <linearGradient id="productivityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#10b981;stop-opacity:0.05" />
              </linearGradient>
            </defs>

            
            <line x1="0" y1="20" x2="300" y2="20" stroke="#e5e7eb" stroke-width="1" class="dark:stroke-gray-600" />
            <line x1="0" y1="50" x2="300" y2="50" stroke="#e5e7eb" stroke-width="1" class="dark:stroke-gray-600" />
            <line x1="0" y1="80" x2="300" y2="80" stroke="#e5e7eb" stroke-width="1" class="dark:stroke-gray-600" />
            <line x1="0" y1="110" x2="300" y2="110" stroke="#e5e7eb" stroke-width="1" class="dark:stroke-gray-600" />

          
            <polygon :points="`20,130 ${productivityTrendPoints} 280,130`" fill="url(#productivityGradient)"
              class="transition-all duration-500" />

         
            <polyline :points="productivityTrendPoints" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round"
              stroke-linejoin="round" class="drop-shadow-sm" />

          
            <circle v-for="(point, index) in productivityTrendData" :key="'productivity-' + index"
              :cx="20 + index * (260 / Math.max(productivityTrendData.length - 1, 1))"
              :cy="130 - (point.value * 100 / Math.max(...productivityTrendData.map(d => d.value), 1))"
              r="4" fill="#10b981" stroke="#ffffff" stroke-width="2" class="drop-shadow-sm" />
          </svg>
        </div>
        <div class="flex justify-center mt-4">
          <span class="flex items-center text-sm">
            <div class="w-4 h-4 bg-emerald-500 rounded-full mr-2 shadow-sm"></div>
            <span class="text-gray-700 dark:text-gray-300 font-medium">Productivity Score</span>
          </span>
        </div>
        <div class="mt-4 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Productivity score based on task completion rate and consistency over time
          </p>
        </div>
      </div> -->
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Todo } from '~/types/todo'
import AppHeader from '~/components/AppHeader.vue'
import BottomNavigation from '~/components/BottomNavigation.vue'

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

const {
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
} = useStats(todos as any, projects as any)

// Productivity trend data (mock data for demonstration)
const productivityTrendData = computed(() => {
  // Generate productivity scores based on completion patterns
  const days = activePeriod.value === 'Week' ? 7 : activePeriod.value === 'Month' ? 30 : 90
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    value: Math.random() * 100 + 20 // Mock productivity score 20-120
  }))
})

const productivityTrendPoints = computed(() => {
  return productivityTrendData.value.map((point, index) =>
    `${20 + index * (260 / Math.max(productivityTrendData.value.length - 1, 1))},${130 - (point.value * 100 / Math.max(...productivityTrendData.value.map(d => d.value), 1))}`
  ).join(' ')
})


const exportStats = () => {
  const stats = {
    period: activePeriod.value,
    totalCompleted: totalCompleted.value,
    completionRate: completionRate.value,
    averageDaily: averageDaily.value,
    currentStreak: currentStreak.value,
    categoryStats: categoryStats.value,
    priorityStats: priorityStats.value,
    heatmapData: heatmapData.value,
    chartData: chartData.value,
    productivityPeakDay: productivityPeakDay.value,
    completionTrend: completionTrend.value,
    mostProductiveCategory: mostProductiveCategory.value,
    mostProductiveCount: mostProductiveCount.value,
    exportedAt: new Date().toISOString()
  }

  const dataStr = JSON.stringify(stats, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

  const exportFileDefaultName = `stats-${activePeriod.value.toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`

  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}

onMounted(async () => {
  await Promise.all([fetchProjects(), fetchTodos(), fetchSettings()])
})

// Add loading state
const isLoading = ref(true)

onMounted(async () => {
  try {
    await Promise.all([fetchProjects(), fetchTodos(), fetchSettings()])
  } finally {
    isLoading.value = false
  }
})
</script>
