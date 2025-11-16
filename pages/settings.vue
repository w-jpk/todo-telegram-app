<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <!-- Header -->
    <AppHeader title="Settings" />

    <!-- Content Area -->
    <div class="pt-16 pb-20 px-4">
      <!-- User Profile Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm" @click="openUserProfile">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
            <img v-if="userPhoto" :src="userPhoto" class="w-full h-full object-cover" alt="User photo" />
            <i v-else class="fas fa-user text-white text-xl"></i>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ userName || 'User' }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ userEmail || 'Telegram User' }}</p>
            <p class="text-xs text-blue-500 mt-1">Premium Member</p>
          </div>
          <button @click="openUserProfile" class="cursor-pointer">
            <i class="fas fa-chevron-right text-gray-400 dark:text-gray-500"></i>
          </button>
        </div>
      </div>

      <!-- Notification Preferences -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <i class="fas fa-bell text-blue-500"></i>
          </div>
          <h3 class="font-medium text-gray-900 dark:text-white">Notification Preferences</h3>
        </div>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</p>
              <p class="text-xs text-gray-600 dark:text-gray-400">Receive task reminders and updates</p>
            </div>
            <div class="relative flex-shrink-0">
              <input type="checkbox" v-model="pushNotifications" class="sr-only" />
              <div :class="{ 'bg-blue-500 dark:bg-blue-600': pushNotifications, 'bg-gray-300 dark:bg-gray-600': !pushNotifications }"
                class="w-12 h-6 rounded-full cursor-pointer transition-colors flex items-center"
                @click="pushNotifications = !pushNotifications">
                <div :class="{ 'translate-x-7': pushNotifications, 'translate-x-1': !pushNotifications }"
                  class="w-4 h-4 bg-white dark:bg-gray-200 rounded-full transition-transform"></div>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Email Alerts</p>
              <p class="text-xs text-gray-600 dark:text-gray-400">Daily summary and important updates</p>
            </div>
            <div class="relative flex-shrink-0">
              <input type="checkbox" v-model="emailAlerts" class="sr-only" />
              <div :class="{ 'bg-blue-500 dark:bg-blue-600': emailAlerts, 'bg-gray-300 dark:bg-gray-600': !emailAlerts }"
                class="w-12 h-6 rounded-full cursor-pointer transition-colors flex items-center"
                @click="emailAlerts = !emailAlerts">
                <div :class="{ 'translate-x-7': emailAlerts, 'translate-x-1': !emailAlerts }"
                  class="w-4 h-4 bg-white dark:bg-gray-200 rounded-full transition-transform"></div>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Task Reminders</p>
              <p class="text-xs text-gray-600 dark:text-gray-400">Get notified before due dates</p>
            </div>
            <div class="relative flex-shrink-0">
              <input type="checkbox" v-model="taskReminders" class="sr-only" />
              <div :class="{ 'bg-blue-500 dark:bg-blue-600': taskReminders, 'bg-gray-300 dark:bg-gray-600': !taskReminders }"
                class="w-12 h-6 rounded-full cursor-pointer transition-colors flex items-center"
                @click="taskReminders = !taskReminders">
                <div :class="{ 'translate-x-7': taskReminders, 'translate-x-1': !taskReminders }"
                  class="w-4 h-4 bg-white dark:bg-gray-200 rounded-full transition-transform"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Theme Customization -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
            <i class="fas fa-palette text-purple-500"></i>
          </div>
          <h3 class="font-medium text-gray-900 dark:text-white">Theme Customization</h3>
        </div>
        <div class="space-y-3">
          <div v-for="theme in themes" :key="theme.value"
            :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900': selectedTheme === theme.value, 'border-gray-200 dark:border-gray-600': selectedTheme !== theme.value }"
            class="flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer"
            @click="setTheme(theme.value)">
            <div class="flex items-center space-x-3">
              <i :class="theme.icon" class="text-lg"></i>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ theme.name }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">{{ theme.description }}</p>
              </div>
            </div>
            <div
              :class="{ 'text-blue-500': selectedTheme === theme.value, 'text-gray-300 dark:text-gray-500': selectedTheme !== theme.value }">
              <i class="fas fa-check-circle"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Language Selection -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
            <i class="fas fa-language text-indigo-500"></i>
          </div>
          <h3 class="font-medium text-gray-900 dark:text-white">{{ $t('settings.language') }}</h3>
        </div>
        <div class="space-y-3">
          <div
            v-for="locale in availableLocales"
            :key="locale.code"
            :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900': currentLocale === locale.code, 'border-gray-200 dark:border-gray-600': currentLocale !== locale.code }"
            class="flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer"
            @click="setLocale(locale.code)">
            <div class="flex items-center space-x-3">
              <i :class="locale.code === 'ru' ? 'fas fa-flag' : 'fas fa-flag-usa'" class="text-lg"></i>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ locale.name }}</p>
              </div>
            </div>
            <i
              :class="{ 'text-blue-500': currentLocale === locale.code, 'text-gray-300 dark:text-gray-500': currentLocale !== locale.code }"
              class="fas fa-check text-lg"></i>
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <i class="fas fa-database text-green-500"></i>
          </div>
          <h3 class="font-medium text-gray-900 dark:text-white">Data Management</h3>
        </div>
        <div class="space-y-3">
          <button @click="exportData"
            class="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <div class="flex items-center space-x-3">
              <i class="fas fa-download text-blue-500"></i>
              <div class="text-left">
                <p class="text-sm font-medium text-gray-900 dark:text-white">Export Data</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">Download your tasks and settings</p>
              </div>
            </div>
            <i class="fas fa-chevron-right text-gray-400 dark:text-gray-500"></i>
          </button>
          <div class="relative">
            <input type="file" accept=".json" @change="importData"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <button class="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
              <div class="flex items-center space-x-3">
                <i class="fas fa-upload text-green-500"></i>
                <div class="text-left">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">Import Data</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">Restore from backup file</p>
                </div>
              </div>
              <i class="fas fa-chevron-right text-gray-400 dark:text-gray-500"></i>
            </button>
          </div>
          <button @click="toggleSync"
            class="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <div class="flex items-center space-x-3">
              <i class="fas fa-sync text-purple-500"></i>
              <div class="text-left">
                <p class="text-sm font-medium text-gray-900 dark:text-white">Sync Settings</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">Manage cloud synchronization</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span :class="settings?.notificationsEnabled ? 'text-green-600' : 'text-red-600'" class="text-xs">{{
                settings?.notificationsEnabled ? 'Active' : 'Inactive' }}</span>
              <i class="fas fa-chevron-right text-gray-400 dark:text-gray-500"></i>
            </div>
          </button>
        </div>
      </div>

      <!-- Support and Information -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 class="font-medium text-gray-900 dark:text-white mb-4">Support & Information</h3>
        <div class="space-y-3">
          <button @click="openHelp"
            class="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <div class="flex items-center space-x-3">
              <i class="fas fa-question-circle text-blue-500"></i>
              <span class="text-sm font-medium text-gray-900 dark:text-white">Help & FAQ</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400 dark:text-gray-500"></i>
          </button>
          <button @click="contactSupport"
            class="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <div class="flex items-center space-x-3">
              <i class="fas fa-headset text-green-500"></i>
              <span class="text-sm font-medium text-gray-900 dark:text-white">Contact Support</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400 dark:text-gray-500"></i>
          </button>
          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center space-x-3">
              <i class="fas fa-info-circle text-gray-500"></i>
              <span class="text-sm font-medium text-gray-900 dark:text-white">App Version</span>
            </div>
            <span class="text-sm text-gray-600 dark:text-gray-400">2.1.4</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ThemeMode } from '~/composables/useTheme'
import AppHeader from '~/components/AppHeader.vue'

const { locale, locales, setLocale: i18nSetLocale } = useI18n()
const availableLocales = computed(() => locales.value)
const currentLocale = computed(() => locale.value)

const setLocale = async (newLocale: 'ru' | 'en') => {
  await i18nSetLocale(newLocale)
  if (settings.value) {
    await updateSettings({ language: newLocale })
  }
}

interface Theme {
  value: ThemeMode
  name: string
  description: string
  icon: string
}

const { $telegram } = useNuxtApp()
const { settings, fetchSettings, updateSettings } = useSettings()
const { todos, fetchTodos, createTodo } = useTodos()
const { projects, fetchProjects, createProject } = useProjects()

const userName = computed(() => {
  const user = $telegram?.user
  if (user) {
    return `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`
  }
  return null
})
const userEmail = computed(() => {
  // Telegram doesn't provide email, but we can show username
  return $telegram?.user?.username ? `@${$telegram.user.username}` : null
})

const userPhoto = computed(() => {
  return $telegram?.user?.photo_url
})

const openUserProfile = () => {
  if ($telegram?.user?.username) {
    window.open(`https://t.me/${$telegram.user.username}`, '_blank')
  }
}

const exportData = async () => {
  await Promise.all([fetchTodos(), fetchProjects(), fetchSettings()])
  const data = {
    todos: todos.value,
    projects: projects.value,
    settings: settings.value,
    exportDate: new Date().toISOString()
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'todo-backup.json'
  a.click()
  URL.revokeObjectURL(url)
}

const importData = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const text = await file.text()
  const data = JSON.parse(text)
  // Import projects first
  for (const project of data.projects || []) {
    try {
      await createProject({ name: project.name, color: project.color })
    } catch (e) {
      // Skip if exists
    }
  }
  // Then todos
  for (const todo of data.todos || []) {
    try {
      await createTodo({
        text: todo.text,
        description: todo.description,
        priority: todo.priority,
        projectId: todo.projectId,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
      })
    } catch (e) {
      console.error('Failed to import todo:', e)
    }
  }
  // Settings
  if (data.settings) {
    await updateSettings(data.settings)
  }
}

const toggleSync = async () => {
  if (settings.value) {
    await updateSettings({ notificationsEnabled: !settings.value.notificationsEnabled })
  }
}

onMounted(async () => {
  const { $telegram } = useNuxtApp()

  const waitForTelegram = (): Promise<void> => {
    return new Promise((resolve) => {
      if ($telegram?.isReady && $telegram?.user) {
        resolve()
        return
      }

      const checkInterval = setInterval(() => {
        if ((window as any).Telegram?.WebApp) {
          const tg = (window as any).Telegram.WebApp
          if (tg.initDataUnsafe?.user) {
            if ($telegram) {
              $telegram.user = tg.initDataUnsafe.user
              $telegram.initData = tg.initData || ''
              $telegram.initDataUnsafe = tg.initDataUnsafe || {}
              $telegram.isReady = true
            }
            clearInterval(checkInterval)
            resolve()
          } else if ($telegram?.user) {
            clearInterval(checkInterval)
            resolve()
          }
        } else if ($telegram?.user) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)

      setTimeout(() => {
        clearInterval(checkInterval)
        resolve()
      }, 3000)
    })
  }

  await waitForTelegram()

  await fetchSettings()

  // Set initial locale from settings
  if (settings.value?.language) {
    await i18nSetLocale(settings.value.language as 'ru' | 'en')
  }
})

const pushNotifications = computed({
  get: () => settings.value?.notificationsEnabled ?? true,
  set: async (value: boolean) => {
    await updateSettings({ notificationsEnabled: value })
  }
})

const emailAlerts = computed({
  get: () => settings.value?.dailyNotifications ?? false,
  set: async (value: boolean) => {
    await updateSettings({ dailyNotifications: value })
  }
})

const taskReminders = computed({
  get: () => settings.value?.notifyOnOverdue ?? true,
  set: async (value: boolean) => {
    await updateSettings({ notifyOnOverdue: value })
  }
})

const { theme, setTheme } = useTheme()
const selectedTheme = computed({
  get: () => theme.value,
  set: (value) => setTheme(value)
})

const themes = ref<Theme[]>([
  {
    value: 'light',
    name: 'Light Mode',
    description: 'Clean and bright interface',
    icon: 'fas fa-sun text-yellow-500'
  },
  {
    value: 'dark',
    name: 'Dark Mode',
    description: 'Easy on the eyes in low light',
    icon: 'fas fa-moon text-blue-500'
  },
  {
    value: 'auto',
    name: 'Auto Mode',
    description: 'Follows system preference',
    icon: 'fas fa-adjust text-gray-500'
  }
])

const openHelp = () => {
  window.open('https://example.com/help', '_blank')
}

const contactSupport = () => {
  window.open('https://t.me/support', '_blank')
}
</script>
