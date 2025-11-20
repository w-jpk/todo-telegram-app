<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <!-- Header -->
    <!-- <AppHeader title="Calendar" v-show="!showTaskModal" /> -->

    <!-- Content Area -->
    <div class="pt-16 pb-20">
      <!-- Month Navigation -->
      <div class="bg-white dark:bg-gray-800 shadow-sm px-4 py-3 mb-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <button @click="previousMonth" class="p-2 cursor-pointer" aria-label="Previous month">
              <i class="fas fa-chevron-left text-gray-600 dark:text-gray-400"></i>
            </button>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white" aria-live="polite">
              {{ currentMonthYear }}
            </h2>
            <button @click="nextMonth" class="p-2 cursor-pointer" aria-label="Next month">
              <i class="fas fa-chevron-right text-gray-600 dark:text-gray-400"></i>
            </button>
          </div>

          <!-- View Toggle -->
          <!-- <div class="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button @click="calendarView = 'month'" :class="{
              'bg-white dark:bg-gray-600 text-gray-900 dark:text-white': calendarView === 'month',
              'text-gray-600 dark:text-gray-400': calendarView !== 'month'
            }" class="px-3 py-1 text-sm font-medium rounded-md transition-colors" aria-label="Month view">
              Month
            </button>
            <button @click="calendarView = 'week'" :class="{
              'bg-white dark:bg-gray-600 text-gray-900 dark:text-white': calendarView === 'week',
              'text-gray-600 dark:text-gray-400': calendarView !== 'week'
            }" class="px-3 py-1 text-sm font-medium rounded-md transition-colors" aria-label="Week view">
              Week
            </button>
          </div> -->
        </div>
      </div>

      <!-- Search and Filter Bar -->
      <div class="px-4 mb-4 space-y-3">
        <!-- Search Input -->
        <div role="search" aria-label="Search tasks in calendar">
          <label for="calendar-search" class="sr-only">Search tasks</label>
          <div class="relative">
            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              aria-hidden="true"></i>
            <input id="calendar-search" v-model="searchQuery" type="text" placeholder="Search tasks..."
              class="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500"
              aria-describedby="calendar-search-help" autocomplete="off" @keydown.escape="searchQuery = ''" />
          </div>
          <div id="calendar-search-help" class="sr-only">Search through your calendar tasks by title or description
          </div>
        </div>

        <!-- Category Filters -->
        <div class="flex space-x-2 overflow-x-auto scrollbar-hide">
          <button v-for="category in filterCategories" :key="category.name" :class="{
            'bg-blue-500 dark:bg-blue-600 text-white': activeFilter === category.name,
            'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400': activeFilter !== category.name
          }"
            class="px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium shadow-sm dark:shadow-gray-900/50 cursor-pointer"
            @click="activeFilter = category.name" :aria-label="`Filter by ${category.name}`"
            :aria-pressed="activeFilter === category.name">
            <i :class="category.icon" class="mr-1"></i>
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="px-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300"
          :key="currentDate.getMonth() + '-' + currentDate.getFullYear()" role="grid" aria-label="Calendar grid">
          <!-- Week Days Header -->
          <div class="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
            <div v-for="day in weekDays" :key="day"
              class="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
              {{ day }}
            </div>
          </div>
          <!-- Calendar Days -->
          <div class="grid grid-cols-7">
            <div v-for="date in calendarDays" :key="date.key" :class="{
              'bg-blue-500 dark:bg-blue-600 text-white': date.isToday,
              'text-gray-400 dark:text-gray-500': !date.isCurrentMonth,
              'text-gray-900 dark:text-white': date.isCurrentMonth && !date.isToday
            }"
              class="flex flex-col relative p-2 min-h-15 border-b border-r border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              @click="selectDate(date)" role="gridcell"
              :aria-label="`${date.day}, ${getTasksForDate(date.fullDate).length} tasks`">
              <div class="text-sm font-medium mb-1">{{ date.day }}</div>
              <div class="flex space-x-1 justify-end">
                <div v-for="task in getTasksForDate(date.fullDate).slice(0, 2)" :key="task.id"
                  class="items-center text-xs">
                  <div :class="{
                    'bg-green-400': task.completed,
                    'bg-red-400': task.priority === 'high' && !task.completed,
                    'bg-yellow-400': task.priority === 'medium' && !task.completed,
                    'bg-blue-400': task.priority === 'low' && !task.completed,
                    'bg-gray-400': task.priority === 'none' && !task.completed
                  }" class="w-1.5 h-1.5 rounded-full"></div>
                </div>
                <div v-if="getTasksForDate(date.fullDate).length > 2" class="text-xs text-gray-500 dark:text-gray-400">
                  +{{ getTasksForDate(date.fullDate).length - 2 }} more
                </div>
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
    <transition name="slide-up">
      <div v-show="showTaskModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
        @click="closeTaskModal">
        <div class="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-h-96 overflow-y-auto scrollbar-hide" @click.stop>
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Tasks for {{ formatSelectedDate }}
              </h3>
              <div class="flex items-center space-x-2">
                <button @click="createTaskForDate"
                  class="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
                  <i class="fas fa-plus mr-1"></i>{{ t('common.create') }}
                </button>
                <button @click="closeTaskModal" class="p-2 cursor-pointer">
                  <i class="fas fa-times text-gray-600 dark:text-gray-400"></i>
                </button>
              </div>
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
                    <h4 :class="{ 'line-through text-gray-400 dark:text-gray-500': task.completed }"
                      class="font-medium text-gray-900 dark:text-white mb-1">
                      {{ task.text }}
                    </h4>
                    <p v-if="task.description"
                      :class="{ 'line-through text-gray-400 dark:text-gray-500': task.completed }"
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
    </transition>

    <!-- Bottom Navigation -->
    <BottomNavigation v-show="!showTaskModal" />

    <!-- Todo Modal -->
    <TodoModal :is-open="showTodoModal" :todo="selectedTodo" :projects="projects"
      :initial-due-date="selectedDate ? new Date(selectedDate.fullDate) : undefined" @close="closeTodoModal"
      @save="saveTodo" @project-created="handleProjectCreated" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Todo, Project, CreateTodoDto, UpdateTodoDto } from '~/types/todo'
import AppHeader from '~/components/AppHeader.vue'
import TodoModal from '~/components/TodoModal.vue'
import BottomNavigation from '~/components/BottomNavigation.vue'
import { formatDateISO, formatMonthYear, formatFullDate } from '~/utils/date'

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
  fetchTodos,
  createTodo
} = useTodos()

const { projects, fetchProjects } = useProjects()
const { settings, fetchSettings } = useSettings()
const { t } = useI18n()

const currentDate = ref(new Date())
const showTaskModal = ref(false)
const selectedDate = ref<CalendarDate | null>(null)
const activeFilter = ref('All')
const showTodoModal = ref(false)
const selectedTodo = ref<Todo | null>(null)
const searchQuery = ref('')
const calendarView = ref<'month' | 'week'>('month')

const weekDays = computed(() => {
  const locale = settings.value?.language || 'en'
  if (locale === 'ru') {
    return ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  }
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
})

const projectColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-red-500']
const badgeColors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800', 'bg-pink-100 text-pink-800', 'bg-yellow-100 text-yellow-800', 'bg-red-100 text-red-800']

const filterCategories = computed(() => {
  const cats = [
    { name: 'All', icon: 'fas fa-list' },
    { name: 'Active', icon: 'fas fa-play' },
    { name: 'Completed', icon: 'fas fa-check' },
    { name: 'High Priority', icon: 'fas fa-exclamation-triangle' },
    { name: 'Medium Priority', icon: 'fas fa-exclamation-circle' },
    { name: 'Low Priority', icon: 'fas fa-info-circle' }
  ]
  projects.value.forEach(project => {
    cats.push({ name: project.name, icon: 'fas fa-folder' })
  })
  return cats
})


const currentMonthYear = computed(() => {
  const locale = settings.value?.language || 'en'
  return formatMonthYear(currentDate.value, locale)
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  const dayOfWeek = firstDay.getDay()
  // Start from Monday: if Sunday (0), subtract 6, else subtract dayOfWeek - 1
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  startDate.setDate(startDate.getDate() - daysToSubtract)
  const days: CalendarDate[] = []
  const today = new Date()
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const isCurrentMonth = date.getMonth() === month
    const isToday = date.toDateString() === today.toDateString()
    days.push({
      day: date.getDate(),
      fullDate: formatDateISO(date),
      isCurrentMonth,
      isToday,
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    })
  }
  return days
})

const filteredTodos = computed(() => {
  let filtered = todos.value

  if (activeFilter.value === 'Active') {
    filtered = filtered.filter(todo => !todo.completed)
  } else if (activeFilter.value === 'Completed') {
    filtered = filtered.filter(todo => todo.completed)
  } else if (activeFilter.value === 'High Priority') {
    filtered = filtered.filter(todo => todo.priority === 'high')
  } else if (activeFilter.value === 'Medium Priority') {
    filtered = filtered.filter(todo => todo.priority === 'medium')
  } else if (activeFilter.value === 'Low Priority') {
    filtered = filtered.filter(todo => todo.priority === 'low')
  } else if (activeFilter.value !== 'All') {
    // Filter by project name
    filtered = filtered.filter(todo => {
      if (!todo.project) return false
      return todo.project.name === activeFilter.value
    })
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(todo =>
      todo.text.toLowerCase().includes(query) ||
      (todo.description && todo.description.toLowerCase().includes(query))
    )
  }

  return filtered
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
    return formatDateISO(task.dueDate) === selectedDate.value?.fullDate
  })
})

const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  const date = new Date(selectedDate.value.fullDate)
  const locale = settings.value?.language || 'en'
  return formatFullDate(date, locale)
})

const getTasksForDate = (date: string) => {
  return filteredTodos.value.filter(task => {
    if (!task.dueDate) return false
    return formatDateISO(task.dueDate) === date
  })
}

const getTaskDotColor = (task: Todo) => {
  return task.project?.color || '#9ca3af'
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
  try {
    const task = todos.value.find(t => t.id === id)
    if (task && updateTodo) {
      await updateTodo(id, { completed: !task.completed })
    }
  } catch (error) {
    console.error('Error toggling task:', error)
    // TODO: Show toast notification
  }
}

const createTaskForDate = () => {
  selectedTodo.value = null
  showTodoModal.value = true
}

const closeTodoModal = () => {
  showTodoModal.value = false
  selectedTodo.value = null
}

const saveTodo = async (data: CreateTodoDto | UpdateTodoDto) => {
  try {
    if (selectedTodo.value) {
      await updateTodo(selectedTodo.value.id, data as UpdateTodoDto)
    } else {
      await createTodo(data as CreateTodoDto)
    }
    closeTodoModal()
  } catch (error) {
    console.error('Error saving todo:', error)
  }
}

const handleProjectCreated = (project: Project) => {
  fetchProjects()
}

onMounted(async () => {
  try {
    await Promise.all([fetchProjects(), fetchTodos(), fetchSettings()])
  } catch (error) {
    console.error('Error loading data:', error)
    // TODO: Show error message to user
  }
})
</script>

<style scoped>
.min-h-15{
  min-height: 3.5rem;
}
</style>