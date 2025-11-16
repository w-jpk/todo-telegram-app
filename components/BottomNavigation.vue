<template>
  <div class="fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 transition-transform duration-300 ease-in-out">
    <div class="grid grid-cols-4 py-2">
      <NuxtLink
        to="/"
        class="flex flex-col items-center justify-center py-2 cursor-pointer transition-colors"
        :class="isActive('/') ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'"
      >
        <i class="fas fa-tasks text-lg mb-1" :class="isActive('/') ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'"></i>
        <span class="text-xs" :class="isActive('/') ? 'text-blue-500 font-medium' : 'text-gray-400 dark:text-gray-500'">Tasks</span>
      </NuxtLink>
      <NuxtLink
        to="/calendar"
        class="flex flex-col items-center justify-center py-2 cursor-pointer transition-colors"
        :class="isActive('/calendar') ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'"
      >
        <i class="fas fa-calendar-alt text-lg mb-1" :class="isActive('/calendar') ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'"></i>
        <span class="text-xs" :class="isActive('/calendar') ? 'text-blue-500 font-medium' : 'text-gray-400 dark:text-gray-500'">Calendar</span>
      </NuxtLink>
      <NuxtLink
        to="/stats"
        class="flex flex-col items-center justify-center py-2 cursor-pointer transition-colors"
        :class="isActive('/stats') ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'"
      >
        <i class="fas fa-chart-bar text-lg mb-1" :class="isActive('/stats') ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'"></i>
        <span class="text-xs" :class="isActive('/stats') ? 'text-blue-500 font-medium' : 'text-gray-400 dark:text-gray-500'">Stats</span>
      </NuxtLink>
      <NuxtLink
        to="/settings"
        class="flex flex-col items-center justify-center py-2 cursor-pointer transition-colors"
        :class="isActive('/settings') ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'"
      >
        <i class="fas fa-cog text-lg mb-1" :class="isActive('/settings') ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'"></i>
        <span class="text-xs" :class="isActive('/settings') ? 'text-blue-500 font-medium' : 'text-gray-400 dark:text-gray-500'">Settings</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

