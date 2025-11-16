<template>
  <button
    class="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-all duration-300 ease-in-out"
    @click="$emit('click')">
    <i class="fas fa-plus text-white text-xl"></i>
  </button>
</template>

<script setup lang="ts">
defineEmits<{
  click: []
}>()
</script>