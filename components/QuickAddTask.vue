<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm dark:shadow-gray-900/50">
    <div class="flex items-center space-x-3">
      <div
        class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        @click="$emit('add-click')">
        <i class="fas fa-plus text-blue-500 dark:text-blue-400"></i>
      </div>
      <input
        type="text"
        :placeholder="placeholder"
        class="flex-1 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-none outline-none bg-transparent"
        v-model="inputValue"
        @keyup.enter="handleAdd"
        @focus="$emit('add-click')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  placeholder?: string
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Add a new task...',
  modelValue: ''
})

const emit = defineEmits<{
  'add-click': []
  'update:modelValue': [value: string]
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleAdd = () => {
  if (inputValue.value.trim()) {
    emit('add-click')
  }
}
</script>