<template>
  <div class="flex gap-2 flex-wrap">
    <button
      v-for="priority in priorities"
      :key="priority.value"
      @click="$emit('update:modelValue', priority.value)"
      class="flex-1 min-w-[80px] px-2 sm:px-3 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all touch-manipulation min-h-[44px]"
      :class="
        modelValue === priority.value
          ? priority.activeClass
          : 'bg-telegram-secondary-bg text-telegram-text active:opacity-80'
      "
    >
      <div class="flex items-center justify-center gap-1 sm:gap-1.5">
        <component :is="priority.icon" :size="14" class="sm:w-4 sm:h-4" />
        <span class="whitespace-nowrap">{{ priority.label }}</span>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Flag, FlagOff } from 'lucide-vue-next'
import type { TodoPriority } from '~/types/todo'

interface Props {
  modelValue: TodoPriority
}

const props = defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: TodoPriority]
}>()

const priorities = [
  {
    value: 'none' as TodoPriority,
    label: 'Нет',
    icon: FlagOff,
    activeClass: 'bg-telegram-secondary-bg text-telegram-text border-2 border-telegram-hint'
  },
  {
    value: 'low' as TodoPriority,
    label: 'Низкий',
    icon: Flag,
    activeClass: 'bg-blue-100 text-blue-700 border-2 border-blue-500'
  },
  {
    value: 'medium' as TodoPriority,
    label: 'Средний',
    icon: Flag,
    activeClass: 'bg-yellow-100 text-yellow-700 border-2 border-yellow-500'
  },
  {
    value: 'high' as TodoPriority,
    label: 'Высокий',
    icon: Flag,
    activeClass: 'bg-red-100 text-red-700 border-2 border-red-500'
  }
]
</script>

