<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast"
      tag="div"
      class="fixed top-4 right-4 z-50 space-y-2"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'flex items-center p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300',
          getToastClasses(toast.type)
        ]"
      >
        <!-- Icon -->
        <div class="flex-shrink-0 mr-3">
          <i :class="getToastIcon(toast.type)" class="text-lg"></i>
        </div>

        <!-- Content -->
        <div class="flex-1">
          <p class="text-sm font-medium">{{ toast.title }}</p>
          <p v-if="toast.message" class="text-sm opacity-90">{{ toast.message }}</p>
        </div>

        <!-- Close button -->
        <button
          @click="removeToast(toast.id)"
          class="flex-shrink-0 ml-3 text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

const toasts = ref<Toast[]>([])

const getToastClasses = (type: Toast['type']) => {
  const baseClasses = 'text-white border-l-4'

  switch (type) {
    case 'success':
      return `${baseClasses} bg-green-500 border-green-600`
    case 'error':
      return `${baseClasses} bg-red-500 border-red-600`
    case 'warning':
      return `${baseClasses} bg-yellow-500 border-yellow-600 text-gray-900`
    case 'info':
    default:
      return `${baseClasses} bg-blue-500 border-blue-600`
  }
}

const getToastIcon = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return 'fas fa-check-circle'
    case 'error':
      return 'fas fa-exclamation-circle'
    case 'warning':
      return 'fas fa-exclamation-triangle'
    case 'info':
    default:
      return 'fas fa-info-circle'
  }
}

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = Date.now().toString()
  const newToast: Toast = {
    id,
    duration: 5000,
    ...toast
  }

  toasts.value.push(newToast)

  // Auto remove after duration
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }
}

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

const showSuccess = (title: string, message?: string) => {
  addToast({ type: 'success', title, message })
}

const showError = (title: string, message?: string) => {
  addToast({ type: 'error', title, message })
}

const showWarning = (title: string, message?: string) => {
  addToast({ type: 'warning', title, message })
}

const showInfo = (title: string, message?: string) => {
  addToast({ type: 'info', title, message })
}

// Expose methods for parent components
defineExpose({
  showSuccess,
  showError,
  showWarning,
  showInfo,
  addToast,
  removeToast
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>