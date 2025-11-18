<template>
  <div v-if="selectedTasks.length > 0" class="fixed bottom-20 left-4 right-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 z-50">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t('bulk.selectedCount', { count: selectedTasks.length }) }}
        </span>
        <button
          @click="selectAll"
          class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {{ $t('bulk.selectAll') }}
        </button>
        <button
          @click="clearSelection"
          class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          {{ $t('bulk.clearSelection') }}
        </button>
      </div>

      <div class="flex items-center space-x-2">
        <button
          @click="markAsCompleted"
          class="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <i class="fas fa-check mr-1"></i>
          {{ $t('bulk.markCompleted') }}
        </button>
        <button
          @click="markAsIncomplete"
          class="px-3 py-1 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <i class="fas fa-undo mr-1"></i>
          {{ $t('bulk.markIncomplete') }}
        </button>
        <button
          @click="deleteSelected"
          class="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <i class="fas fa-trash mr-1"></i>
          {{ $t('bulk.delete') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  selectedTasks: string[]
  totalTasks: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'select-all': []
  'clear-selection': []
  'mark-completed': [taskIds: string[]]
  'mark-incomplete': [taskIds: string[]]
  'delete-selected': [taskIds: string[]]
}>()

const selectAll = () => {
  emit('select-all')
}

const clearSelection = () => {
  emit('clear-selection')
}

const markAsCompleted = () => {
  emit('mark-completed', props.selectedTasks)
}

const markAsIncomplete = () => {
  emit('mark-incomplete', props.selectedTasks)
}

const deleteSelected = () => {
  emit('delete-selected', props.selectedTasks)
}
</script>