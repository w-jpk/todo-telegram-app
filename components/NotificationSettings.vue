<template>
  <div v-if="localSettings" class="space-y-6">
    <!-- Basic Notifications -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('settings.notifications.basicNotifications') }}</h3>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('settings.notifications.pushNotifications') }}</label>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('settings.notifications.pushNotificationsDesc') }}</p>
          </div>
          <input
            type="checkbox"
            v-model="localSettings.notificationsEnabled"
            @change="updateSetting('notificationsEnabled', localSettings.notificationsEnabled)"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('settings.notifications.dailySummary') }}</label>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('settings.notifications.dailySummaryDesc') }}</p>
          </div>
          <input
            type="checkbox"
            v-model="localSettings.dailyNotifications"
            @change="updateSetting('dailyNotifications', localSettings.dailyNotifications)"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('settings.notifications.overdueReminders') }}</label>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('settings.notifications.overdueRemindersDesc') }}</p>
          </div>
          <input
            type="checkbox"
            v-model="localSettings.notifyOnOverdue"
            @change="updateSetting('notifyOnOverdue', localSettings.notifyOnOverdue)"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>
    </div>

    <!-- Advanced Notifications -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('settings.notifications.advancedSettings') }}</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('settings.notifications.dailyNotificationTime') }}</label>
          <input
            type="time"
            v-model="localSettings.dailyNotificationTime"
            @input="updateSetting('dailyNotificationTime', localSettings.dailyNotificationTime)"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('settings.notifications.quietHours') }}</label>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">{{ $t('settings.notifications.quietHoursStart') }}</label>
              <input
                type="time"
                v-model="localSettings.quietHoursStart"
                @input="updateSetting('quietHoursStart', localSettings.quietHoursStart)"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">{{ $t('settings.notifications.quietHoursEnd') }}</label>
              <input
                type="time"
                v-model="localSettings.quietHoursEnd"
                @input="updateSetting('quietHoursEnd', localSettings.quietHoursEnd)"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('settings.notifications.vibration') }}</label>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('settings.notifications.vibrationDesc') }}</p>
          </div>
          <input
            type="checkbox"
            v-model="localSettings.vibrationEnabled"
            @change="updateSetting('vibrationEnabled', localSettings.vibrationEnabled)"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
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
}>()

const localSettings = ref<UserSettings | null>(null)

watch(() => props.settings, (newSettings) => {
  if (newSettings) {
    localSettings.value = { ...newSettings }
  }
}, { immediate: true })

const updateSetting = (key: keyof UserSettings, value: any) => {
  emit('update', { [key]: value })
}
</script>