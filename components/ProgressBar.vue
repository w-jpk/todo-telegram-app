<template>
  <div class="bg-white rounded-xl p-4 mt-6 shadow-sm">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-medium text-gray-900">{{ title }}</h3>
      <span class="text-sm text-gray-600">{{ percentage }}%</span>
    </div>
    <div class="bg-gray-200 rounded-full h-2">
      <div :style="{ width: percentage + '%' }"
        class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full h-2 transition-all duration-300"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  percentage: number
}

const props = withDefaults(defineProps<Props>(), {
  title: "Today's Progress"
})
</script>