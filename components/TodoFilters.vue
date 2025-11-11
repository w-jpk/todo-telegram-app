<template>
  <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 bg-telegram-section-bg rounded-xl sm:rounded-lg border border-telegram-secondary-bg/50">
    <div class="flex gap-1.5 sm:gap-2 flex-1 overflow-x-auto scrollbar-hide">
      <button
        v-for="filterOption in filters"
        :key="filterOption.value"
        @click="setFilter(filterOption.value)"
        class="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all touch-manipulation min-h-[44px] whitespace-nowrap shrink-0"
        :class="
          currentFilter === filterOption.value
            ? 'bg-telegram-button text-telegram-button-text shadow-sm active:scale-95'
            : 'bg-telegram-secondary-bg text-telegram-text active:bg-telegram-secondary-bg/80 active:scale-95'
        "
      >
        {{ filterOption.label }}
      </button>
    </div>
    
    <button
      v-if="completedCount > 0"
      @click="handleClearCompleted"
      class="px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium active:bg-red-600 active:scale-95 transition-all touch-manipulation min-h-[44px] whitespace-nowrap shrink-0"
    >
      <span class="hidden xs:inline">Очистить выполненные</span>
      <span class="xs:hidden">Очистить</span>
      <span class="ml-1">({{ completedCount }})</span>
    </button>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>

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

