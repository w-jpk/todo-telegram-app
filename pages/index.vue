<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <div class="fixed top-0 w-full bg-white shadow-sm z-50">
      <div class="flex items-center justify-between px-4 py-3">
        <h1 class="text-xl font-bold text-gray-900">To-Do</h1>
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
      <!-- Quick Stats Dashboard -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 mb-6 text-white">
        <div class="flex justify-between items-center">
          <div class="text-center">
            <div class="text-2xl font-bold">{{ todayTasksCount }}</div>
            <div class="text-sm opacity-90">Tasks Today</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold">{{ completedTodayCount }}</div>
            <div class="text-sm opacity-90">Completed</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold">{{ pendingTodayCount }}</div>
            <div class="text-sm opacity-90">Pending</div>
          </div>
        </div>
        <div class="mt-3 bg-white bg-opacity-20 rounded-full h-2">
          <div class="bg-white rounded-full h-2" :style="{ width: completionPercentage + '%' }"></div>
        </div>
      </div>

      <!-- Add New Task -->
      <div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-200 transition-colors"
            @click="openModal">
            <i class="fas fa-plus text-blue-500"></i>
          </div>
          <input type="text" placeholder="Add a new task..."
            class="flex-1 text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent" v-model="newTask"
            @keyup.enter="addQuickTask" @focus="openModal" />
        </div>
      </div>

      <!-- Task Categories -->
      <div class="flex space-x-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        <button v-for="category in categories" :key="category.name" :class="{
          'bg-blue-500 text-white': activeCategory === category.name,
          'bg-white text-gray-600': activeCategory !== category.name
        }"
          class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium shadow-sm cursor-pointer transition-colors"
          @click="activeCategory = category.name">
          <i :class="category.icon" class="mr-1"></i>
          {{ category.name }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading && filteredTasks.length === 0" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent">
        </div>
        <p class="mt-4 text-gray-600 text-sm">Загрузка задач...</p>
      </div>

      <!-- Task List -->
      <div v-else-if="filteredTasks.length > 0" class="space-y-3">
        <div v-for="task in filteredTasks" :key="task.id" class="bg-white rounded-xl p-4 shadow-sm">
          <div class="flex items-start space-x-3">
            <button :class="{
              'bg-green-500 border-green-500': task.completed,
              'border-gray-300': !task.completed
            }" class="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 cursor-pointer"
              @click="toggleTask(task.id)">
              <i v-if="task.completed" class="fas fa-check text-white text-xs"></i>
            </button>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <h3 :class="{ 'line-through text-gray-400': task.completed }" class="font-medium text-gray-900">
                  {{ task.text }}
                </h3>
                <div class="flex items-center space-x-2">
                  <div v-if="task.priority && task.priority !== 'none'" :class="getPriorityColor(task.priority)"
                    class="w-2 h-2 rounded-full"></div>
                  <button class="cursor-pointer" @click="handleEdit(task)">
                    <i class="fas fa-ellipsis-h text-gray-400 text-sm"></i>
                  </button>
                </div>
              </div>
              <p v-if="task.description" :class="{ 'line-through text-gray-400': task.completed }"
                class="text-sm text-gray-600 mb-2">
                {{ task.description }}
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div v-if="task.dueDate" :class="getDueDateColor(task.dueDate, task.completed)"
                    class="flex items-center space-x-1 text-xs">
                    <i class="fas fa-calendar-alt"></i>
                    <span>{{ formatDate(task.dueDate) }}</span>
                  </div>
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

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-check-circle text-white text-3xl"></i>
        </div>
        <p class="text-lg font-medium text-gray-900 mb-2">
          {{ activeCategory === 'All' ? 'No tasks yet' : activeCategory === 'Today' ? 'No tasks for today' : `No
          ${activeCategory} tasks` }}
        </p>
        <p class="text-sm text-gray-500 px-4">
          {{ activeCategory === 'All' ? 'Add your first task above' : 'Change filter to see other tasks' }}
        </p>
      </div>

      <!-- Progress Visualization -->
      <div class="bg-white rounded-xl p-4 mt-6 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-medium text-gray-900">Today's Progress</h3>
          <span class="text-sm text-gray-600">{{ completionPercentage }}%</span>
        </div>
        <div class="bg-gray-200 rounded-full h-2">
          <div :style="{ width: completionPercentage + '%' }"
            class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full h-2 transition-all duration-300"></div>
        </div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <button
      class="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center cursor-pointer"
      @click="openModal">
      <i class="fas fa-plus text-white text-xl"></i>
    </button>

    <!-- Todo Modal -->
    <TodoModal :is-open="isModalOpen" :todo="selectedTodo" :projects="projects as readonly Project[]"
      @close="closeModal" @save="handleSaveTodo" @project-created="handleProjectCreated" />

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Todo, CreateTodoDto, UpdateTodoDto, Project, TodoFilter } from '~/types/todo'
import TodoModal from '~/components/TodoModal.vue'

interface Category {
  name: string
  icon: string
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

const categories = ref<Category[]>([
  { name: 'All', icon: 'fas fa-list' },
  { name: 'Today', icon: 'fas fa-calendar-day' },
  { name: 'Work', icon: 'fas fa-briefcase' },
  { name: 'Personal', icon: 'fas fa-user' },
  { name: 'Shopping', icon: 'fas fa-shopping-cart' },
  { name: 'Health', icon: 'fas fa-heart' }
])

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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500'
    case 'medium': return 'bg-yellow-500'
    case 'low': return 'bg-green-500'
    default: return 'bg-gray-400'
  }
}

const getDueDateColor = (dueDate: Date, completed: boolean) => {
  if (completed) return 'text-gray-500'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const taskDate = new Date(dueDate)
  taskDate.setHours(0, 0, 0, 0)
  if (taskDate < today) return 'text-red-500'
  if (taskDate.getTime() === today.getTime()) return 'text-orange-500'
  return 'text-gray-500'
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Work': return 'bg-blue-100 text-blue-800'
    case 'Personal': return 'bg-green-100 text-green-800'
    case 'Shopping': return 'bg-purple-100 text-purple-800'
    case 'Health': return 'bg-pink-100 text-pink-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString: Date) => {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateOnly = new Date(date)
  dateOnly.setHours(0, 0, 0, 0)

  if (dateOnly.getTime() === today.getTime()) return 'Today'
  if (dateOnly.getTime() === tomorrow.getTime()) return 'Tomorrow'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
