<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <!-- Header -->
    <AppHeader v-show="!isModalOpen" @menu-click="handleMenuClick" />

    <!-- Content Area -->
    <main id="main-content" class="pt-16 pb-20 px-4" role="main">
      <!-- Quick Stats Dashboard -->
      <StatsDashboard
        :today-tasks-count="todayTasksCount"
        :completed-today-count="completedTodayCount"
        :pending-today-count="pendingTodayCount"
        :completion-percentage="completionPercentage"
      />

      <!-- Search Bar -->
      <div class="mb-6" role="search" aria-label="Task search">
        <label for="task-search" class="sr-only">{{ $t('home.searchPlaceholder') }}</label>
        <div class="relative">
          <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
          <input
            id="task-search"
            v-model="searchQuery"
            type="text"
            :placeholder="$t('home.searchPlaceholder')"
            class="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500"
            :aria-describedby="'search-help'"
            autocomplete="off"
            aria-label="Search tasks"
            @keydown.escape="searchQuery = ''"
          />
        </div>
        <div id="search-help" class="sr-only">{{ $t('home.searchHelp') }}</div>
      </div>

      <!-- Add New Task -->
      <QuickAddTask
        v-model="newTask"
        :placeholder="$t('home.addTaskPlaceholder')"
        @add-click="openModal"
      />

      <!-- Task Categories -->
      <CategoryFilters
        :categories="categories"
        :active-category="activeCategory"
        @category-change="activeCategory = $event"
      />

      <!-- Loading State -->
      <div v-if="loading && (!filteredTasks || filteredTasks.length === 0)" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent">
        </div>
        <p class="mt-4 text-gray-600 dark:text-gray-400 text-sm">{{ $t('home.loadingTasks') }}</p>
      </div>

      <!-- Task List -->
      <TaskList
        v-else-if="filteredTasks && filteredTasks.length > 0"
        :tasks="filteredTasks as Todo[]"
        :selected-tasks="selectedTasks"
        :show-checkboxes="showBulkMode"
        @toggle="toggleTask"
        @edit="handleEdit"
        @reorder="handleReorder"
        @update:selectedTasks="selectedTasks = $event"
      />

      <!-- Load More Button -->
      <div v-if="hasNextPage && filteredTasks && filteredTasks.length > 0 && !loading" class="text-center py-4">
        <button
          @click="loadNextPage"
          class="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading"
        >
          {{ $t('home.loadMore') }}
        </button>
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else
        :title="activeCategory === $t('home.allTasks') ? $t('home.noTasksYet') : activeCategory === $t('home.todayTasks') ? $t('home.noTasksForToday') : $t('home.noTasksForCategory', { category: activeCategory?.toLowerCase() || 'unknown' })"
        :subtitle="activeCategory === $t('home.allTasks') ? $t('home.addFirstTask') : $t('home.changeFilter')"
      />

      <!-- Progress Visualization -->
      <ProgressBar :percentage="completionPercentage" />
    </main>

    <!-- Floating Action Button -->
    <FloatingActionButton v-show="!isModalOpen" @click="openModal" />

    <!-- Bulk Actions -->
    <BulkActions
      v-if="showBulkMode"
      :selected-tasks="selectedTasks"
      :total-tasks="filteredTasks ? filteredTasks.length : 0"
      @select-all="selectAllTasks"
      @clear-selection="clearTaskSelection"
      @mark-completed="bulkMarkCompleted"
      @mark-incomplete="bulkMarkIncomplete"
      @delete-selected="bulkDeleteTasks"
    />

    <!-- Todo Modal -->
    <TodoModal :is-open="isModalOpen" :todo="selectedTodo" :projects="projects as readonly Project[]"
      @close="closeModal" @save="handleSaveTodo" @project-created="handleProjectCreated" />

    <nav id="navigation" aria-label="Main navigation">
      <ClientOnly>
        <BottomNavigation v-show="!isModalOpen" />
        <template #fallback>
          <div class="fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 h-16"></div>
        </template>
      </ClientOnly>
    </nav>

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
import BulkActions from '~/components/BulkActions.vue'
import BottomNavigation from '~/components/BottomNavigation.vue'
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
  currentPage,
  hasNextPage,
  totalCount,
  pageSize,
  filteredTodos,
  fetchTodos,
  loadNextPage,
  resetPagination,
  createTodo,
  updateTodo,
  deleteTodo,
  setFilter
} = useTodos()

const { projects, fetchProjects } = useProjects()
const { settings, fetchSettings } = useSettings()
const { t } = useI18n()

const { $telegram } = useNuxtApp()
const userId = computed(() => $telegram?.user?.id || null)

const newTask = ref('')
const activeCategory = ref<string>('')
const isModalOpen = ref(false)
const selectedTodo = ref<Todo | null>(null)
const toast = ref()
const searchQuery = ref('')
const selectedTasks = ref<string[]>([])
const showBulkMode = ref(false)

const categories = computed<Category[]>(() => {
  const baseCategories = [
    { name: t('home.allTasks'), icon: 'fas fa-list' },
    { name: t('home.todayTasks'), icon: 'fas fa-calendar-day' }
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

const todayTasksCount = computed(() => todayTasks.value?.length || 0)
const completedTodayCount = computed(() => todayTasks.value?.filter(t => t.completed).length || 0)
const pendingTodayCount = computed(() => todayTasks.value?.filter(t => !t.completed).length || 0)

const completionPercentage = computed(() => {
  const total = todayTasks.value?.length || 0
  if (total === 0) return 0
  return Math.round((completedTodayCount.value / total) * 100)
})

const filteredTasks = computed(() => {
  let result = todos.value // Use raw todos instead of pre-filtered

  // Apply category filter
  if (activeCategory.value === t('home.todayTasks')) {
    const todayStr = formatDateISO(today.value)
    result = result.filter(task => {
      if (!task.dueDate) return false
      const taskDateStr = formatDateISO(task.dueDate)
      return taskDateStr === todayStr
    })
  } else if (activeCategory.value && activeCategory.value !== t('home.allTasks')) {
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
  if (process.client && (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred) {
    try {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
    } catch (error) {
      // HapticFeedback might not be supported in all Telegram WebApp versions
      console.debug('HapticFeedback not supported:', error)
    }
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
      toast.value?.showSuccess(t('home.taskUpdated'), t('home.taskUpdatedDesc'))
    } else {
      await createTodo(data as CreateTodoDto)
      toast.value?.showSuccess(t('home.taskCreated'), t('home.taskCreatedDesc'))
    }
    closeModal()
    newTask.value = ''
    if (process.client && (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred) {
      try {
        (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
      } catch (error) {
        // HapticFeedback might not be supported in all Telegram WebApp versions
        console.debug('HapticFeedback not supported:', error)
      }
    }
  } catch (error) {
    toast.value?.showError(
      t('home.saveFailed'),
      t('home.saveFailedDesc')
    )
    console.error('Error saving todo:', error)
  }
}


const toggleTask = async (id: string) => {
  const task = todos.value.find(t => t.id === id)
  if (!task) return

  const newCompleted = !task.completed

  // Haptic feedback
  if (process.client && (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred) {
    try {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
    } catch (error) {
      // HapticFeedback might not be supported in all Telegram WebApp versions
      console.debug('HapticFeedback not supported:', error)
    }
  }

  try {
    await updateTodo(id, { completed: newCompleted })
    toast.value?.showSuccess(
      newCompleted ? t('home.taskCompleted') : t('home.taskUncompleted'),
      t('home.taskToggleDesc', {
        task: task.text,
        action: newCompleted ? t('common.completed').toLowerCase() : t('common.pending').toLowerCase()
      })
    )
  } catch (error) {
    toast.value?.showError(
      t('home.updateFailed'),
      t('home.updateFailedDesc')
    )
    console.error('Error toggling task:', error)
  }
}

const handleEdit = (todo: Todo) => {
  selectedTodo.value = todo
  isModalOpen.value = true
  if (process.client && (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred) {
    try {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
    } catch (error) {
      // HapticFeedback might not be supported in all Telegram WebApp versions
      console.debug('HapticFeedback not supported:', error)
    }
  }
}

const handleProjectCreated = async (project: Project) => {
  await fetchProjects()
}

const handleReorder = (reorderedTasks: Todo[]) => {
  // For now, just show a toast that reorder is not persisted
  // In a full implementation, this would update the order in the database
  toast.value?.showInfo(t('home.tasksReordered'), t('home.reorderNotSaved'))
}

const selectAllTasks = () => {
  selectedTasks.value = filteredTasks.value?.map(task => task.id) || []
}

const clearTaskSelection = () => {
  selectedTasks.value = []
}

const bulkMarkCompleted = async (taskIds: string[]) => {
  try {
    // Update each task individually (in a real app, you'd have a bulk API endpoint)
    for (const taskId of taskIds) {
      await updateTodo(taskId, { completed: true })
    }
    selectedTasks.value = []
    toast.value?.showSuccess(t('bulk.tasksMarkedCompleted'), t('bulk.bulkOperationSuccess'))
  } catch (error) {
    toast.value?.showError(t('bulk.bulkOperationFailed'), t('bulk.tryAgain'))
    console.error('Error in bulk mark completed:', error)
  }
}

const bulkMarkIncomplete = async (taskIds: string[]) => {
  try {
    for (const taskId of taskIds) {
      await updateTodo(taskId, { completed: false })
    }
    selectedTasks.value = []
    toast.value?.showSuccess(t('bulk.tasksMarkedIncomplete'), t('bulk.bulkOperationSuccess'))
  } catch (error) {
    toast.value?.showError(t('bulk.bulkOperationFailed'), t('bulk.tryAgain'))
    console.error('Error in bulk mark incomplete:', error)
  }
}

const bulkDeleteTasks = async (taskIds: string[]) => {
  try {
    // In a real implementation, you'd have a bulk delete API
    // For now, delete individually using the composable
    for (const taskId of taskIds) {
      await deleteTodo(taskId)
    }
    selectedTasks.value = []
    toast.value?.showSuccess(t('bulk.tasksDeleted'), t('bulk.bulkOperationSuccess'))
  } catch (error) {
    toast.value?.showError(t('bulk.bulkOperationFailed'), t('bulk.tryAgain'))
    console.error('Error in bulk delete:', error)
  }
}

const handleMenuClick = () => {
  // Navigate to settings page
  navigateTo('/settings')
}

const handleKeyboardShortcuts = (event: KeyboardEvent) => {
  // Don't trigger shortcuts when typing in inputs
  const target = event.target as HTMLElement
  if (!target || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
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
  // Initialize active category with localized "All"
  activeCategory.value = t('home.allTasks')

  // Add keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts)

  const { $telegram } = useNuxtApp()

  const waitForTelegram = (): Promise<void> => {
    return new Promise((resolve) => {
      // If already ready with user, resolve immediately
      if ($telegram?.isReady && $telegram?.user) {
        resolve()
        return
      }

      // If we have user from plugin (including test user in dev), resolve
      if ($telegram?.user) {
        resolve()
        return
      }

      // Otherwise, wait for Telegram WebApp to load
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
            return
          }
        }
        
        // Check if plugin has set user data
        if ($telegram?.user) {
          clearInterval(checkInterval)
          resolve()
          return
        }
      }, 100)

      // Resolve after timeout (even if Telegram not loaded, plugin may have test user)
      setTimeout(() => {
        clearInterval(checkInterval)
        resolve()
      }, 3000)
    })
  }

  await waitForTelegram()

  // Authenticate user if we have user data
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

  // Only fetch data if user is authenticated
  if (userId.value) {
    resetPagination()
    await Promise.all([
      fetchProjects(),
      fetchTodos(1, false),
      fetchSettings()
    ])
  } else {
    console.warn('User ID not available, skipping data fetch')
  }
})

onUnmounted(() => {
  // Clean up keyboard shortcuts
  document.removeEventListener('keydown', handleKeyboardShortcuts)
})
</script>
