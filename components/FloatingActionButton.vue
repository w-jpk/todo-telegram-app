<template>
  <button
    class="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 dark:bg-blue-600 rounded-full shadow-lg dark:shadow-blue-900/50 flex items-center justify-center cursor-pointer hover:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-300 ease-in-out"
    @click="$emit('click')">
    <i class="fas fa-plus text-white text-xl"></i>
  </button>
</template>

<script setup lang="ts">
defineEmits<{
  click: []
}>()
</script>