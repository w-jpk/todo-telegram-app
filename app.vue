<template>
  <div class="tg-viewport">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const { $telegram } = useNuxtApp()

const applyTheme = () => {
  if (process.client && (window as any).Telegram?.WebApp) {
    const tg = (window as any).Telegram.WebApp
    
    // Expand the app to full height
    tg.expand()
    
    // Set viewport height for mobile browsers
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
    
    // Set theme colors from Telegram (with dark theme defaults)
    if (tg.themeParams) {
      const theme = tg.themeParams
      // Use Telegram theme if available, otherwise use dark theme defaults
      document.documentElement.style.setProperty('--tg-theme-bg-color', theme.bg_color || '#212121')
      document.documentElement.style.setProperty('--tg-theme-text-color', theme.text_color || '#ffffff')
      document.documentElement.style.setProperty('--tg-theme-hint-color', theme.hint_color || '#707579')
      document.documentElement.style.setProperty('--tg-theme-link-color', theme.link_color || '#6ab7ff')
      document.documentElement.style.setProperty('--tg-theme-button-color', theme.button_color || '#5288c1')
      document.documentElement.style.setProperty('--tg-theme-button-text-color', theme.button_text_color || '#ffffff')
      document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color || '#181818')
      document.documentElement.style.setProperty('--tg-theme-header-bg-color', theme.header_bg_color || theme.bg_color || '#212121')
      document.documentElement.style.setProperty('--tg-theme-section-bg-color', theme.section_bg_color || theme.bg_color || '#212121')
      document.documentElement.style.setProperty('--tg-theme-section-header-text-color', theme.section_header_text_color || theme.text_color || '#ffffff')
      document.documentElement.style.setProperty('--tg-theme-subtitle-text-color', theme.subtitle_text_color || theme.hint_color || '#707579')
      document.documentElement.style.setProperty('--tg-theme-destructive-text-color', theme.destructive_text_color || '#ff453a')
    } else {
      // Apply dark theme if Telegram theme is not available
      document.documentElement.style.setProperty('--tg-theme-bg-color', '#212121')
      document.documentElement.style.setProperty('--tg-theme-text-color', '#ffffff')
      document.documentElement.style.setProperty('--tg-theme-hint-color', '#707579')
      document.documentElement.style.setProperty('--tg-theme-link-color', '#6ab7ff')
      document.documentElement.style.setProperty('--tg-theme-button-color', '#5288c1')
      document.documentElement.style.setProperty('--tg-theme-button-text-color', '#ffffff')
      document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', '#181818')
      document.documentElement.style.setProperty('--tg-theme-header-bg-color', '#212121')
      document.documentElement.style.setProperty('--tg-theme-section-bg-color', '#212121')
      document.documentElement.style.setProperty('--tg-theme-section-header-text-color', '#ffffff')
      document.documentElement.style.setProperty('--tg-theme-subtitle-text-color', '#707579')
      document.documentElement.style.setProperty('--tg-theme-destructive-text-color', '#ff453a')
    }
    
    // Enable closing confirmation
    tg.enableClosingConfirmation()
    
    // Set background color
    tg.setHeaderColor('var(--tg-theme-header-bg-color)')
    tg.setBackgroundColor('var(--tg-theme-bg-color)')
    
    // Log user info for debugging
    if (tg.initDataUnsafe?.user) {
      console.log('Telegram User:', tg.initDataUnsafe.user)
    }
    
    // Listen for theme changes
    tg.onEvent('themeChanged', applyTheme)
    tg.onEvent('viewportChanged', handleViewportChange)
  }
}

const handleViewportChange = () => {
  if (process.client) {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }
}

const handleResize = () => {
  if (process.client) {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }
}

onMounted(() => {
  // Apply dark theme immediately
  if (process.client) {
    // Set dark theme as default
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
    
    // Apply Telegram theme colors immediately
    document.documentElement.style.setProperty('--tg-theme-bg-color', '#212121')
    document.documentElement.style.setProperty('--tg-theme-text-color', '#ffffff')
    document.documentElement.style.setProperty('--tg-theme-hint-color', '#707579')
    document.documentElement.style.setProperty('--tg-theme-link-color', '#6ab7ff')
    document.documentElement.style.setProperty('--tg-theme-button-color', '#5288c1')
    document.documentElement.style.setProperty('--tg-theme-button-text-color', '#ffffff')
    document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', '#181818')
    document.documentElement.style.setProperty('--tg-theme-header-bg-color', '#212121')
    document.documentElement.style.setProperty('--tg-theme-section-bg-color', '#212121')
    document.documentElement.style.setProperty('--tg-theme-section-header-text-color', '#ffffff')
    document.documentElement.style.setProperty('--tg-theme-subtitle-text-color', '#707579')
    document.documentElement.style.setProperty('--tg-theme-destructive-text-color', '#ff453a')
  }
  
  // Wait a bit for Telegram SDK to initialize
  setTimeout(() => {
    applyTheme()
  }, 100)
  
  // Handle viewport resize
  if (process.client) {
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    handleResize()
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', handleResize)
  }
})
</script>

