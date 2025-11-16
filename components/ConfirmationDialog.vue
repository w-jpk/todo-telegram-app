<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="cancel"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isVisible"
            class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
          >
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center space-x-3">
                <div :class="`w-10 h-10 ${iconColor} rounded-full flex items-center justify-center`">
                  <i :class="icon" class="text-white"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="px-6 py-4">
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">{{ message }}</p>

              <!-- Additional Info -->
              <div v-if="additionalInfo" class="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ additionalInfo }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex space-x-3">
              <button
                @click="cancel"
                class="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
              >
                {{ cancelText }}
              </button>
              <button
                @click="confirm"
                :class="`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${confirmButtonClass}`"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  icon?: string
  iconColor?: string
  confirmButtonClass?: string
  additionalInfo?: string
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  icon: 'fas fa-exclamation-triangle',
  iconColor: 'bg-red-500',
  confirmButtonClass: 'bg-red-500 hover:bg-red-600'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const isVisible = ref(false)

const show = () => {
  isVisible.value = true
}

const hide = () => {
  isVisible.value = false
}

const confirm = () => {
  emit('confirm')
  hide()
}

const cancel = () => {
  emit('cancel')
  hide()
}

// Expose methods for parent component
defineExpose({
  show,
  hide
})
</script>