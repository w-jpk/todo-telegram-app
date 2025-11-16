<template>
  <div v-if="localSettings" class="space-y-6">
    <!-- Task Defaults -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Task Defaults</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Priority</label>
          <select
            v-model="localSettings.defaultPriority"
            @change="updateSetting('defaultPriority', localSettings.defaultPriority)"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="none">No Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Sort By</label>
          <select
            v-model="localSettings.defaultSortBy"
            @change="updateSetting('defaultSortBy', localSettings.defaultSortBy)"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="createdAt">Created Date</option>
            <option value="text">Alphabetical</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Auto-Archive Settings -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Auto-Archive</h3>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-Archive Completed Tasks</label>
            <p class="text-xs text-gray-500 dark:text-gray-400">Automatically archive completed tasks after a period</p>
          </div>
          <input
            type="checkbox"
            v-model="localSettings.autoArchiveCompleted"
            @change="updateSetting('autoArchiveCompleted', localSettings.autoArchiveCompleted)"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div v-if="localSettings.autoArchiveCompleted">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Archive After (Days)</label>
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
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">UI Behavior</h3>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Show Completed Tasks</label>
            <p class="text-xs text-gray-500 dark:text-gray-400">Display completed tasks in the main list</p>
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
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Task Deletion</label>
            <p class="text-xs text-gray-500 dark:text-gray-400">Show confirmation dialog before deleting tasks</p>
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