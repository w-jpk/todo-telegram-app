import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useNotifications } from '~/composables/useNotifications'
import { createMockSettings, createMockUpdateSettingsDto } from '../utils/test-helpers'

const mockFetch = vi.fn() as any
mockFetch.raw = vi.fn()
mockFetch.create = vi.fn(() => mockFetch)
global.$fetch = mockFetch

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({ data: createMockSettings() })
  })

  it('should return expected properties', () => {
    const result = useNotifications()

    expect(result).toHaveProperty('settings')
    expect(result).toHaveProperty('loading')
    expect(result).toHaveProperty('error')
    expect(result).toHaveProperty('fetchSettings')
    expect(result).toHaveProperty('updateSettings')
    expect(result).toHaveProperty('sendTestNotification')
  })

  it('should initialize with correct default values', () => {
    const { settings, loading, error } = useNotifications()

    expect(settings.value).toBe(null)
    expect(loading.value).toBe(false)
    expect(error.value).toBe(null)
  })

  it('should fetch settings successfully', async () => {
    const mockSettings = createMockSettings({ notificationsEnabled: true })
    mockFetch.mockResolvedValue({ data: mockSettings })

    const { fetchSettings, settings, loading } = useNotifications()

    await fetchSettings()

    expect(mockFetch).toHaveBeenCalledWith('/api/settings', {
      method: 'GET',
      headers: expect.objectContaining({
        'x-telegram-user-id': expect.any(String)
      })
    })
    expect(settings.value).toEqual(expect.objectContaining(mockSettings))
    expect(loading.value).toBe(false)
  })

  it('should handle fetch settings error', async () => {
    const errorMessage = 'Failed to fetch settings'
    mockFetch.mockRejectedValue(new Error(errorMessage))

    const { fetchSettings, error, loading } = useNotifications()

    await fetchSettings()

    expect(error.value).toBe(errorMessage)
    expect(loading.value).toBe(false)
  })

  it('should update settings successfully', async () => {
    const updatedSettings = createMockSettings({ dailyNotifications: false })
    mockFetch.mockResolvedValue({ data: updatedSettings })

    const { updateSettings, settings } = useNotifications()
    const updateData = createMockUpdateSettingsDto({ dailyNotifications: false })

    const result = await updateSettings(updateData)

    expect(result).toEqual(expect.objectContaining(updatedSettings))
    expect(mockFetch).toHaveBeenCalledWith('/api/settings', {
      method: 'PUT',
      headers: expect.any(Object),
      body: updateData
    })
    expect(settings.value).toEqual(expect.objectContaining(updatedSettings))
  })

  it('should handle update settings error', async () => {
    const errorMessage = 'Failed to update settings'
    mockFetch.mockRejectedValue(new Error(errorMessage))

    const { updateSettings, error } = useNotifications()
    const updateData = createMockUpdateSettingsDto()

    const result = await updateSettings(updateData)

    expect(result).toBe(null)
    expect(error.value).toBe(errorMessage)
  })

  it('should send test notification successfully', async () => {
    mockFetch.mockResolvedValue({})

    const { sendTestNotification } = useNotifications()

    const result = await sendTestNotification()

    expect(result).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith('/api/notifications/send', {
      method: 'POST',
      headers: expect.any(Object),
      body: expect.objectContaining({
        message: expect.stringContaining('Тестовое уведомление')
      })
    })
  })

  it('should handle send test notification error', async () => {
    mockFetch.mockRejectedValue(new Error('Failed to send'))

    const { sendTestNotification } = useNotifications()

    const result = await sendTestNotification()

    expect(result).toBe(false)
  })

  it('should not fetch settings if userId is missing', async () => {
    const { fetchSettings } = useNotifications()

    // Mock useNuxtApp to return null user
    vi.mocked(useNuxtApp).mockReturnValueOnce({
      $telegram: { user: null }
    } as any)

    await fetchSettings()

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should not update settings if userId is missing', async () => {
    const { updateSettings } = useNotifications()

    // Mock useNuxtApp to return null user
    vi.mocked(useNuxtApp).mockReturnValueOnce({
      $telegram: { user: null }
    } as any)

    const result = await updateSettings(createMockUpdateSettingsDto())

    expect(result).toBe(null)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should not send test notification if userId is missing', async () => {
    const { sendTestNotification } = useNotifications()

    // Mock useNuxtApp to return null user
    vi.mocked(useNuxtApp).mockReturnValueOnce({
      $telegram: { user: null }
    } as any)

    const result = await sendTestNotification()

    expect(result).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })
})