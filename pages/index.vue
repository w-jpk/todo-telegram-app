<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <!-- Header -->
    <AppHeader v-show="!isModalOpen" @menu-click="handleMenuClick" />

    <!-- Content Area -->
    <div class="pt-16 pb-20 px-4">
      <!-- Quick Stats Dashboard -->
      <StatsDashboard
        :today-tasks-count="todayTasksCount"
        :completed-today-count="completedTodayCount"
        :pending-today-count="pendingTodayCount"
        :completion-percentage="completionPercentage"
      />

      <!-- Search Bar -->
      <div class="mb-6" role="search">
        <label for="task-search" class="sr-only">Search tasks</label>
        <div class="relative">
          <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
          <input
            id="task-search"
            v-model="searchQuery"
            type="text"
            placeholder="Search tasks..."
            class="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500"
            aria-describedby="search-help"
            autocomplete="off"
          />
        </div>
        <div id="search-help" class="sr-only">Type to search through your tasks</div>
      </div>

      <!-- Add New Task -->
      <QuickAddTask
        v-model="newTask"
        @add-click="openModal"
      />

      <!-- Task Categories -->
      <CategoryFilters
        :categories="categories"
        :active-category="activeCategory"
        @category-change="activeCategory = $event"
      />

      <!-- Loading State -->
      <div v-if="loading && filteredTasks.length === 0" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent">
        </div>
        <p class="mt-4 text-gray-600 dark:text-gray-400 text-sm">Загрузка задач...</p>
      </div>

      <!-- Task List -->
      <TaskList
        v-else-if="filteredTasks.length > 0"
        :tasks="filteredTasks as Todo[]"
        @toggle="toggleTask"
        @edit="handleEdit"
      />

      <!-- Empty State -->
      <EmptyState
        v-else
        :title="activeCategory === 'All' ? 'No tasks yet' : activeCategory === 'Today' ? 'No tasks for today' : `No ${activeCategory} tasks`"
        :subtitle="activeCategory === 'All' ? 'Add your first task above' : 'Change filter to see other tasks'"
      />

      <!-- Progress Visualization -->
      <ProgressBar :percentage="completionPercentage" />
    </div>

    <!-- Floating Action Button -->
    <FloatingActionButton v-show="!isModalOpen" @click="openModal" />

    <!-- Todo Modal -->
    <TodoModal :is-open="isModalOpen" :todo="selectedTodo" :projects="projects as readonly Project[]"
      @close="closeModal" @save="handleSaveTodo" @project-created="handleProjectCreated" />

    <!-- Bottom Navigation -->
    <BottomNavigation v-show="!isModalOpen" />

    <!-- Toast Notifications -->
    <Toast ref="toast" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Todo, CreateTodoDto, UpdateTodoDto, Project, TodoFilter } from '~/types/todo'
import { formatDateISO, startOfDay } from '~/utils/date'
import TodoModal from '~/components/TodoModal.vue'
import AppHeader from '~/components/AppHeader.vue'
import StatsDashboard from '~/components/StatsDashboard.vue'
import QuickAddTask from '~/components/QuickAddTask.vue'
import CategoryFilters from '~/components/CategoryFilters.vue'
import TaskList from '~/components/TaskList.vue'
import EmptyState from '~/components/EmptyState.vue'
import ProgressBar from '~/components/ProgressBar.vue'
import FloatingActionButton from '~/components/FloatingActionButton.vue'
import Toast from '~/components/Toast.vue'

interface Category {
  name: string
  icon: string
  color?: string
}

const {
  todos,
  filter,
  loading,
  error,
  filteredTodos,
  fetchTodos,
  createTodo,
  updateTodo,
  setFilter
} = useTodos()

const { projects, fetchProjects } = useProjects()
const { settings, fetchSettings } = useSettings()

const { $telegram } = useNuxtApp()
const userId = computed(() => $telegram?.user?.id || null)

const newTask = ref('')
const activeCategory = ref('All')
const isModalOpen = ref(false)
const selectedTodo = ref<Todo | null>(null)
const toast = ref()
const searchQuery = ref('')

const categories = computed<Category[]>(() => {
  const baseCategories = [
    { name: 'All', icon: 'fas fa-list' },
    { name: 'Today', icon: 'fas fa-calendar-day' }
  ]

  // Add user projects as categories
  const projectCategories = projects.value.map(project => ({
    name: project.name,
    icon: 'fas fa-circle',
    color: project.color || '#2481cc'
  }))

  return [...baseCategories, ...projectCategories]
})

const today = computed(() => {
  return startOfDay(new Date())
})

const todayTasks = computed(() => {
  const todayStr = formatDateISO(today.value)
  return todos.value.filter(task => {
    if (!task.dueDate) return false
    const taskDateStr = formatDateISO(task.dueDate)
    return taskDateStr === todayStr
  })
})

const todayTasksCount = computed(() => todayTasks.value.length)
const completedTodayCount = computed(() => todayTasks.value.filter(t => t.completed).length)
const pendingTodayCount = computed(() => todayTasks.value.filter(t => !t.completed).length)

const completionPercentage = computed(() => {
  if (todayTasks.value.length === 0) return 0
  return Math.round((completedTodayCount.value / todayTasks.value.length) * 100)
})

const filteredTasks = computed(() => {
  let result = todos.value // Use raw todos instead of pre-filtered

  // Apply category filter
  if (activeCategory.value === 'Today') {
    const todayStr = formatDateISO(today.value)
    result = result.filter(task => {
      if (!task.dueDate) return false
      const taskDateStr = formatDateISO(task.dueDate)
      return taskDateStr === todayStr
    })
  } else if (activeCategory.value !== 'All') {
    result = result.filter(task => {
      if (!task.project) return false
      return task.project.name === activeCategory.value
    })
  } else {
    // For 'All' category, apply the general filter from useTodos
    switch (filter.value) {
      case 'active':
        result = result.filter(todo => !todo.completed)
        break
      case 'completed':
        result = result.filter(todo => todo.completed)
        break
      default:
        // 'all' - no additional filtering needed
        break
    }
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter(task =>
      task.text.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query)) ||
      (task.project && task.project.name.toLowerCase().includes(query))
    )
  }

  return result
})

const openModal = () => {
  selectedTodo.value = null
  isModalOpen.value = true
  if (process.client && (window as any).Telegram?.WebApp) {
    (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
  }
}

const closeModal = () => {
  isModalOpen.value = false
  selectedTodo.value = null
}

const handleSaveTodo = async (data: CreateTodoDto | UpdateTodoDto) => {
  try {
    if (selectedTodo.value) {
      await updateTodo(selectedTodo.value.id, data as UpdateTodoDto)
      toast.value?.showSuccess('Task Updated', 'Your task has been updated successfully.')
    } else {
      await createTodo(data as CreateTodoDto)
      toast.value?.showSuccess('Task Created', 'Your new task has been created successfully.')
    }
    closeModal()
    newTask.value = ''
    if (process.client && (window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
    }
  } catch (error) {
    toast.value?.showError(
      'Save Failed',
      'There was an error saving your task. Please try again.'
    )
    console.error('Error saving todo:', error)
  }
}


const toggleTask = async (id: string) => {
  const task = todos.value.find(t => t.id === id)
  if (!task) return

  const newCompleted = !task.completed

  // Haptic feedback
  if (process.client && (window as any).Telegram?.WebApp) {
    (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
  }

  try {
    await updateTodo(id, { completed: newCompleted })
    toast.value?.showSuccess(
      newCompleted ? 'Task Completed' : 'Task Uncompleted',
      `Task "${task.text}" has been ${newCompleted ? 'completed' : 'marked as incomplete'}.`
    )
  } catch (error) {
    toast.value?.showError(
      'Update Failed',
      'There was an error updating the task. Please try again.'
    )
    console.error('Error toggling task:', error)
  }
}

const handleEdit = (todo: Todo) => {
  selectedTodo.value = todo
  isModalOpen.value = true
  if (process.client && (window as any).Telegram?.WebApp) {
    (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
  }
}

const handleProjectCreated = async (project: Project) => {
  await fetchProjects()
}

const handleMenuClick = () => {
  // Navigate to settings page
  navigateTo('/settings')
}

const handleKeyboardShortcuts = (event: KeyboardEvent) => {
  // Don't trigger shortcuts when typing in inputs
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return
  }

  // Ctrl+N or Cmd+N for new task
  if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
    event.preventDefault()
    if (!isModalOpen.value) {
      openModal()
    }
  }

  // Escape to close modal
  if (event.key === 'Escape' && isModalOpen.value) {
    event.preventDefault()
    closeModal()
  }

  // Ctrl+K or Cmd+K for search focus
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    const searchInput = document.getElementById('task-search') as HTMLInputElement
    if (searchInput) {
      searchInput.focus()
    }
  }

  // Ctrl+/ or Cmd+/ for settings
  if ((event.ctrlKey || event.metaKey) && event.key === '/') {
    event.preventDefault()
    navigateTo('/settings')
  }
}


onMounted(async () => {
  // Add keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts)

  const { $telegram } = useNuxtApp()

  const waitForTelegram = (): Promise<void> => {
    return new Promise((resolve) => {
      if ($telegram?.isReady && $telegram?.user) {
        resolve()
        return
      }

      const checkInterval = setInterval(() => {
        if ((window as any).Telegram?.WebApp) {
          const tg = (window as any).Telegram.WebApp
          if (tg.initDataUnsafe?.user) {
            if ($telegram) {
              $telegram.user = tg.initDataUnsafe.user
              $telegram.initData = tg.initData || ''
              $telegram.initDataUnsafe = tg.initDataUnsafe || {}
              $telegram.isReady = true
            }
            clearInterval(checkInterval)
            resolve()
          } else if ($telegram?.user) {
            clearInterval(checkInterval)
            resolve()
          }
        } else if ($telegram?.user) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)

      setTimeout(() => {
        clearInterval(checkInterval)
        resolve()
      }, 3000)
    })
  }

  await waitForTelegram()

  if ($telegram?.user) {
    try {
      await $fetch('/api/auth/telegram', {
        method: 'POST',
        body: {
          user: $telegram.user,
          initData: $telegram.initData
        }
      })
    } catch (error) {
      console.error('Error authenticating user:', error)
    }
  }

  await Promise.all([
    fetchProjects(),
    fetchTodos(),
    fetchSettings()
  ])
})

onUnmounted(() => {
  // Clean up keyboard shortcuts
  document.removeEventListener('keydown', handleKeyboardShortcuts)
})
</script>
