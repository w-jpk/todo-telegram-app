<template>
  <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 mb-6 text-white">
    <div class="flex justify-between items-center">
      <div class="text-center">
        <div class="text-2xl font-bold">{{ todayTasksCount }}</div>
        <div class="text-sm opacity-90">Tasks Today</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold">{{ completedTodayCount }}</div>
        <div class="text-sm opacity-90">Completed</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold">{{ pendingTodayCount }}</div>
        <div class="text-sm opacity-90">Pending</div>
      </div>
    </div>
    <div class="mt-3 bg-white bg-opacity-20 rounded-full h-2">
      <div class="bg-white rounded-full h-2" :style="{ width: completionPercentage + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  todayTasksCount: number
  completedTodayCount: number
  pendingTodayCount: number
  completionPercentage: number
}

defineProps<Props>()
</script>