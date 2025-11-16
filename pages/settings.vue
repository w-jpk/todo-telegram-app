<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <div class="fixed top-0 w-full bg-white shadow-sm z-50">
      <div class="flex items-center justify-between px-4 py-3">
        <h1 class="text-xl font-bold text-gray-900">Settings</h1>
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <i class="fas fa-user text-white text-sm"></i>
          </div>
          <button class="p-1 cursor-pointer">
            <i class="fas fa-ellipsis-v text-gray-600"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="pt-16 pb-20 px-4">
      <!-- User Profile Card -->
      <div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
            <i class="fas fa-user text-white text-xl"></i>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">{{ userName || 'User' }}</h3>
            <p class="text-sm text-gray-600">{{ userEmail || 'Telegram User' }}</p>
            <p class="text-xs text-blue-500 mt-1">Premium Member</p>
          </div>
          <button class="cursor-pointer">
            <i class="fas fa-chevron-right text-gray-400"></i>
          </button>
        </div>
      </div>

      <!-- Notification Preferences -->
      <div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <i class="fas fa-bell text-blue-500"></i>
          </div>
          <h3 class="font-medium text-gray-900">Notification Preferences</h3>
        </div>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900">Push Notifications</p>
              <p class="text-xs text-gray-600">Receive task reminders and updates</p>
            </div>
            <div class="relative flex-shrink-0">
              <input type="checkbox" v-model="pushNotifications" class="sr-only" />
              <div :class="{ 'bg-blue-500': pushNotifications, 'bg-gray-300': !pushNotifications }"
                class="w-12 h-6 rounded-full cursor-pointer transition-colors flex items-center"
                @click="pushNotifications = !pushNotifications">
                <div :class="{ 'translate-x-7': pushNotifications, 'translate-x-1': !pushNotifications }"
                  class="w-4 h-4 bg-white rounded-full transition-transform"></div>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900">Email Alerts</p>
              <p class="text-xs text-gray-600">Daily summary and important updates</p>
            </div>
            <div class="relative flex-shrink-0">
              <input type="checkbox" v-model="emailAlerts" class="sr-only" />
              <div :class="{ 'bg-blue-500': emailAlerts, 'bg-gray-300': !emailAlerts }"
                class="w-12 h-6 rounded-full cursor-pointer transition-colors flex items-center"
                @click="emailAlerts = !emailAlerts">
                <div :class="{ 'translate-x-7': emailAlerts, 'translate-x-1': !emailAlerts }"
                  class="w-4 h-4 bg-white rounded-full transition-transform"></div>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900">Task Reminders</p>
              <p class="text-xs text-gray-600">Get notified before due dates</p>
            </div>
            <div class="relative flex-shrink-0">
              <input type="checkbox" v-model="taskReminders" class="sr-only" />
              <div :class="{ 'bg-blue-500': taskReminders, 'bg-gray-300': !taskReminders }"
                class="w-12 h-6 rounded-full cursor-pointer transition-colors flex items-center"
                @click="taskReminders = !taskReminders">
                <div :class="{ 'translate-x-7': taskReminders, 'translate-x-1': !taskReminders }"
                  class="w-4 h-4 bg-white rounded-full transition-transform"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Theme Customization -->
      <div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <i class="fas fa-palette text-purple-500"></i>
          </div>
          <h3 class="font-medium text-gray-900">Theme Customization</h3>
        </div>
        <div class="space-y-3">
          <div v-for="theme in themes" :key="theme.value"
            :class="{ 'border-blue-500 bg-blue-50': selectedTheme === theme.value, 'border-gray-200': selectedTheme !== theme.value }"
            class="flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer"
            @click="selectedTheme = theme.value">
            <div class="flex items-center space-x-3">
              <i :class="theme.icon" class="text-lg"></i>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ theme.name }}</p>
                <p class="text-xs text-gray-600">{{ theme.description }}</p>
              </div>
            </div>
            <div
              :class="{ 'text-blue-500': selectedTheme === theme.value, 'text-gray-300': selectedTheme !== theme.value }">
              <i class="fas fa-check-circle"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <i class="fas fa-database text-green-500"></i>
          </div>
          <h3 class="font-medium text-gray-900">Data Management</h3>
        </div>
        <div class="space-y-3">
          <button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div class="flex items-center space-x-3">
              <i class="fas fa-download text-blue-500"></i>
              <div class="text-left">
                <p class="text-sm font-medium text-gray-900">Export Data</p>
                <p class="text-xs text-gray-600">Download your tasks and settings</p>
              </div>
            </div>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </button>
          <button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div class="flex items-center space-x-3">
              <i class="fas fa-upload text-green-500"></i>
              <div class="text-left">
                <p class="text-sm font-medium text-gray-900">Import Data</p>
                <p class="text-xs text-gray-600">Restore from backup file</p>
              </div>
            </div>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </button>
          <button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div class="flex items-center space-x-3">
              <i class="fas fa-sync text-purple-500"></i>
              <div class="text-left">
                <p class="text-sm font-medium text-gray-900">Sync Settings</p>
                <p class="text-xs text-gray-600">Manage cloud synchronization</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-green-600">Active</span>
              <i class="fas fa-chevron-right text-gray-400"></i>
            </div>
          </button>
        </div>
      </div>

      <!-- Support and Information -->
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <h3 class="font-medium text-gray-900 mb-4">Support & Information</h3>
        <div class="space-y-3">
          <button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div class="flex items-center space-x-3">
              <i class="fas fa-question-circle text-blue-500"></i>
              <span class="text-sm font-medium text-gray-900">Help & FAQ</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </button>
          <button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div class="flex items-center space-x-3">
              <i class="fas fa-headset text-green-500"></i>
              <span class="text-sm font-medium text-gray-900">Contact Support</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </button>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
              <i class="fas fa-info-circle text-gray-500"></i>
              <span class="text-sm font-medium text-gray-900">App Version</span>
            </div>
            <span class="text-sm text-gray-600">2.1.4</span>
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

interface Theme {
  value: string
  name: string
  description: string
  icon: string
}

const { $telegram } = useNuxtApp()
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
})

const pushNotifications = ref(true)
const emailAlerts = ref(false)
const taskReminders = ref(true)
const selectedTheme = ref('light')
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
</script>
