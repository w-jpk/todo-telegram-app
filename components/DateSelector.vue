<template>
  <div class="space-y-2">
    <div class="flex gap-2">
      <button
        v-for="(quickDate, index) in quickDates"
        :key="index"
        @click="selectQuickDate(quickDate.value)"
        class="flex-1 px-3 py-2 bg-telegram-secondary-bg text-telegram-text rounded-xl text-sm font-medium active:opacity-80 transition-opacity touch-manipulation min-h-[44px]"
        :class="{ 'bg-telegram-button text-telegram-button-text': quickDate.selected }"
      >
        {{ quickDate.label }}
      </button>
    </div>
    
    <input
      v-model="dateInput"
      type="date"
      :min="today"
      class="w-full px-4 py-3 bg-telegram-secondary-bg border border-telegram-secondary-bg/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-telegram-button focus:border-transparent text-telegram-text text-base touch-manipulation min-h-[44px]"
    />
    
    <div v-if="modelValue" class="flex items-center justify-between px-2">
      <span class="text-sm text-telegram-hint">
        Выбрано: {{ formatDate(modelValue) }}
      </span>
      <button
        @click="clearDate"
        class="text-sm text-telegram-link hover:text-telegram-button transition-colors touch-manipulation"
      >
        Очистить
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue?: Date | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value?: Date | null]
}>()

const today = new Date().toISOString().split('T')[0]

const dateInput = ref('')

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    dateInput.value = new Date(newVal).toISOString().split('T')[0]
  } else {
    dateInput.value = ''
  }
}, { immediate: true })

watch(dateInput, (newVal) => {
  if (newVal) {
    const date = new Date(newVal)
    date.setHours(23, 59, 59, 999)
    emit('update:modelValue', date)
  } else {
    emit('update:modelValue', undefined)
  }
})

const quickDates = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  
  const currentValue = props.modelValue ? new Date(props.modelValue).setHours(0, 0, 0, 0) : null
  
  return [
    {
      value: today,
      label: 'Сегодня',
      selected: currentValue === today.getTime()
    },
    {
      value: tomorrow,
      label: 'Завтра',
      selected: currentValue === tomorrow.getTime()
    },
    {
      value: nextWeek,
      label: 'Через неделю',
      selected: currentValue === nextWeek.getTime()
    }
  ]
})

const selectQuickDate = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0]
  dateInput.value = dateStr
}

const clearDate = () => {
  dateInput.value = ''
  emit('update:modelValue', null)
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

