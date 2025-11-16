<template>
  <div class="min-h-screen bg-gray-50 pb-20">
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
        <p class="mt-4 text-gray-600 text-sm">Загрузка задач...</p>
      </div>

      <!-- Task List -->
      <TaskList
        v-else-if="filteredTasks.length > 0"
        :tasks="filteredTasks"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Todo, CreateTodoDto, UpdateTodoDto, Project, TodoFilter } from '~/types/todo'
import TodoModal from '~/components/TodoModal.vue'
import AppHeader from '~/components/AppHeader.vue'
import StatsDashboard from '~/components/StatsDashboard.vue'
import QuickAddTask from '~/components/QuickAddTask.vue'
import CategoryFilters from '~/components/CategoryFilters.vue'
import TaskList from '~/components/TaskList.vue'
import EmptyState from '~/components/EmptyState.vue'
import ProgressBar from '~/components/ProgressBar.vue'
import FloatingActionButton from '~/components/FloatingActionButton.vue'

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

const { $telegram } = useNuxtApp()
const userId = computed(() => $telegram?.user?.id || null)

const newTask = ref('')
const activeCategory = ref('All')
const isModalOpen = ref(false)
const selectedTodo = ref<Todo | null>(null)

const categories = computed<Category[]>(() => {
  const baseCategories = [
    { name: 'All', icon: 'fas fa-list' },
    { name: 'Today', icon: 'fas fa-calendar-day' }
  ]

  // Add user projects as categories
  const projectCategories = projects.value.map(project => ({
    name: project.name,
    icon: 'fas fa-circle',
    color: project.color
  }))

  return [...baseCategories, ...projectCategories]
})

const today = computed(() => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
})

const todayTasks = computed(() => {
  return todos.value.filter(task => {
    if (!task.dueDate) return false
    const taskDate = new Date(task.dueDate)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate.getTime() === today.value.getTime()
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
  let result = filteredTodos.value

  // Apply category filter
  if (activeCategory.value === 'Today') {
    result = result.filter(task => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      taskDate.setHours(0, 0, 0, 0)
      return taskDate.getTime() === today.value.getTime()
    })
  } else if (activeCategory.value !== 'All') {
    result = result.filter(task => {
      if (!task.project) return false
      return task.project.name === activeCategory.value
    })
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
  if (selectedTodo.value) {
    await updateTodo(selectedTodo.value.id, data as UpdateTodoDto)
  } else {
    await createTodo(data as CreateTodoDto)
  }
  closeModal()
  newTask.value = ''
  if (process.client && (window as any).Telegram?.WebApp) {
    (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
  }
}

const addQuickTask = () => {
  if (newTask.value.trim()) {
    openModal()
    // The modal will handle the creation
  }
}

const toggleTask = async (id: string) => {
  const task = todos.value.find(t => t.id === id)
  if (task && updateTodo) {
    await updateTodo(id, { completed: !task.completed })
  }
  if (process.client && (window as any).Telegram?.WebApp) {
    (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
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
  // Handle menu button click - could open settings or show menu
  console.log('Menu clicked')
}


onMounted(async () => {
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
    fetchTodos()
  ])
})
</script>
