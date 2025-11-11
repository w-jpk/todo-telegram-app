<template>
  <div
    class="flex items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-telegram-section-bg rounded-xl sm:rounded-lg shadow-sm border border-telegram-secondary-bg/50 hover:shadow-md active:scale-[0.98] transition-all touch-manipulation cursor-pointer"
    :class="{ 'opacity-60': todo.completed }"
    @click="handleOpenModal"
  >
    <input
      type="checkbox"
      :checked="todo.completed"
      @change.stop="toggleComplete"
      class="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 sm:mt-0 text-telegram-button rounded focus:ring-2 focus:ring-telegram-button cursor-pointer touch-manipulation shrink-0"
    />
    
    <div class="flex-1 min-w-0" @click.stop>
      <div class="flex items-start gap-2 mb-1">
        <p
          class="text-telegram-text break-words text-sm sm:text-base leading-relaxed flex-1"
          :class="{ 'line-through text-telegram-hint': todo.completed }"
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
        class="text-xs text-telegram-subtitle-text mt-1 line-clamp-2"
      >
        {{ todo.description }}
      </p>
      
      <!-- Meta Info -->
      <div class="flex items-center gap-3 mt-2 flex-wrap">
        <!-- Project -->
        <div
          v-if="todo.project"
          class="flex items-center gap-1.5 text-xs"
        >
          <div
            class="w-2.5 h-2.5 rounded-full"
            :style="{ backgroundColor: todo.project.color }"
          />
          <span class="text-telegram-subtitle-text">{{ todo.project.name }}</span>
        </div>
        
        <!-- Due Date -->
        <div
          v-if="todo.dueDate"
          class="flex items-center gap-1 text-xs"
          :class="isOverdue ? 'text-red-500' : 'text-telegram-subtitle-text'"
        >
          <Calendar :size="12" />
          <span>{{ formatDate(todo.dueDate) }}</span>
        </div>
      </div>
    </div>
    
    <div class="flex items-center gap-1 sm:gap-2 shrink-0" @click.stop>
      <button
        @click="handleOpenModal"
        class="p-2 sm:p-2.5 text-telegram-hint active:text-telegram-link transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Edit"
      >
        <Edit :size="18" class="sm:w-5 sm:h-5" />
      </button>
      <button
        @click="handleDelete"
        class="p-2 sm:p-2.5 text-telegram-hint active:text-telegram-destructive-text transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Delete"
      >
        <Trash2 :size="18" class="sm:w-5 sm:h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Edit, Trash2, Flag, Calendar } from 'lucide-vue-next'
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

const formatDate = (date: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const dueDate = new Date(date)
  dueDate.setHours(0, 0, 0, 0)
  
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Сегодня'
  if (diffDays === 1) return 'Завтра'
  if (diffDays === -1) return 'Вчера'
  if (diffDays < 0) return `${Math.abs(diffDays)} дн. назад`
  if (diffDays <= 7) return `Через ${diffDays} дн.`
  
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
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

