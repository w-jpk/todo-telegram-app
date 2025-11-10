<template>
  <div>
    <TodoApp />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const { $telegram } = useNuxtApp()

const applyTheme = () => {
  if (process.client && (window as any).Telegram?.WebApp) {
    const tg = (window as any).Telegram.WebApp
    
    // Expand the app to full height
    tg.expand()
    
    // Set theme colors from Telegram
    if (tg.themeParams) {
      const theme = tg.themeParams
      document.documentElement.style.setProperty('--tg-theme-bg-color', theme.bg_color || '#ffffff')
      document.documentElement.style.setProperty('--tg-theme-text-color', theme.text_color || '#000000')
      document.documentElement.style.setProperty('--tg-theme-hint-color', theme.hint_color || '#999999')
      document.documentElement.style.setProperty('--tg-theme-link-color', theme.link_color || '#2481cc')
      document.documentElement.style.setProperty('--tg-theme-button-color', theme.button_color || '#2481cc')
      document.documentElement.style.setProperty('--tg-theme-button-text-color', theme.button_text_color || '#ffffff')
      document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color || '#f1f1f1')
    }
    
    // Enable closing confirmation
    tg.enableClosingConfirmation()
    
    // Log user info for debugging
    if (tg.initDataUnsafe?.user) {
      console.log('Telegram User:', tg.initDataUnsafe.user)
    }
    
    // Listen for theme changes
    tg.onEvent('themeChanged', applyTheme)
  }
}

onMounted(() => {
  // Wait a bit for Telegram SDK to initialize
  setTimeout(() => {
    applyTheme()
  }, 100)
})
</script>

