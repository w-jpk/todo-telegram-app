<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ $t('tasks.recurrence') }}
      </label>
      <select
        v-model="selectedType"
        class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
        @change="handleTypeChange"
      >
        <option value="">{{ $t('tasks.noRecurrence') }}</option>
        <option value="daily">{{ $t('tasks.daily') }}</option>
        <option value="weekly">{{ $t('tasks.weekly') }}</option>
        <option value="monthly">{{ $t('tasks.monthly') }}</option>
        <option value="yearly">{{ $t('tasks.yearly') }}</option>
      </select>
    </div>

    <div v-if="selectedType" class="space-y-4">
      <!-- Interval -->
      <div v-if="selectedType !== 'daily'">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ $t('tasks.every') }}
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="interval"
            type="number"
            min="1"
            max="365"
            class="w-20 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          />
          <span class="text-gray-600 dark:text-gray-400">
            {{ getIntervalLabel() }}
          </span>
        </div>
      </div>

      <!-- Days of week for weekly -->
      <div v-if="selectedType === 'weekly'">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ $t('tasks.onDays') }}
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="day in weekDays"
            :key="day.value"
            @click="toggleDay(day.value)"
            :class="[
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedDays.includes(day.value)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            {{ day.label }}
          </button>
        </div>
      </div>

      <!-- End date -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ $t('tasks.endDate') }}
        </label>
        <div class="flex items-center gap-4">
          <label class="flex items-center">
            <input
              v-model="hasEndDate"
              type="radio"
              name="endType"
              class="mr-2"
              @change="endDate = ''"
            />
            <span class="text-gray-600 dark:text-gray-400">{{ $t('tasks.noEndDate') }}</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="hasEndDate"
              type="radio"
              name="endType"
              :value="true"
              class="mr-2"
            />
            <input
              v-model="endDate"
              type="date"
              :min="minEndDate"
              class="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              :disabled="!hasEndDate"
            />
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecurrenceRule, RecurrenceType } from '~/types/todo'

interface Props {
  modelValue?: RecurrenceRule
}

interface Emits {
  (e: 'update:modelValue', value: RecurrenceRule | undefined): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedType = ref<RecurrenceType | ''>('')
const interval = ref(1)
const selectedDays = ref<number[]>([])
const hasEndDate = ref(false)
const endDate = ref<string>('')

const weekDays = [
  { value: 1, label: 'tasks.monday' },
  { value: 2, label: 'tasks.tuesday' },
  { value: 3, label: 'tasks.wednesday' },
  { value: 4, label: 'tasks.thursday' },
  { value: 5, label: 'tasks.friday' },
  { value: 6, label: 'tasks.saturday' },
  { value: 0, label: 'tasks.sunday' }
]

const minEndDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

// Reset form function - must be declared before watch
const resetForm = () => {
  selectedType.value = ''
  interval.value = 1
  selectedDays.value = []
  hasEndDate.value = false
  endDate.value = ''
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedType.value = newValue.type
    interval.value = newValue.interval || 1
    selectedDays.value = newValue.daysOfWeek || []
    hasEndDate.value = !!newValue.endDate
    endDate.value = newValue.endDate ? new Date(newValue.endDate).toISOString().split('T')[0] : ''
  } else {
    resetForm()
  }
}, { immediate: true })

const handleTypeChange = () => {
  if (selectedType.value === 'weekly' && selectedDays.value.length === 0) {
    // Default to current day of week for weekly recurrence
    const today = new Date().getDay()
    selectedDays.value = [today]
  }
  emitValue()
}

const toggleDay = (day: number) => {
  const index = selectedDays.value.indexOf(day)
  if (index > -1) {
    selectedDays.value.splice(index, 1)
  } else {
    selectedDays.value.push(day)
  }
  emitValue()
}

const getIntervalLabel = () => {
  const labels = {
    weekly: 'tasks.weeks',
    monthly: 'tasks.months',
    yearly: 'tasks.years'
  }
  return $t(labels[selectedType.value as keyof typeof labels] || 'tasks.days')
}

const emitValue = () => {
  if (!selectedType.value) {
    emit('update:modelValue', undefined)
    return
  }

  const recurrenceRule: RecurrenceRule = {
    type: selectedType.value,
    interval: interval.value
  }

  if (selectedType.value === 'weekly' && selectedDays.value.length > 0) {
    recurrenceRule.daysOfWeek = selectedDays.value
  }

  if (hasEndDate.value && endDate.value) {
    recurrenceRule.endDate = new Date(endDate.value)
  }

  emit('update:modelValue', recurrenceRule)
}

// Watch for changes to emit value
watch([selectedType, interval, selectedDays, hasEndDate, endDate], emitValue, { deep: true })
</script>