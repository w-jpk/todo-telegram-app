<template>
  <div class="min-h-screen-safe bg-telegram-bg pb-safe-bottom">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-telegram-header-bg backdrop-blur-sm border-b border-telegram-secondary-bg/50 shadow-sm safe-top">
      <div class="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div class="flex items-center justify-between gap-2">
          <h1 class="text-xl sm:text-2xl font-bold text-telegram-text truncate flex-1">
            📝 Мои Задачи
          </h1>
          <div
            v-if="activeCount > 0"
            class="px-2.5 sm:px-3 py-1 bg-telegram-button text-telegram-button-text rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0"
          >
            {{ activeCount }} {{ activeCount === 1 ? 'задача' : activeCount < 5 ? 'задачи' : 'задач' }}
          </div>
        </div>
      </div>
    </header>

      <!-- Add Todo Button -->
      <div class="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <button
          @click="openModal"
          class="w-full px-4 sm:px-6 py-3 sm:py-4 bg-telegram-button text-telegram-button-text rounded-xl sm:rounded-lg font-medium active:opacity-80 transition-opacity flex items-center justify-center gap-2 min-h-[52px] touch-manipulation shadow-sm hover:shadow-md"
        >
          <Plus :size="20" />
          <span>Добавить задачу</span>
        </button>
      </div>

      <!-- Content -->
      <div class="container mx-auto px-3 sm:px-4">
        <!-- Error Message -->
        <div
          v-if="error"
          class="mb-3 sm:mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl sm:rounded-lg text-sm sm:text-base"
        >
          {{ error }}
        </div>

        <!-- Loading State -->
        <div v-if="loading && filteredTodos.length === 0" class="text-center py-12 sm:py-16">
          <div class="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-2 border-telegram-button border-t-transparent"></div>
          <p class="mt-3 sm:mt-4 text-telegram-hint text-sm sm:text-base">Загрузка задач...</p>
        </div>

        <!-- Todo List -->
        <div v-else-if="filteredTodos.length > 0" class="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
          <TodoItem
            v-for="todo in filteredTodos"
            :key="todo.id"
            :todo="todo"
            @update="handleUpdate"
            @delete="handleDelete"
            @edit="handleEdit"
          />
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="text-center py-12 sm:py-16 text-telegram-hint"
        >
          <CheckCircle2 :size="56" class="mx-auto mb-4 sm:mb-6 opacity-50" />
          <p class="text-base sm:text-lg font-medium text-telegram-text mb-2">
            {{ filter === 'active' ? 'Нет активных задач' : filter === 'completed' ? 'Нет выполненных задач' : 'Нет задач' }}
          </p>
          <p class="text-sm sm:text-base text-telegram-hint px-4">
            {{ filter === 'all' ? 'Добавьте первую задачу выше' : 'Измените фильтр, чтобы увидеть другие задачи' }}
          </p>
        </div>

        <!-- User not authenticated warning -->
        <div
          v-if="!userId && !loading"
          class="mt-3 sm:mt-4 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 rounded-xl sm:rounded-lg"
        >
          <p class="font-semibold text-sm sm:text-base">⚠️ Предупреждение</p>
          <p class="text-xs sm:text-sm mt-1.5">
            Для работы приложения необходимо открыть его через Telegram Mini App.
          </p>
        </div>

        <!-- Filters -->
        <TodoFilters
          :current-filter="filter"
          :completed-count="completedTodos.length"
          @filter="handleFilterChange"
          @clear-completed="handleClearCompleted"
        />
      </div>
      
      <!-- Todo Modal -->
      <TodoModal
        :is-open="isModalOpen"
        :todo="selectedTodo"
        :projects="projects as readonly Project[]"
        @close="closeModal"
        @save="handleSaveTodo"
      />
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

const {
  projects,
  fetchProjects
} = useProjects()

const { $telegram } = useNuxtApp()
const userId = computed(() => $telegram?.user?.id || null)

const isModalOpen = ref(false)
const selectedTodo = ref<Todo | null>(null)

const openModal = () => {
  selectedTodo.value = null
  isModalOpen.value = true
  
  // Haptic feedback
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
    // Update existing todo
    await updateTodo(selectedTodo.value.id, data as UpdateTodoDto)
  } else {
    // Create new todo
    await createTodo(data as CreateTodoDto)
  }
  
  closeModal()
  
  // Haptic feedback
  if (process.client && (window as any).Telegram?.WebApp) {
    (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
  }
}

const handleUpdate = (id: string, completed: boolean) => {
  // Already handled in TodoItem component
}

const handleDelete = (id: string) => {
  // Already handled in TodoItem component
  if (process.client && (window as any).Telegram?.WebApp) {
    (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('medium')
  }
}

const handleEdit = (todo: Todo) => {
  selectedTodo.value = todo
  isModalOpen.value = true
  
  // Haptic feedback
  if (process.client && (window as any).Telegram?.WebApp) {
    (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
  }
}

const handleFilterChange = (newFilter: TodoFilter) => {
  setFilter(newFilter)
}

const handleClearCompleted = () => {
  // Already handled in TodoFilters component
  if (process.client && (window as any).Telegram?.WebApp) {
    (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('medium')
  }
}

onMounted(async () => {
  const { $telegram } = useNuxtApp()
  
  // Auto-authenticate user if available from Telegram
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

