<template>
  <div class="fixed top-0 w-full bg-white shadow-sm z-50 transition-transform duration-300 ease-in-out">
    <div class="flex items-center justify-between px-4 py-3">
      <h1 class="text-xl font-bold text-gray-900">{{ title }}</h1>
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <i class="fas fa-user text-white text-sm"></i>
        </div>
        <button class="p-1 cursor-pointer" @click="$emit('menu-click')">
          <i class="fas fa-ellipsis-v text-gray-600"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'To-Do'
})

defineEmits<{
  'menu-click': []
}>()
</script>