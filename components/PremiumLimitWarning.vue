<template>
  <div
    v-if="show"
    class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4"
  >
    <div class="flex items-start gap-3">
      <i
        class="fas fa-exclamation-triangle text-yellow-600 dark:text-yellow-400 mt-0.5"
        aria-hidden="true"
      ></i>
      <div class="flex-1">
        <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
          {{ title }}
        </p>
        <p class="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
          {{ message }}
        </p>
        <NuxtLink
          v-if="showUpgradeLink"
          to="/premium"
          class="text-xs font-medium text-yellow-800 dark:text-yellow-200 hover:underline inline-flex items-center gap-1"
        >
          {{ $t('premium.learnMore') || 'Узнать больше о Premium' }}
          <i class="fas fa-arrow-right text-xs" aria-hidden="true"></i>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  title: string
  message: string
  showUpgradeLink?: boolean
}

withDefaults(defineProps<Props>(), {
  showUpgradeLink: true
})
</script>

