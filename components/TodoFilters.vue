<template>
  <div class="space-y-6">
    <!-- Status Filters -->
    <div class="flex bg-gray-100 rounded-xl p-1">
      <button
        v-for="filterOption in filters"
        :key="filterOption.value"
        @click="setFilter(filterOption.value)"
        class="flex-1 py-2 px-1 rounded-xl text-sm font-medium transition-all touch-manipulation cursor-pointer"
        :class="
          currentFilter === filterOption.value
            ? 'bg-white shadow-sm text-blue-500'
            : 'text-gray-600'
        "
      >
        {{ filterOption.label }}
      </button>
    </div>

    <!-- Date Filter -->
    <div>
      <h3 class="text-sm font-medium text-gray-900 mb-3">
        Фильтр по датам
      </h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="relative">
          <Calendar :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
          <input
            :value="formatDateInput(dateFrom)"
            @change="handleDateFromChange"
            type="date"
            class="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 touch-manipulation"
            placeholder="От"
          />
        </div>
        <div class="relative">
          <Calendar :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
          <input
            :value="formatDateInput(dateTo)"
            @change="handleDateToChange"
            type="date"
            class="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 touch-manipulation"
            placeholder="До"
          />
        </div>
      </div>
      <!-- Clear date filter button -->
      <button
        v-if="dateFrom || dateTo"
        @click="clearDateFilter"
        class="mt-3 text-xs text-gray-600 hover:text-gray-900 transition-colors touch-manipulation"
      >
        Очистить фильтр даты
      </button>
    </div>
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

input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 8px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
</style>

<script setup lang="ts">
import { Calendar } from 'lucide-vue-next'
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
  dateFrom?: Date | null
  dateTo?: Date | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  filter: [filter: TodoFilter]
  'date-change': [from: Date | null, to: Date | null]
}>()

const setFilter = (filter: TodoFilter) => {
  emit('filter', filter)
}

const formatDateInput = (date: Date | null | undefined) => {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

const handleDateFromChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const date = target.value ? new Date(target.value) : null
  emit('date-change', date, props.dateTo || null)
}

const handleDateToChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const date = target.value ? new Date(target.value) : null
  emit('date-change', props.dateFrom || null, date)
}

const clearDateFilter = () => {
  emit('date-change', null, null)
}
</script>

