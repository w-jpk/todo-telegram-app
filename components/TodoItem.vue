<template>
  <div
    class="flex items-start gap-3 p-4 bg-telegram-section-bg rounded-xl shadow-sm border border-telegram-secondary-bg/50 hover:shadow-md active:scale-[0.98] transition-all touch-manipulation cursor-pointer"
    :class="{ 'opacity-60': todo.completed }"
    @click="handleOpenModal"
  >
    <input
      type="checkbox"
      :checked="todo.completed"
      @change.stop="toggleComplete"
      class="w-6 h-6 mt-0.5 text-telegram-button rounded focus:ring-2 focus:ring-telegram-button cursor-pointer touch-manipulation shrink-0"
    />
    
    <div class="flex-1 min-w-0 flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <!-- Title -->
        <p
          class="text-telegram-text break-words text-base font-medium leading-relaxed"
          :class="{ 'line-through text-telegram-hint': todo.completed }"
        >
          {{ todo.text }}
        </p>
        
        <!-- Description -->
        <p
          v-if="todo.description"
          class="text-sm text-telegram-subtitle-text mt-1 line-clamp-2"
          :class="{ 'line-through': todo.completed }"
        >
          {{ todo.description }}
        </p>
      </div>
      
      <!-- Due Date (right side) -->
      <div
        v-if="todo.dueDate"
        class="text-sm text-telegram-subtitle-text shrink-0"
        :class="isOverdue && !todo.completed ? 'text-red-500' : ''"
      >
        {{ formatDateShort(todo.dueDate) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Todo } from '~/types/todo'

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

</script>

