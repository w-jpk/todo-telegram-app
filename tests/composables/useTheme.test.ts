import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useTheme } from '~/composables/useTheme'

// Mock dependencies
vi.mock('~/composables/useSettings', () => ({
  useSettings: () => ({
    settings: { value: { theme: 'light' } },
    updateSettings: vi.fn().mockResolvedValue({})
  })
}))

describe('useTheme', () => {
  let mockLocalStorage: Record<string, string> = {}
  let mockMatchMedia: any

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => mockLocalStorage[key] || null),
        setItem: vi.fn((key, value) => { mockLocalStorage[key] = value }),
        removeItem: vi.fn((key) => delete mockLocalStorage[key]),
        clear: vi.fn(() => { mockLocalStorage = {} })
      },
      writable: true
    })

    // Mock matchMedia
    mockMatchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    })
    Object.defineProperty(window, 'matchMedia', {
      value: mockMatchMedia,
      writable: true
    })

    // Mock Telegram WebApp
    ;(window as any).Telegram = {
      WebApp: {
        colorScheme: 'light',
        themeParams: {},
        setHeaderColor: vi.fn(),
        setBackgroundColor: vi.fn(),
        onEvent: vi.fn()
      }
    }

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return expected properties', () => {
    const result = useTheme()

    expect(result).toHaveProperty('theme')
    expect(result).toHaveProperty('isDark')
    expect(result).toHaveProperty('setTheme')
    expect(result).toHaveProperty('applyTheme')
  })

  it('should initialize with light theme by default', () => {
    const { theme } = useTheme()

    expect(theme.value).toBe('light')
  })

  it('should load theme from localStorage', () => {
    mockLocalStorage.theme = 'dark'

    const { theme } = useTheme()

    expect(theme.value).toBe('dark')
  })

  it('should determine isDark correctly for light theme', () => {
    const { isDark } = useTheme()

    expect(isDark.value).toBe(false)
  })

  it('should determine isDark correctly for dark theme', () => {
    // Mock localStorage to return dark
    mockLocalStorage.theme = 'dark'

    const { isDark } = useTheme()

    expect(isDark.value).toBe(true)
  })

  it('should determine isDark correctly for auto theme', () => {
    // Mock localStorage to return auto
    mockLocalStorage.theme = 'auto'
    // Mock system preference to light
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    })

    const { isDark } = useTheme()

    expect(isDark.value).toBe(false)
  })

  it('should set theme and update settings', async () => {
    const { setTheme, theme } = useTheme()

    await setTheme('dark')

    expect(theme.value).toBe('dark')
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('should apply theme to document', () => {
    const { applyTheme } = useTheme()

    // Mock document
    const mockDocumentElement = {
      classList: { add: vi.fn(), remove: vi.fn() },
      style: { setProperty: vi.fn(), colorScheme: '' }
    }
    Object.defineProperty(document, 'documentElement', {
      value: mockDocumentElement,
      writable: true
    })

    applyTheme('dark')

    expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark')
    expect(mockDocumentElement.style.colorScheme).toBe('dark')
  })
})