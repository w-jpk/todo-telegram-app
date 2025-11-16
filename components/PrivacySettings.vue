<template>
  <div v-if="localSettings" class="space-y-6">
    <!-- Analytics & Tracking -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Analytics & Tracking</h3>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Usage Analytics</label>
            <p class="text-xs text-gray-500 dark:text-gray-400">Help improve the app by sharing anonymous usage data</p>
          </div>
          <input
            type="checkbox"
            v-model="localSettings.analyticsEnabled"
            @change="updateSetting('analyticsEnabled', localSettings.analyticsEnabled)"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Crash Reporting</label>
            <p class="text-xs text-gray-500 dark:text-gray-400">Automatically report crashes to help fix issues</p>
          </div>
          <input
            type="checkbox"
            v-model="localSettings.crashReportingEnabled"
            @change="updateSetting('crashReportingEnabled', localSettings.crashReportingEnabled)"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>
    </div>

    <!-- Data Security -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Data Security</h3>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Data Encryption</label>
            <p class="text-xs text-gray-500 dark:text-gray-400">Encrypt sensitive data stored locally</p>
          </div>
          <input
            type="checkbox"
            v-model="localSettings.dataEncryptionEnabled"
            @change="updateSetting('dataEncryptionEnabled', localSettings.dataEncryptionEnabled)"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div class="flex items-start space-x-3">
            <i class="fas fa-info-circle text-blue-500 mt-0.5"></i>
            <div>
              <h4 class="text-sm font-medium text-blue-900 dark:text-blue-100">Data Privacy</h4>
              <p class="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Your data is stored locally on your device. We never transmit your personal information or task data to external servers without your explicit consent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Account Management -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Account Management</h3>

      <div class="space-y-4">
        <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">Telegram Account</h4>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Connected as {{ userDisplayName }}
              </p>
            </div>
            <div class="text-green-500">
              <i class="fas fa-check-circle"></i>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3">
          <button
            @click="disconnectAccount"
            class="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
          >
            <i class="fas fa-sign-out-alt"></i>
            <span>Disconnect Account</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Data Rights -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Your Data Rights</h3>

      <div class="space-y-3">
        <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Data Export</h4>
          <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">
            You can export all your data at any time. This includes tasks, projects, and settings.
          </p>
          <button
            @click="requestDataExport"
            class="px-3 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          >
            Request Export
          </button>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Data Deletion</h4>
          <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">
            You can permanently delete all your data from our systems.
          </p>
          <button
            @click="requestDataDeletion"
            class="px-3 py-1.5 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
          >
            Request Deletion
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { UserSettings } from '~/types/todo'

interface Props {
  settings: UserSettings | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  update: [updates: Partial<UserSettings>]
  disconnect: [value?: any]
  'export-request': [value?: any]
  'deletion-request': [value?: any]
}>()

const localSettings = ref<UserSettings | null>(null)

const userDisplayName = computed(() => {
  const { $telegram } = useNuxtApp()
  const user = $telegram?.user
  if (user) {
    return `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`
  }
  return 'Unknown User'
})

watch(() => props.settings, (newSettings) => {
  if (newSettings) {
    localSettings.value = { ...newSettings }
  }
}, { immediate: true })

const updateSetting = (key: keyof UserSettings, value: any) => {
  emit('update', { [key]: value })
}

const disconnectAccount = () => {
  // This would typically show a confirmation dialog
  emit('disconnect', undefined)
}

const requestDataExport = () => {
  emit('export-request', undefined)
}

const requestDataDeletion = () => {
  emit('deletion-request', undefined)
}
</script>