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
          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 active:opacity-80'
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
    activeClass: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-2 border-gray-400 dark:border-gray-500'
  },
  {
    value: 'low' as TodoPriority,
    label: 'Низкий',
    icon: Flag,
    activeClass: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border-2 border-blue-500 dark:border-blue-400'
  },
  {
    value: 'medium' as TodoPriority,
    label: 'Средний',
    icon: Flag,
    activeClass: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 border-2 border-yellow-500 dark:border-yellow-400'
  },
  {
    value: 'high' as TodoPriority,
    label: 'Высокий',
    icon: Flag,
    activeClass: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 border-2 border-red-500 dark:border-red-400'
  }
]
</script>

