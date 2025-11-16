<template>
  <div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
    <div class="flex items-center space-x-3">
      <div
        class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-200 transition-colors"
        @click="$emit('add-click')">
        <i class="fas fa-plus text-blue-500"></i>
      </div>
      <input
        type="text"
        :placeholder="placeholder"
        class="flex-1 text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent"
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