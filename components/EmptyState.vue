<template>
  <div class="text-center py-12">
    <div class="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
      <i class="fas fa-check-circle text-white text-3xl"></i>
    </div>
    <p class="text-lg font-medium text-gray-900 dark:text-white mb-2">
      {{ title }}
    </p>
    <p class="text-sm text-gray-500 dark:text-gray-400 px-4">
      {{ subtitle }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle: string
}

defineProps<Props>()
</script>