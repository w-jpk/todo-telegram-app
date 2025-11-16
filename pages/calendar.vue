<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <!-- Header -->
    <div class="fixed top-0 w-full bg-white dark:bg-gray-800 shadow-sm z-50">
      <div class="flex items-center justify-between px-4 py-3">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <i class="fas fa-user text-white text-sm"></i>
          </div>
          <button class="p-1 cursor-pointer">
            <i class="fas fa-ellipsis-v text-gray-600 dark:text-gray-400"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="pt-16 pb-20">
      <!-- Month Navigation -->
      <div class="bg-white dark:bg-gray-800 shadow-sm px-4 py-3 mb-4">
        <div class="flex items-center justify-between">
          <button @click="previousMonth" class="p-2 cursor-pointer">
            <i class="fas fa-chevron-left text-gray-600 dark:text-gray-400"></i>
          </button>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ currentMonthYear }}
          </h2>
          <button @click="nextMonth" class="p-2 cursor-pointer">
            <i class="fas fa-chevron-right text-gray-600 dark:text-gray-400"></i>
          </button>
        </div>
      </div>

      <!-- Category Filter Bar -->
      <div class="px-4 mb-4">
        <div class="flex space-x-2 overflow-x-auto scrollbar-hide">
          <button v-for="category in filterCategories" :key="category.name" :class="{
            'bg-blue-500 dark:bg-blue-600 text-white': activeFilter === category.name,
            'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400': activeFilter !== category.name
          }" class="px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium shadow-sm dark:shadow-gray-900/50 cursor-pointer"
            @click="activeFilter = category.name">
            <i :class="category.icon" class="mr-1"></i>
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="px-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <!-- Week Days Header -->
          <div class="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
            <div v-for="day in weekDays" :key="day" class="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
              {{ day }}
            </div>
          </div>
          <!-- Calendar Days -->
          <div class="grid grid-cols-7">
            <div v-for="date in calendarDays" :key="date.key" :class="{
              'bg-blue-500 text-white': date.isToday,
              'text-gray-400 dark:text-gray-500': !date.isCurrentMonth,
              'text-gray-900 dark:text-white': date.isCurrentMonth && !date.isToday
            }" class="relative p-3 h-16 border-b border-r border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              @click="selectDate(date)">
              <div class="text-sm font-medium">{{ date.day }}</div>
              <div class="absolute bottom-1 right-1 flex space-x-1">
                <div v-for="task in getTasksForDate(date.fullDate)" :key="task.id"
                  :class="getTaskDotColor(task.project?.name || '')" class="w-2 h-2 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Month Overview Stats -->
      <div class="px-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h3 class="font-medium text-gray-900 dark:text-white mb-3">Month Overview</h3>
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-500 dark:text-blue-400">{{ monthStats.total }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-500 dark:text-green-400">{{ monthStats.completed }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-500 dark:text-orange-400">{{ monthStats.pending }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily Task Details Modal -->
    <div v-if="showTaskModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end" @click="closeTaskModal">
      <div class="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-h-96 overflow-y-auto scrollbar-hide" @click.stop>
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Tasks for {{ formatSelectedDate }}
            </h3>
            <button @click="closeTaskModal" class="p-2 cursor-pointer">
              <i class="fas fa-times text-gray-600 dark:text-gray-400"></i>
            </button>
          </div>
        </div>
        <div class="p-4">
          <div v-if="selectedDateTasks.length === 0" class="text-center py-8">
            <i class="fas fa-calendar-check text-gray-300 dark:text-gray-600 text-4xl mb-3"></i>
            <p class="text-gray-500 dark:text-gray-400">No tasks for this date</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="task in selectedDateTasks" :key="task.id" class="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
              <div class="flex items-start space-x-3">
                <button :class="{
                  'bg-green-500 border-green-500': task.completed,
                  'border-gray-300 dark:border-gray-600': !task.completed
                }" class="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 cursor-pointer"
                  @click="toggleTask(task.id)">
                  <i v-if="task.completed" class="fas fa-check text-white text-xs"></i>
                </button>
                <div class="flex-1">
                  <h4 :class="{ 'line-through text-gray-400 dark:text-gray-500': task.completed }" class="font-medium text-gray-900 dark:text-white mb-1">
                    {{ task.text }}
                  </h4>
                  <p v-if="task.description" :class="{ 'line-through text-gray-400 dark:text-gray-500': task.completed }"
                    class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {{ task.description }}
                  </p>
                  <div class="flex items-center space-x-3">
                    <div :class="getPriorityColor(task.priority)" class="w-2 h-2 rounded-full"></div>
                    <span v-if="task.project" :class="getCategoryColor(task.project.name)"
                      class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ task.project.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation v-show="!showTaskModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Todo, Project } from '~/types/todo'

interface CalendarDate {
  day: number
  fullDate: string
  isCurrentMonth: boolean
  isToday: boolean
  key: string
}

interface FilterCategory {
  name: string
  icon: string
}

const {
  todos,
  updateTodo,
  fetchTodos
} = useTodos()

const { projects, fetchProjects } = useProjects()
const { fetchSettings } = useSettings()

const currentDate = ref(new Date())
const showTaskModal = ref(false)
const selectedDate = ref<CalendarDate | null>(null)
const activeFilter = ref('All')
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const projectColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-red-500']
const badgeColors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800', 'bg-pink-100 text-pink-800', 'bg-yellow-100 text-yellow-800', 'bg-red-100 text-red-800']

const filterCategories = computed(() => {
  const cats = [{ name: 'All', icon: 'fas fa-list' }]
  projects.value.forEach(project => {
    cats.push({ name: project.name, icon: 'fas fa-folder' })
  })
  return cats
})

const getLocalDateString = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  const days: CalendarDate[] = []
  const today = new Date()
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const isCurrentMonth = date.getMonth() === month
    const isToday = date.toDateString() === today.toDateString()
    days.push({
      day: date.getDate(),
      fullDate: getLocalDateString(date),
      isCurrentMonth,
      isToday,
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    })
  }
  return days
})

const filteredTodos = computed(() => {
  if (activeFilter.value === 'All') {
    return todos.value
  }
  // Filter by project name (simplified - in real app you'd have category field)
  return todos.value.filter(todo => {
    if (!todo.project) return false
    return todo.project.name === activeFilter.value
  })
})

const monthStats = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const monthTasks = filteredTodos.value.filter(task => {
    if (!task.dueDate) return false
    const taskDate = new Date(task.dueDate)
    return taskDate.getFullYear() === year && taskDate.getMonth() === month
  })
  const completed = monthTasks.filter(task => task.completed).length
  return {
    total: monthTasks.length,
    completed,
    pending: monthTasks.length - completed
  }
})

const selectedDateTasks = computed(() => {
  if (!selectedDate.value) return []
  return filteredTodos.value.filter(task => {
    if (!task.dueDate) return false
    return getLocalDateString(task.dueDate) === selectedDate.value?.fullDate
  })
})

const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  const date = new Date(selectedDate.value.fullDate)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
})

const getTasksForDate = (date: string) => {
  return filteredTodos.value.filter(task => {
    if (!task.dueDate) return false
    return getLocalDateString(task.dueDate) === date
  })
}

const getTaskDotColor = (projectName: string) => {
  const project = projects.value.find(p => p.name === projectName)
  if (!project) return 'bg-gray-400'
  const index = projects.value.indexOf(project)
  return projectColors[index % projectColors.length]
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500'
    case 'medium': return 'bg-yellow-500'
    case 'low': return 'bg-green-500'
    default: return 'bg-gray-400'
  }
}

const getCategoryColor = (category: string) => {
  const project = projects.value.find(p => p.name === category)
  if (!project) return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  const index = projects.value.indexOf(project)
  const baseColor = badgeColors[index % badgeColors.length]
  // Add dark mode variants
  if (baseColor.includes('bg-blue-100')) return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
  if (baseColor.includes('bg-green-100')) return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
  if (baseColor.includes('bg-purple-100')) return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
  if (baseColor.includes('bg-pink-100')) return 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200'
  if (baseColor.includes('bg-yellow-100')) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
  if (baseColor.includes('bg-red-100')) return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
  return baseColor
}

const previousMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

const selectDate = (date: CalendarDate) => {
  selectedDate.value = date
  showTaskModal.value = true
}

const closeTaskModal = () => {
  showTaskModal.value = false
  selectedDate.value = null
}

const toggleTask = async (id: string) => {
  const task = todos.value.find(t => t.id === id)
  if (task && updateTodo) {
    await updateTodo(id, { completed: !task.completed })
  }
}

onMounted(async () => {
  await Promise.all([fetchProjects(), fetchTodos(), fetchSettings()])
})
</script>
