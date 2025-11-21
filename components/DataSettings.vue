<template>
  <div v-if="localSettings" class="space-y-6">
    <!-- Data Synchronization -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('settings.data.synchronization') }}</h3>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('settings.data.autoSync') }}</label>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('settings.data.autoSyncDesc') }}</p>
          </div>
          <input
            type="checkbox"
            v-model="localSettings.autoSync"
            @change="updateSetting('autoSync', localSettings.autoSync)"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div v-if="localSettings.autoSync">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('settings.data.syncFrequency') }}</label>
          <select
            v-model="localSettings.syncFrequency"
            @change="updateSetting('syncFrequency', localSettings.syncFrequency)"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="realtime">{{ $t('settings.data.realtime') }}</option>
            <option value="hourly">{{ $t('settings.data.hourly') }}</option>
            <option value="daily">{{ $t('settings.data.daily') }}</option>
            <option value="weekly">{{ $t('settings.data.weekly') }}</option>
            <option value="manual">{{ $t('settings.data.manual') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Backup Settings -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('settings.data.backup') }}</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('settings.data.backupFrequency') }}</label>
          <select
            v-model="localSettings.backupFrequency"
            @change="updateSetting('backupFrequency', localSettings.backupFrequency)"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="daily">{{ $t('settings.data.daily') }}</option>
            <option value="weekly">{{ $t('settings.data.weekly') }}</option>
            <option value="monthly">{{ $t('settings.data.monthly') }}</option>
            <option value="manual">{{ $t('settings.data.manual') }}</option>
          </select>
        </div>

        <div v-if="localSettings.lastBackupDate" class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <i class="fas fa-clock mr-2"></i>
            {{ $t('settings.data.lastBackup') }}: {{ formatDate(localSettings.lastBackupDate) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Data Management -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('settings.data.dataManagement') }}</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('settings.data.dataRetentionDays') }}</label>
          <input
            type="number"
            v-model.number="localSettings.dataRetentionDays"
            @input="updateSetting('dataRetentionDays', localSettings.dataRetentionDays)"
            min="30"
            max="3650"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ $t('settings.data.dataRetentionDesc') }}</p>
        </div>

        <!-- Export Section -->
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('settings.data.exportFormat') }}</label>
            <select
              v-model="exportFormat"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="json">JSON (Complete backup)</option>
              <option value="csv">CSV (Spreadsheet)</option>
              <option value="todoist">Todoist (Compatible format)</option>
            </select>
          </div>

          <button
            @click="exportData"
            class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <i class="fas fa-download"></i>
            <span>{{ $t('settings.data.exportData') }}</span>
          </button>
        </div>

        <!-- Import Section -->
        <div class="space-y-3">
          <button
            @click="importData"
            class="w-full px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
          >
            <i class="fas fa-upload"></i>
            <span>{{ $t('settings.data.importData') }}</span>
          </button>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('settings.data.importDataDesc') }}</p>
        </div>

        <!-- Undo Last Change -->
        <button
          @click="undoLastChange"
          class="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2"
        >
          <i class="fas fa-undo"></i>
          <span>{{ $t('settings.data.undoLastChange') }}</span>
        </button>

        <!-- Clear Data -->
        <button
          @click="clearAllData"
          class="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
        >
          <i class="fas fa-trash"></i>
          <span>{{ $t('settings.data.clearAllData') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { UserSettings } from '~/types/todo'

const { t } = useI18n()

interface Props {
  settings: UserSettings | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  update: [updates: Partial<UserSettings>]
  export: [value?: any]
  import: [value?: any]
  clear: [value?: any]
  undo: [value?: any]
}>()

const localSettings = ref<UserSettings | null>(null)
const exportFormat = ref('json')

watch(() => props.settings, (newSettings) => {
  if (newSettings) {
    localSettings.value = { ...newSettings }
  }
}, { immediate: true })

const updateSetting = (key: keyof UserSettings, value: any) => {
  emit('update', { [key]: value })
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString()
}

const exportData = () => {
  // This will be handled by the parent component
  emit('export', exportFormat.value)
}

const importData = () => {
  // This will be handled by the parent component
  emit('import', undefined)
}

const clearAllData = () => {
  // This will be handled by the parent component
  emit('clear', undefined)
}

const undoLastChange = () => {
  // This will be handled by the parent component
  emit('undo', undefined)
}
</script>