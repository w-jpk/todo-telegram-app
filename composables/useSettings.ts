import type { UserSettings, UpdateUserSettingsDto } from '~/types/todo'

export const useSettings = () => {
  const settings = useState<UserSettings | null>('settings', () => null)
  const loading = useState<boolean>('settings:loading', () => false)
  const error = useState<string | null>('settings:error', () => null)

  const { $telegram } = useNuxtApp()
  const userId = computed(() => $telegram?.user?.id || null)

  // Get headers for API requests
  const getHeaders = () => {
    // In dev mode, use default test user ID if not available
    const effectiveUserId = userId.value || (process.dev ? 123456789 : null)
    
    if (!effectiveUserId) {
      throw new Error('User ID is not available. Please wait for Telegram initialization.')
    }

    const headers: Record<string, string> = {
      'x-telegram-user-id': effectiveUserId.toString()
    }

    // Encode JSON if there is data
    if ($telegram?.user) {
      headers['x-telegram-user-data'] = encodeURIComponent(JSON.stringify($telegram.user))
    }

    return headers
  }

  // Fetch settings
  const fetchSettings = async () => {
    // In dev mode, allow requests even if userId is not set (server will use default)
    if (!userId.value && !process.dev) return

    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<{ data: UserSettings }>('/api/settings', {
        method: 'GET',
        headers: getHeaders()
      })
      settings.value = data
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || 'Failed to fetch settings'
      error.value = errorMessage
      console.error('Error fetching settings:', err)
    } finally {
      loading.value = false
    }
  }

  // Update settings
  const updateSettings = async (settingsData: UpdateUserSettingsDto) => {
    // In dev mode, allow requests even if userId is not set (server will use default)
    if (!userId.value && !process.dev) return null

    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<{ data: UserSettings }>('/api/settings', {
        method: 'PUT',
        headers: getHeaders(),
        body: settingsData
      })

      settings.value = data
      return data
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || 'Failed to update settings'
      error.value = errorMessage
      console.error('Error updating settings:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    settings: readonly(settings),
    loading: readonly(loading),
    error: readonly(error),
    fetchSettings,
    updateSettings
  }
}