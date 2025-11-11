<template>
  <div
    class="bg-white dark:bg-telegram-section-bg border border-gray-100 dark:border-telegram-secondary-bg/50 rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all touch-manipulation"
    @click="handleOpenModal"
  >
    <div class="flex items-center gap-4">
      <!-- Checkbox -->
      <button
        @click.stop="toggleComplete"
        :class="{
          'text-blue-500 bg-blue-50 dark:bg-blue-500/20': todo.completed,
          'text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-telegram-secondary-bg': !todo.completed
        }"
        class="w-6 h-6 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-colors shrink-0"
      >
        <svg v-if="todo.completed" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <!-- Content -->
      <div class="flex-1 min-w-0">
        <!-- Title with Priority -->
        <div class="flex items-start gap-2 mb-1">
          <p
            class="text-base font-medium break-words flex-1"
            :class="{
              'line-through text-gray-400 dark:text-gray-500': todo.completed,
              'text-gray-900 dark:text-telegram-text': !todo.completed
            }"
          >
            {{ todo.text }}
          </p>
          <!-- Priority Indicator -->
          <div
            v-if="todo.priority && todo.priority !== 'none'"
            class="shrink-0"
            :class="getPriorityClass(todo.priority)"
          >
            <Flag :size="14" />
          </div>
        </div>
        
        <!-- Description -->
        <p
          v-if="todo.description"
          class="text-sm mt-1"
          :class="{
            'text-gray-300 dark:text-gray-600': todo.completed,
            'text-gray-500 dark:text-telegram-subtitle-text': !todo.completed
          }"
        >
          {{ todo.description }}
        </p>
        
        <!-- Meta Info: Project -->
        <div
          v-if="todo.project"
          class="flex items-center gap-1.5 mt-2"
        >
          <div
            class="w-2.5 h-2.5 rounded-full shrink-0"
            :style="{ backgroundColor: todo.project.color }"
          />
          <span 
            class="text-xs"
            :class="{
              'text-gray-300 dark:text-gray-600': todo.completed,
              'text-gray-500 dark:text-telegram-subtitle-text': !todo.completed
            }"
          >
            {{ todo.project.name }}
          </span>
        </div>
      </div>
      
      <!-- Due Date (right side) -->
      <div class="text-right shrink-0">
        <p
          v-if="todo.dueDate"
          class="text-sm font-medium"
          :class="{
            'text-gray-300 dark:text-gray-600': todo.completed,
            'text-gray-500 dark:text-telegram-subtitle-text': !todo.completed && !isOverdue,
            'text-red-500': isOverdue && !todo.completed
          }"
        >
          {{ formatDateShort(todo.dueDate) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Flag } from 'lucide-vue-next'
import type { Todo, TodoPriority } from '~/types/todo'

interface Props {
  todo: Todo
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [id: string, completed: boolean]
  delete: [id: string]
  edit: [todo: Todo]
}>()

const { updateTodo } = useTodos()

const toggleComplete = async () => {
  const newCompleted = !props.todo.completed
  await updateTodo(props.todo.id, { completed: newCompleted })
  emit('update', props.todo.id, newCompleted)
}

const handleOpenModal = () => {
  emit('edit', props.todo)
}

const handleDelete = async () => {
  if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
    const { deleteTodo } = useTodos()
    await deleteTodo(props.todo.id)
    emit('delete', props.todo.id)
  }
}

const formatDateShort = (date: Date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}

const isOverdue = computed(() => {
  if (!props.todo.dueDate || props.todo.completed) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(props.todo.dueDate)
  dueDate.setHours(0, 0, 0, 0)
  return dueDate < today
})

const getPriorityClass = (priority: TodoPriority) => {
  switch (priority) {
    case 'high':
      return 'text-red-500'
    case 'medium':
      return 'text-yellow-500'
    case 'low':
      return 'text-blue-500'
    default:
      return 'text-telegram-hint'
  }
}

</script>

