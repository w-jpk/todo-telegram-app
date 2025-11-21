<template>
  <div v-if="localSettings" class="space-y-6">
    <!-- Task Defaults -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('settings.behavior.taskDefaults') }}</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('settings.behavior.defaultPriority') }}</label>
          <select
            v-model="localSettings.defaultPriority"
            @change="updateSetting('defaultPriority', localSettings.defaultPriority)"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="none">{{ $t('settings.behavior.noPriority') }}</option>
            <option value="low">{{ $t('stats.low') }}</option>
            <option value="medium">{{ $t('stats.medium') }}</option>
            <option value="high">{{ $t('stats.high') }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('settings.behavior.defaultSortBy') }}</label>
          <select
            v-model="localSettings.defaultSortBy"
            @change="updateSetting('defaultSortBy', localSettings.defaultSortBy)"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="dueDate">{{ $t('settings.behavior.dueDate') }}</option>
            <option value="priority">{{ $t('settings.behavior.priority') }}</option>
            <option value="createdAt">{{ $t('settings.behavior.createdAt') }}</option>
            <option value="text">{{ $t('settings.behavior.alphabetical') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Auto-Archive Settings -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('settings.behavior.autoArchive') }}</h3>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('settings.behavior.autoArchiveCompleted') }}</label>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('settings.behavior.autoArchiveCompletedDesc') }}</p>
          </div>
          <input
            type="checkbox"
            v-model="localSettings.autoArchiveCompleted"
            @change="updateSetting('autoArchiveCompleted', localSettings.autoArchiveCompleted)"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div v-if="localSettings.autoArchiveCompleted">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('settings.behavior.archiveAfterDays') }}</label>
          <input
            type="number"
            v-model.number="localSettings.archiveAfterDays"
            @input="updateSetting('archiveAfterDays', localSettings.archiveAfterDays)"
            min="1"
            max="365"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <!-- UI Behavior -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('settings.behavior.uiBehavior') }}</h3>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('settings.behavior.showCompletedTasks') }}</label>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('settings.behavior.showCompletedTasksDesc') }}</p>
          </div>
          <input
            type="checkbox"
            v-model="localSettings.showCompletedTasks"
            @change="updateSetting('showCompletedTasks', localSettings.showCompletedTasks)"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('settings.behavior.confirmDeleteTask') }}</label>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('settings.behavior.confirmDeleteTaskDesc') }}</p>
          </div>
          <input
            type="checkbox"
            v-model="localSettings.confirmDeleteTask"
            @change="updateSetting('confirmDeleteTask', localSettings.confirmDeleteTask)"
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
