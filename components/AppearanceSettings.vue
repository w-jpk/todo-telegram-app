<template>
  <div v-if="localSettings" class="space-y-6">
    <!-- Theme Selection -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('settings.appearance.theme') }}</h3>

      <div class="grid grid-cols-1 gap-3">
        <div
          v-for="theme in themes"
          :key="theme.value"
          @click="updateSetting('theme', theme.value)"
          :class="[
            'p-4 rounded-xl border-2 cursor-pointer transition-all',
            localSettings.theme === theme.value
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
          ]"
        >
          <div class="flex items-center space-x-3">
            <i :class="theme.icon" class="text-xl"></i>
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white">{{ theme.name }}</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ theme.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Display Options -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('settings.appearance.displayOptions') }}</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('settings.appearance.fontSize') }}</label>
          <select
            v-model="localSettings.fontSize"
            @change="updateSetting('fontSize', localSettings.fontSize)"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="small">{{ $t('settings.appearance.small') }}</option>
            <option value="medium">{{ $t('settings.appearance.medium') }}</option>
            <option value="large">{{ $t('settings.appearance.large') }}</option>
          </select>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('settings.appearance.animations') }}</label>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('settings.appearance.animationsDesc') }}</p>
          </div>
          <input
            type="checkbox"
            v-model="localSettings.animationsEnabled"
            @change="updateSetting('animationsEnabled', localSettings.animationsEnabled)"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('settings.appearance.compactView') }}</label>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('settings.appearance.compactViewDesc') }}</p>
          </div>
          <input
            type="checkbox"
            v-model="localSettings.compactView"
            @change="updateSetting('compactView', localSettings.compactView)"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>
    </div>

    <!-- Accent Color -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('settings.appearance.accentColor') }}</h3>

      <div class="grid grid-cols-6 gap-3">
        <div
          v-for="color in accentColors"
          :key="color.value"
          @click="updateSetting('accentColor', color.value)"
          :class="[
            'w-10 h-10 rounded-full cursor-pointer border-2 transition-all',
            localSettings.accentColor === color.value
              ? 'border-gray-400 scale-110'
              : 'border-gray-200 dark:border-gray-600 hover:scale-105'
          ]"
          :style="{ backgroundColor: color.value }"
        ></div>
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

const themes = computed(() => [
  {
    value: 'light',
    name: t('settings.appearance.lightMode'),
    description: t('settings.appearance.lightModeDesc'),
    icon: 'fas fa-sun text-yellow-500'
  },
  {
    value: 'dark',
    name: t('settings.appearance.darkMode'),
    description: t('settings.appearance.darkModeDesc'),
    icon: 'fas fa-moon text-blue-500'
  },
  {
    value: 'auto',
    name: t('settings.appearance.autoMode'),
    description: t('settings.appearance.autoModeDesc'),
    icon: 'fas fa-adjust text-gray-500'
  }
])

const accentColors = ref([
  { value: '#3B82F6' }, // Blue
  { value: '#EF4444' }, // Red
  { value: '#10B981' }, // Green
  { value: '#F59E0B' }, // Yellow
  { value: '#8B5CF6' }, // Purple
  { value: '#EC4899' }, // Pink
  { value: '#6B7280' }, // Gray
  { value: '#F97316' }, // Orange
  { value: '#06B6D4' }, // Cyan
  { value: '#84CC16' }, // Lime
  { value: '#6366F1' }, // Indigo
  { value: '#14B8A6' }  // Teal
])

watch(() => props.settings, (newSettings) => {
  if (newSettings) {
    localSettings.value = { ...newSettings }
  }
}, { immediate: true })

const updateSetting = (key: keyof UserSettings, value: any) => {
  emit('update', { [key]: value })
}
</script>