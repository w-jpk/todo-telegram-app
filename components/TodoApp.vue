<template>
  <div class="min-h-screen-safe bg-telegram-bg pb-safe-bottom">
    <!-- Header -->
    <header class="w-full bg-telegram-header-bg py-4 shadow-sm border-b border-white/10">
      <div class="container">
        <h1 class="text-3xl font-bold text-telegram-text text-center">
          ToDo | {{ userName }}
        </h1>
      </div>
    </header>

    <div class="container pb-6 space-y-6 pt-6">
      <!-- Add Todo Button -->
      <button @click="openModal"
        class="w-full px-6 py-4 bg-telegram-button text-telegram-button-text rounded-xl font-medium active:opacity-80 transition-all flex items-center justify-center gap-3 min-h-[52px] touch-manipulation hover:opacity-90 cursor-pointer">
        <Plus :size="20" />
        <span class="text-lg">Создать задачу</span>
      </button>

      <!-- Filters -->
      <TodoFilters :current-filter="filter" :date-from="dateFrom" :date-to="dateTo" @filter="handleFilterChange"
        @date-change="handleDateChange" />

      <!-- Error Message -->
      <div v-if="error" class="p-3 bg-red-900/20 border border-red-800 text-red-400 rounded-xl text-sm">
        {{ error }}
      </div>

      <!-- Loading State -->
      <div v-if="loading && todosWithDateFilter.length === 0" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-10 w-10 border-2 border-telegram-button border-t-transparent">
        </div>
        <p class="mt-4 text-telegram-hint text-sm">Загрузка задач...</p>
      </div>

      <!-- Todo List -->
      <div v-else-if="todosWithDateFilter.length > 0" class="space-y-3">
        <TodoItem v-for="todo in todosWithDateFilter" :key="todo.id" :todo="todo" @update="handleUpdate"
          @delete="handleDelete" @edit="handleEdit" />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 text-telegram-hint">
        <CheckCircle2 :size="56" class="mx-auto mb-6 opacity-50" />
        <p class="text-lg font-medium text-telegram-text mb-2">
          {{ filter === 'active' ? 'Нет активных задач' : filter === 'completed' ? 'Нет выполненных задач' : 'Нет задач'
          }}
        </p>
        <p class="text-sm text-telegram-hint px-4">
          {{ filter === 'all' ? 'Добавьте первую задачу выше' : 'Измените фильтр, чтобы увидеть другие задачи' }}
        </p>
      </div>

      <!-- User not authenticated warning -->
      <div v-if="!userId && !loading" class="p-4 bg-yellow-900/20 border border-yellow-800 text-yellow-300 rounded-xl">
        <p class="font-semibold text-sm">⚠️ Предупреждение</p>
        <p class="text-xs mt-1.5">
          Для работы приложения необходимо открыть его через Telegram Mini App.
        </p>
      </div>
    </div>

    <!-- Todo Modal -->
    <TodoModal :is-open="isModalOpen" :todo="selectedTodo" :projects="projects as readonly Project[]"
      @close="closeModal" @save="handleSaveTodo" @project-created="handleProjectCreated" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, CheckCircle2 } from 'lucide-vue-next'
import type { TodoFilter, Todo, CreateTodoDto, UpdateTodoDto, Project } from '~/types/todo'
import TodoModal from './TodoModal.vue'

const {
  todos,
  filter,
  loading,
  error,
  filteredTodos,
  activeCount,
  completedTodos,
  fetchTodos,
  createTodo,
  updateTodo,
  setFilter
} = useTodos()

// Apply date filter to filtered todos
const todosWithDateFilter = computed(() => {
  let result = filteredTodos.value

  if (dateFrom.value || dateTo.value) {
    result = result.filter(todo => {
      if (!todo.dueDate) return false

      const todoDate = new Date(todo.dueDate)
      todoDate.setHours(0, 0, 0, 0)

      if (dateFrom.value) {
        const fromDate = new Date(dateFrom.value)
        fromDate.setHours(0, 0, 0, 0)
        if (todoDate < fromDate) return false
      }

      if (dateTo.value) {
        const toDate = new Date(dateTo.value)
        toDate.setHours(23, 59, 59, 999)
        if (todoDate > toDate) return false
      }

      return true
    })
  }

  return result
})

const {
  projects,
  fetchProjects
} = useProjects()

const { $telegram } = useNuxtApp()
const userId = computed(() => $telegram?.user?.id || null)
const userName = computed(() => $telegram?.user?.username || null)

const isModalOpen = ref(false)
const selectedTodo = ref<Todo | null>(null)
const dateFrom = ref<Date | null>(null)
const dateTo = ref<Date | null>(null)

const openModal = () => {
  selectedTodo.value = null
  isModalOpen.value = true

  // Haptic feedback
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
  if (selectedTodo.value) {
    // Update existing todo
    await updateTodo(selectedTodo.value.id, data as UpdateTodoDto)
  } else {
    // Create new todo
    await createTodo(data as CreateTodoDto)
  }

  closeModal()

  // Haptic feedback
  if (process.client && (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred) {
    try {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
    } catch (error) {
      // HapticFeedback might not be supported in all Telegram WebApp versions
      console.debug('HapticFeedback not supported:', error)
    }
  }
}

const handleUpdate = (id: string, completed: boolean) => {
  // Already handled in TodoItem component
}

const handleDelete = (id: string) => {
  // Already handled in TodoItem component
  if (process.client && (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred) {
    try {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('medium')
    } catch (error) {
      // HapticFeedback might not be supported in all Telegram WebApp versions
      console.debug('HapticFeedback not supported:', error)
    }
  }
}

const handleEdit = (todo: Todo) => {
  selectedTodo.value = todo
  isModalOpen.value = true

  // Haptic feedback
  if (process.client && (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred) {
    try {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
    } catch (error) {
      // HapticFeedback might not be supported in all Telegram WebApp versions
      console.debug('HapticFeedback not supported:', error)
    }
  }
}

const handleFilterChange = (newFilter: TodoFilter) => {
  setFilter(newFilter)
}

const handleDateChange = (from: Date | null, to: Date | null) => {
  dateFrom.value = from
  dateTo.value = to
}

const handleClearCompleted = () => {
  // Already handled in TodoFilters component
  if (process.client && (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred) {
    try {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('medium')
    } catch (error) {
      // HapticFeedback might not be supported in all Telegram WebApp versions
      console.debug('HapticFeedback not supported:', error)
    }
  }
}

const handleProjectCreated = async (project: Project) => {
  // Refresh projects list to include the newly created project
  await fetchProjects()
}

onMounted(async () => {
  const { $telegram } = useNuxtApp()
  
  // Wait for Telegram SDK to be ready or use restored data
  const waitForTelegram = (): Promise<void> => {
    return new Promise((resolve) => {
      // If we already have user data (from sessionStorage), resolve immediately
      if ($telegram?.isReady && $telegram?.user) {
        resolve()
        return
      }
      
      // Check if Telegram SDK loads
      const checkInterval = setInterval(() => {
        if ((window as any).Telegram?.WebApp) {
          const tg = (window as any).Telegram.WebApp
          if (tg.initDataUnsafe?.user) {
            // Update telegram state
            if ($telegram) {
              $telegram.user = tg.initDataUnsafe.user
              $telegram.initData = tg.initData || ''
              $telegram.initDataUnsafe = tg.initDataUnsafe || {}
              $telegram.isReady = true
            }
            clearInterval(checkInterval)
            resolve()
          } else if ($telegram?.user) {
            // If we have restored user data but SDK doesn't have it yet, still resolve
            clearInterval(checkInterval)
            resolve()
          }
        } else if ($telegram?.user) {
          // If we have restored user data but SDK is not loaded, still resolve
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
      
      // Timeout after 3 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        resolve()
      }, 3000)
    })
  }
  
  await waitForTelegram()
  
  // Auto-authenticate user if available from Telegram (either fresh or restored)
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
  
  // Fetch projects and todos after authentication
  await Promise.all([
    fetchProjects(),
    fetchTodos()
  ])
})
</script>
