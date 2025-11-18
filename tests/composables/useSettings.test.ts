import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSettings } from '~/composables/useSettings'
import { createMockSettings, createMockUpdateSettingsDto } from '../utils/test-helpers'

const mockFetch = vi.fn() as any
mockFetch.raw = vi.fn()
mockFetch.create = vi.fn(() => mockFetch)
global.$fetch = mockFetch

describe('useSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({ data: createMockSettings() })
  })

  it('should return expected properties', () => {
    const result = useSettings()

    expect(result).toHaveProperty('settings')
    expect(result).toHaveProperty('loading')
    expect(result).toHaveProperty('error')
    expect(result).toHaveProperty('fetchSettings')
    expect(result).toHaveProperty('updateSettings')
  })

  it('should initialize with correct default values', () => {
    const { settings, loading, error } = useSettings()

    expect(settings.value).toBe(null)
    expect(loading.value).toBe(false)
    expect(error.value).toBe(null)
  })

  it('should fetch settings successfully', async () => {
    const mockSettings = createMockSettings({ language: 'ru' })
    mockFetch.mockResolvedValue({ data: mockSettings })

    const { fetchSettings, settings, loading } = useSettings()

    await fetchSettings()

    expect(mockFetch).toHaveBeenCalledWith('/api/settings', {
      method: 'GET',
      headers: expect.objectContaining({
        'x-telegram-user-id': expect.any(String)
      })
    })
    expect(settings.value).toEqual(mockSettings)
    expect(loading.value).toBe(false)
  })

  it('should handle fetch settings error', async () => {
    const errorMessage = 'Failed to fetch settings'
    mockFetch.mockRejectedValue(new Error(errorMessage))

    const { fetchSettings, error, loading } = useSettings()

    await fetchSettings()

    expect(error.value).toBe(errorMessage)
    expect(loading.value).toBe(false)
  })

  it('should update settings successfully', async () => {
    const updatedSettings = createMockSettings({ theme: 'dark' })
    mockFetch.mockResolvedValue({ data: updatedSettings })

    const { updateSettings, settings } = useSettings()
    const updateData = createMockUpdateSettingsDto({ theme: 'dark' })

    const result = await updateSettings(updateData)

    expect(result).toEqual(updatedSettings)
    expect(mockFetch).toHaveBeenCalledWith('/api/settings', {
      method: 'PUT',
      headers: expect.any(Object),
      body: updateData
    })
    expect(settings.value).toEqual(updatedSettings)
  })

  it('should handle update settings error', async () => {
    const errorMessage = 'Failed to update settings'
    mockFetch.mockRejectedValue(new Error(errorMessage))

    const { updateSettings, error } = useSettings()
    const updateData = createMockUpdateSettingsDto()

    const result = await updateSettings(updateData)

    expect(result).toBe(null)
    expect(error.value).toBe(errorMessage)
  })

  it('should not fetch settings if userId is missing', async () => {
    const { fetchSettings } = useSettings()

    // Mock useNuxtApp to return null user
    vi.mocked(useNuxtApp).mockReturnValueOnce({
      $telegram: { user: null }
    } as any)

    await fetchSettings()

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should not update settings if userId is missing', async () => {
    const { updateSettings } = useSettings()

    // Mock useNuxtApp to return null user
    vi.mocked(useNuxtApp).mockReturnValueOnce({
      $telegram: { user: null }
    } as any)

    const result = await updateSettings(createMockUpdateSettingsDto())

    expect(result).toBe(null)
    expect(mockFetch).not.toHaveBeenCalled()
  })
})