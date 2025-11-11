import type { UserSettings, UpdateUserSettingsDto } from '~/types/todo'

export const useNotifications = () => {
  const settings = ref<UserSettings | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { $telegram } = useNuxtApp()
  const userId = computed(() => $telegram?.user?.id || null)

  // Get headers for API requests
  const getHeaders = () => {
    const headers: Record<string, string> = {
      'x-telegram-user-id': userId.value?.toString() || ''
    }

    if ($telegram?.user) {
      headers['x-telegram-user-data'] = encodeURIComponent(JSON.stringify($telegram.user))
    }

    return headers
  }

  // Fetch settings
  const fetchSettings = async () => {
    if (!userId.value) return
    
    loading.value = true
    error.value = null
    
    try {
      const { data } = await $fetch<{ data: UserSettings }>('/api/settings', {
        method: 'GET',
        headers: getHeaders()
      })
      settings.value = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch settings'
      console.error('Error fetching settings:', err)
    } finally {
      loading.value = false
    }
  }

  // Update settings
  const updateSettings = async (settingsData: UpdateUserSettingsDto) => {
    if (!userId.value) return null
    
    loading.value = true
    error.value = null
    
    try {
      const { data } = await $fetch<{ data: UserSettings }>('/api/settings', {
        method: 'PUT',
        headers: getHeaders(),
        body: settingsData
      })
      
      const updatedSettings = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      }
      
      settings.value = updatedSettings
      return updatedSettings
    } catch (err: any) {
      error.value = err.message || 'Failed to update settings'
      console.error('Error updating settings:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Send test notification
  const sendTestNotification = async () => {
    if (!userId.value) return false
    
    try {
      await $fetch('/api/notifications/send', {
        method: 'POST',
        headers: getHeaders(),
        body: {
          userId: userId.value,
          message: '🔔 <b>Тестовое уведомление</b>\n\nЭто тестовое сообщение для проверки работы уведомлений.'
        }
      })
      return true
    } catch (err: any) {
      console.error('Error sending test notification:', err)
      return false
    }
  }

  return {
    settings: readonly(settings),
    loading: readonly(loading),
    error: readonly(error),
    fetchSettings,
    updateSettings,
    sendTestNotification
  }
}

