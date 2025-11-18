<template>
  <div v-if="localSettings" class="space-y-6">
    <!-- Language Selection -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Language</h3>

      <div class="space-y-3">
        <div
          v-for="lang in availableLanguages"
          :key="lang.code"
          @click="updateSetting('language', lang.code)"
          :class="[
            'p-4 rounded-xl border-2 cursor-pointer transition-all',
            localSettings.language === lang.code
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
          ]"
        >
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white">{{ lang.name }}</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ lang.nativeName }}</p>
            </div>
            <div v-if="localSettings.language === lang.code" class="text-blue-500">
              <i class="fas fa-check"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Date & Time Format -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Date & Time Format</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Format</label>
          <select
            v-model="localSettings.dateFormat"
            @change="updateSetting('dateFormat', localSettings.dateFormat)"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2023)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2023)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (2023-12-31)</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Format</label>
          <select
            v-model="localSettings.timeFormat"
            @change="updateSetting('timeFormat', localSettings.timeFormat)"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="12h">12-hour (3:45 PM)</option>
            <option value="24h">24-hour (15:45)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Timezone -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Timezone</h3>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Timezone</label>
        <select
          v-model="localSettings.timezone"
          @change="updateSetting('timezone', localSettings.timezone)"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Europe/Moscow">Europe/Moscow (MSK)</option>
          <option value="Europe/London">Europe/London (GMT/BST)</option>
          <option value="America/New_York">America/New_York (EST/EDT)</option>
          <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
          <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
          <option value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</option>
        </select>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Current time: {{ currentTime }}
        </p>
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
}>()

const localSettings = ref<UserSettings | null>(null)

const availableLanguages = ref([
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' }
])

const currentTime = computed(() => {
  return new Date().toLocaleString(localSettings.value?.language || 'en', {
    timeZone: localSettings.value?.timezone || 'Europe/Moscow',
    dateStyle: 'full',
    timeStyle: 'medium'
  })
})

watch(() => props.settings, (newSettings) => {
  if (newSettings) {
    localSettings.value = { ...newSettings }
  }
}, { immediate: true })

const updateSetting = (key: keyof UserSettings, value: any) => {
  emit('update', { [key]: value })
}
</script>