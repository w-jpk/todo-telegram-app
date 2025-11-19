import { versionAtLeast } from '~/utils/telegram'

export type ThemeMode = 'light' | 'dark' | 'auto'

export const useTheme = () => {
  const { settings, updateSettings } = useSettings()

  const theme = useState<ThemeMode>('theme', () => {
    if (process.client) {
      const saved = localStorage.getItem('theme') as ThemeMode
      if (saved && ['light', 'dark', 'auto'].includes(saved)) {
        return saved
      }
      // Check Telegram theme if available
      if ((window as any).Telegram?.WebApp?.colorScheme) {
        return (window as any).Telegram.WebApp.colorScheme === 'dark' ? 'dark' : 'light'
      }
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'auto'
      }
    }
    return 'light'
  })

  // Sync theme with settings when settings are loaded
  watch(() => settings.value?.theme, (newTheme) => {
    if (newTheme && newTheme !== theme.value) {
      theme.value = newTheme
    }
  })

  const isDark = computed(() => {
    if (!process.client) return false
    if (theme.value === 'dark') return true
    if (theme.value === 'light') return false
    // auto mode
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const applyTheme = (newTheme?: ThemeMode) => {
    if (!process.client) return
    
    const themeToApply = newTheme || theme.value
    
    // Update class on document element
    if (themeToApply === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.style.colorScheme = 'dark'
    } else if (themeToApply === 'light') {
      document.documentElement.classList.remove('dark')
      document.documentElement.style.colorScheme = 'light'
    } else {
      // auto mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        document.documentElement.classList.add('dark')
        document.documentElement.style.colorScheme = 'dark'
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.style.colorScheme = 'light'
      }
    }

    // Apply Telegram theme colors if available
    if ((window as any).Telegram?.WebApp?.themeParams) {
      const tg = (window as any).Telegram.WebApp
      const tgTheme = tg.themeParams
      
      // Get hex color values (not CSS variables)
      let headerColor: string
      let backgroundColor: string
      
      if (isDark.value) {
        // Dark theme colors
        headerColor = tgTheme.header_bg_color || tgTheme.bg_color || '#374151'
        backgroundColor = tgTheme.bg_color || '#1f2937'
        
        document.documentElement.style.setProperty('--tg-theme-bg-color', backgroundColor)
        document.documentElement.style.setProperty('--tg-theme-text-color', tgTheme.text_color || '#f9fafb')
        document.documentElement.style.setProperty('--tg-theme-hint-color', tgTheme.hint_color || '#9ca3af')
        document.documentElement.style.setProperty('--tg-theme-link-color', tgTheme.link_color || '#60a5fa')
        document.documentElement.style.setProperty('--tg-theme-button-color', tgTheme.button_color || '#60a5fa')
        document.documentElement.style.setProperty('--tg-theme-button-text-color', tgTheme.button_text_color || '#ffffff')
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tgTheme.secondary_bg_color || '#374151')
        document.documentElement.style.setProperty('--tg-theme-header-bg-color', headerColor)
        document.documentElement.style.setProperty('--tg-theme-section-bg-color', tgTheme.section_bg_color || tgTheme.bg_color || '#374151')
        document.documentElement.style.setProperty('--tg-theme-section-header-text-color', tgTheme.section_header_text_color || tgTheme.text_color || '#f9fafb')
        document.documentElement.style.setProperty('--tg-theme-subtitle-text-color', tgTheme.subtitle_text_color || tgTheme.hint_color || '#9ca3af')
        document.documentElement.style.setProperty('--tg-theme-destructive-text-color', tgTheme.destructive_text_color || '#f87171')
      } else {
        // Light theme colors
        headerColor = tgTheme.header_bg_color || tgTheme.bg_color || '#ffffff'
        backgroundColor = tgTheme.bg_color || '#f9fafb'
        
        document.documentElement.style.setProperty('--tg-theme-bg-color', backgroundColor)
        document.documentElement.style.setProperty('--tg-theme-text-color', tgTheme.text_color || '#111827')
        document.documentElement.style.setProperty('--tg-theme-hint-color', tgTheme.hint_color || '#6b7280')
        document.documentElement.style.setProperty('--tg-theme-link-color', tgTheme.link_color || '#3b82f6')
        document.documentElement.style.setProperty('--tg-theme-button-color', tgTheme.button_color || '#3b82f6')
        document.documentElement.style.setProperty('--tg-theme-button-text-color', tgTheme.button_text_color || '#ffffff')
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tgTheme.secondary_bg_color || '#ffffff')
        document.documentElement.style.setProperty('--tg-theme-header-bg-color', headerColor)
        document.documentElement.style.setProperty('--tg-theme-section-bg-color', tgTheme.section_bg_color || tgTheme.bg_color || '#ffffff')
        document.documentElement.style.setProperty('--tg-theme-section-header-text-color', tgTheme.section_header_text_color || tgTheme.text_color || '#111827')
        document.documentElement.style.setProperty('--tg-theme-subtitle-text-color', tgTheme.subtitle_text_color || tgTheme.hint_color || '#6b7280')
        document.documentElement.style.setProperty('--tg-theme-destructive-text-color', tgTheme.destructive_text_color || '#ef4444')
      }
      
      // Update Telegram WebApp colors only if API version supports it (6.1+)
      // setHeaderColor and setBackgroundColor require hex colors, not CSS variables
      if (versionAtLeast(tg, '6.1') && typeof tg.setHeaderColor === 'function' && typeof tg.setBackgroundColor === 'function') {
        try {
          tg.setHeaderColor(headerColor)
          tg.setBackgroundColor(backgroundColor)
        } catch (error) {
          // Silently ignore errors if methods are not supported
          console.warn('Telegram WebApp color methods not available:', error)
        }
      }
    }
  }

  const setTheme = async (newTheme: ThemeMode) => {
    theme.value = newTheme
    if (settings.value) {
      await updateSettings({ theme: newTheme })
    } else {
      // Fallback to localStorage if settings not loaded
      if (process.client) {
        localStorage.setItem('theme', newTheme)
      }
    }
    if (process.client) {
      applyTheme(newTheme)
    }
  }

  // Watch for system theme changes when in auto mode
  let mediaQuery: MediaQueryList | null = null
  let handleSystemThemeChange: ((e: MediaQueryListEvent) => void) | null = null

  onMounted(() => {
    if (process.client) {
      // Apply initial theme
      applyTheme()

      // Listen to system theme changes for auto mode
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      handleSystemThemeChange = () => {
        if (theme.value === 'auto') {
          applyTheme()
        }
      }
      mediaQuery.addEventListener('change', handleSystemThemeChange)

      // Listen to Telegram theme changes
      if ((window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp
        tg.onEvent('themeChanged', () => {
          applyTheme()
        })
      }
    }
  })

  onUnmounted(() => {
    if (process.client && mediaQuery && handleSystemThemeChange) {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
      mediaQuery = null
      handleSystemThemeChange = null
    }
  })

  // Watch theme changes
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  }, { immediate: false })

  return {
    theme: readonly(theme),
    isDark,
    setTheme,
    applyTheme
  }
}

