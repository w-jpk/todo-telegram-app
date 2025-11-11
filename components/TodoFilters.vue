<template>
  <div class="space-y-3">
    <!-- Status Filters -->
    <div class="flex gap-2 overflow-x-auto scrollbar-hide">
      <button
        v-for="filterOption in filters"
        :key="filterOption.value"
        @click="setFilter(filterOption.value)"
        class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all touch-manipulation min-h-[44px] whitespace-nowrap shrink-0"
        :class="
          currentFilter === filterOption.value
            ? 'bg-telegram-button text-telegram-button-text shadow-sm active:scale-95'
            : 'bg-telegram-secondary-bg text-telegram-text active:bg-telegram-secondary-bg/80 active:scale-95'
        "
      >
        {{ filterOption.label }}
      </button>
    </div>

    <!-- Date Filter -->
    <div>
      <label class="block text-sm font-medium text-telegram-text mb-2">
        Фильтр по датам
      </label>
      <div class="grid grid-cols-2 gap-2">
        <div class="relative">
          <input
            :value="formatDateInput(dateFrom)"
            @change="handleDateFromChange"
            type="date"
            class="w-full px-4 py-3 bg-telegram-secondary-bg border border-telegram-secondary-bg/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-telegram-button focus:border-transparent text-telegram-text text-sm touch-manipulation min-h-[44px]"
            placeholder="От"
          />
          <Calendar :size="18" class="absolute right-3 top-1/2 -translate-y-1/2 text-telegram-hint pointer-events-none" />
        </div>
        <div class="relative">
          <input
            :value="formatDateInput(dateTo)"
            @change="handleDateToChange"
            type="date"
            class="w-full px-4 py-3 bg-telegram-secondary-bg border border-telegram-secondary-bg/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-telegram-button focus:border-transparent text-telegram-text text-sm touch-manipulation min-h-[44px]"
            placeholder="До"
          />
          <Calendar :size="18" class="absolute right-3 top-1/2 -translate-y-1/2 text-telegram-hint pointer-events-none" />
        </div>
      </div>
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
</script>

