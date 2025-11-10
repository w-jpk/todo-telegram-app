<template>
  <div class="min-h-screen bg-telegram-bg pb-20">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-telegram-bg border-b border-gray-200 shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-telegram-text">
            📝 Мои Задачи
          </h1>
          <div
            v-if="activeCount > 0"
            class="px-3 py-1 bg-telegram-button text-telegram-button-text rounded-full text-sm font-semibold"
          >
            {{ activeCount }} {{ activeCount === 1 ? 'задача' : activeCount < 5 ? 'задачи' : 'задач' }}
          </div>
        </div>
      </div>
    </header>

    <!-- Add Todo Form -->
    <div class="container mx-auto px-4 py-4">
      <form @submit.prevent="handleAddTodo" class="mb-4">
        <div class="flex gap-2">
          <input
            v-model="newTodoText"
            type="text"
            placeholder="Добавить новую задачу..."
            class="flex-1 px-4 py-3 bg-telegram-secondary-bg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-telegram-button text-telegram-text placeholder-telegram-hint"
            :disabled="loading"
          />
          <button
            type="submit"
            :disabled="!newTodoText.trim() || loading"
            class="px-6 py-3 bg-telegram-button text-telegram-button-text rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus :size="20" />
            Добавить
          </button>
        </div>
      </form>

      <!-- Error Message -->
      <div
        v-if="error"
        class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg"
      >
        {{ error }}
      </div>

      <!-- Loading State -->
      <div v-if="loading && filteredTodos.length === 0" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-telegram-button"></div>
        <p class="mt-2 text-telegram-hint">Загрузка задач...</p>
      </div>

      <!-- Todo List -->
      <div v-else-if="filteredTodos.length > 0" class="space-y-2 mb-4">
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
        class="text-center py-12 text-telegram-hint"
      >
        <CheckCircle2 :size="48" class="mx-auto mb-4 opacity-50" />
        <p class="text-lg">
          {{ filter === 'active' ? 'Нет активных задач' : filter === 'completed' ? 'Нет выполненных задач' : 'Нет задач' }}
        </p>
        <p class="text-sm mt-2">
          {{ filter === 'all' ? 'Добавьте первую задачу выше' : 'Измените фильтр, чтобы увидеть другие задачи' }}
        </p>
      </div>

      <!-- User not authenticated warning -->
      <div
        v-if="!userId && !loading"
        class="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg"
      >
        <p class="font-semibold">⚠️ Предупреждение</p>
        <p class="text-sm mt-1">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, CheckCircle2 } from 'lucide-vue-next'
import type { TodoFilter } from '~/types/todo'

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
  setFilter
} = useTodos()

const { $telegram } = useNuxtApp()
const userId = computed(() => $telegram?.user?.id || null)

const newTodoText = ref('')

const handleAddTodo = async () => {
  if (!newTodoText.value.trim()) return
  
  const todo = await createTodo({ text: newTodoText.value.trim() })
  if (todo) {
    newTodoText.value = ''
    // Haptic feedback
    if (process.client && (window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
    }
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

const handleEdit = (id: string, text: string) => {
  // Already handled in TodoItem component
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
  
  // Fetch todos after authentication
  await fetchTodos()
})
</script>

