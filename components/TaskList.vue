<template>
  <div class="space-y-3">
    <div
      v-for="task in tasks"
      :key="task.id"
      class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm dark:shadow-gray-900/50">
      <div class="flex items-start space-x-3">
        <button
          :class="{
            'bg-green-500 border-green-500': task.completed,
            'border-gray-300 dark:border-gray-600': !task.completed
          }"
          class="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          :aria-label="task.completed ? 'Mark task as incomplete' : 'Mark task as complete'"
          @click="$emit('toggle', task.id)">
          <i v-if="task.completed" class="fas fa-check text-white text-xs" aria-hidden="true"></i>
        </button>
        <div class="flex-1">
          <div class="flex items-center justify-between mb-1">
            <h3 :class="{ 'line-through text-gray-400 dark:text-gray-500': task.completed }" class="font-medium text-gray-900 dark:text-white">
              {{ task.text }}
            </h3>
            <div class="flex items-center space-x-2">
              <div v-if="task.priority && task.priority !== 'none'" :class="getPriorityColor(task.priority)"
                class="w-2 h-2 rounded-full"></div>
              <button
                class="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 p-1 rounded"
                @click="$emit('edit', task)"
                :aria-label="`Edit task: ${task.text}`">
                  <i class="fas fa-ellipsis-h text-gray-400 dark:text-gray-500 text-sm" aria-hidden="true"></i>
                </button>
            </div>
          </div>
            <p v-if="task.description" :class="{ 'line-through text-gray-400 dark:text-gray-500': task.completed }"
            class="text-sm text-gray-600 dark:text-gray-400 mb-2">
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
</template>

<script setup lang="ts">
import type { Todo } from '~/types/todo'
import { formatDateForDisplay, isOverdue, isToday } from '~/utils/date'

interface Props {
  tasks: Todo[]
}

defineProps<Props>()

defineEmits<{
  toggle: [id: string]
  edit: [task: Todo]
}>()

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500'
    case 'medium': return 'bg-yellow-500'
    case 'low': return 'bg-green-500'
    default: return 'bg-gray-400'
  }
}

const getDueDateColor = (dueDate: Date, completed: boolean) => {
  if (completed) return 'text-gray-500 dark:text-gray-400'
  if (isOverdue(dueDate)) return 'text-red-500 dark:text-red-400'
  if (isToday(dueDate)) return 'text-orange-500 dark:text-orange-400'
  return 'text-gray-500 dark:text-gray-400'
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Work': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
    case 'Personal': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    case 'Shopping': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
    case 'Health': return 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200'
    default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }
}

const formatDate = (dateString: Date) => {
  return formatDateForDisplay(dateString)
}
</script>