<template>
  <div
    class="flex items-center gap-3 p-4 bg-telegram-secondary-bg rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    :class="{ 'opacity-60': todo.completed }"
  >
    <input
      type="checkbox"
      :checked="todo.completed"
      @change="toggleComplete"
      class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
    />
    
    <div class="flex-1 min-w-0">
      <input
        v-if="isEditing"
        v-model="editedText"
        @blur="saveEdit"
        @keyup.enter="saveEdit"
        @keyup.esc="cancelEdit"
        class="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        ref="editInput"
      />
      <p
        v-else
        @dblclick="startEdit"
        class="text-telegram-text cursor-text break-words"
        :class="{ 'line-through text-telegram-hint': todo.completed }"
      >
        {{ todo.text }}
      </p>
      <p
        v-if="todo.dueDate"
        class="text-xs text-telegram-hint mt-1"
      >
        {{ formatDate(todo.dueDate) }}
      </p>
    </div>
    
    <div class="flex items-center gap-2">
      <button
        @click="startEdit"
        class="p-2 text-telegram-hint hover:text-telegram-link transition-colors"
        v-if="!isEditing"
        aria-label="Edit"
      >
        <Edit :size="18" />
      </button>
      <button
        @click="handleDelete"
        class="p-2 text-telegram-hint hover:text-red-600 transition-colors"
        aria-label="Delete"
      >
        <Trash2 :size="18" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Edit, Trash2 } from 'lucide-vue-next'
import type { Todo } from '~/types/todo'

interface Props {
  todo: Todo
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [id: string, completed: boolean]
  delete: [id: string]
  edit: [id: string, text: string]
}>()

const isEditing = ref(false)
const editedText = ref(props.todo.text)
const editInput = ref<HTMLInputElement | null>(null)

const { updateTodo } = useTodos()

const toggleComplete = async () => {
  const newCompleted = !props.todo.completed
  await updateTodo(props.todo.id, { completed: newCompleted })
  emit('update', props.todo.id, newCompleted)
}

const startEdit = async () => {
  isEditing.value = true
  editedText.value = props.todo.text
  await nextTick()
  editInput.value?.focus()
}

const saveEdit = async () => {
  if (editedText.value.trim() && editedText.value !== props.todo.text) {
    await updateTodo(props.todo.id, { text: editedText.value.trim() })
    emit('edit', props.todo.id, editedText.value.trim())
  }
  isEditing.value = false
}

const cancelEdit = () => {
  editedText.value = props.todo.text
  isEditing.value = false
}

const handleDelete = async () => {
  if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
    const { deleteTodo } = useTodos()
    await deleteTodo(props.todo.id)
    emit('delete', props.todo.id)
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

