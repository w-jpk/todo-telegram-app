<template>
  <div class="space-y-3">
    <div
      v-for="task in tasks"
      :key="task.id"
      class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-start space-x-3">
        <button
          :class="{
            'bg-green-500 border-green-500': task.completed,
            'border-gray-300': !task.completed
          }"
          class="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 cursor-pointer"
          @click="$emit('toggle', task.id)">
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
              <button class="cursor-pointer" @click="$emit('edit', task)">
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
</template>

<script setup lang="ts">
import type { Todo } from '~/types/todo'

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
</script>