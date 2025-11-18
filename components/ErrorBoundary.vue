<template>
  <div>
    <slot v-if="!hasError" />
    <div v-else class="error-boundary p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
      <div class="flex items-center space-x-3 mb-3">
        <i class="fas fa-exclamation-triangle text-red-500 text-xl"></i>
        <h3 class="text-lg font-semibold text-red-800 dark:text-red-200">
          {{ $t('error.somethingWentWrong') }}
        </h3>
      </div>
      <p class="text-red-700 dark:text-red-300 mb-4">
        {{ $t('error.componentError') }}
      </p>
      <div class="flex space-x-3">
        <button
          @click="retry"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <i class="fas fa-redo mr-2"></i>
          {{ $t('error.tryAgain') }}
        </button>
        <button
          @click="reportError"
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <i class="fas fa-bug mr-2"></i>
          {{ $t('error.reportError') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  fallback?: any
}

const props = defineProps<Props>()

const hasError = ref(false)
const error = ref<Error | null>(null)
const errorInfo = ref<string>('')

const retry = () => {
  hasError.value = false
  error.value = null
  errorInfo.value = ''
}

const reportError = () => {
  // In a real app, this would send the error to a logging service
  console.error('Error reported:', error.value, errorInfo.value)
  alert('Error reported to developers')
}

const handleError = (err: Error, instance: any, info: string) => {
  hasError.value = true
  error.value = err
  errorInfo.value = info

  // Log error for monitoring
  console.error('Component error caught by boundary:', err, info)

  // In production, you might want to send this to an error tracking service
  if (!process.dev) {
    // sendToErrorTrackingService(err, info)
  }
}

// Use onErrorCaptured to catch errors in child components
onErrorCaptured(handleError)
</script>