<template>
  <div class="flex items-center justify-between gap-2 p-4 bg-telegram-secondary-bg rounded-lg">
    <div class="flex gap-2 flex-1">
      <button
        v-for="filterOption in filters"
        :key="filterOption.value"
        @click="setFilter(filterOption.value)"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="
          currentFilter === filterOption.value
            ? 'bg-telegram-button text-telegram-button-text'
            : 'bg-white text-telegram-text hover:bg-gray-100'
        "
      >
        {{ filterOption.label }}
      </button>
    </div>
    
    <button
      v-if="completedCount > 0"
      @click="handleClearCompleted"
      class="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
    >
      Очистить выполненные ({{ completedCount }})
    </button>
  </div>
</template>

<script setup lang="ts">
import type { TodoFilter } from '~/types/todo'

interface FilterOption {
  value: TodoFilter
  label: string
}

const filters: FilterOption[] = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Выполненные' }
]

interface Props {
  currentFilter: TodoFilter
  completedCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  filter: [filter: TodoFilter]
  clearCompleted: []
}>()

const { clearCompleted } = useTodos()

const setFilter = (filter: TodoFilter) => {
  emit('filter', filter)
}

const handleClearCompleted = async () => {
  if (confirm(`Вы уверены, что хотите удалить ${props.completedCount} выполненных задач?`)) {
    await clearCompleted()
    emit('clearCompleted')
  }
}
</script>

