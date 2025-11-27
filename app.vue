<template>
  <div class="tg-viewport">
    <!-- Skip Links for Accessibility -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded z-50">
      Skip to main content
    </a>
    <a href="#navigation" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-40 bg-blue-600 text-white px-4 py-2 rounded z-50">
      Skip to navigation
    </a>

    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { versionAtLeast, safeCallTelegramMethod } from '~/utils/telegram'
import { useAppearance } from '~/composables/useAppearance'

const { $telegram } = useNuxtApp()
const { applyTheme } = useTheme()
const { applyAppearanceSettings } = useAppearance()

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
  if (process.client) {
    // Initialize Telegram WebApp
    if ((window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp
      
      // Expand the app to full height
      safeCallTelegramMethod(tg, 'expand')
      
      // Enable closing confirmation only if supported (6.2+)
      safeCallTelegramMethod(tg, 'enableClosingConfirmation', '6.2')
      
      // Log user info for debugging
      if (tg.initDataUnsafe?.user) {
        console.log('Telegram User:', tg.initDataUnsafe.user)
      }
      
      // Listen for viewport changes
      if (typeof tg.onEvent === 'function') {
        tg.onEvent('viewportChanged', handleViewportChange)
      }
    }
    
    // Apply theme (will use saved preference or Telegram theme)
    applyTheme()

    // Apply appearance settings
    applyAppearanceSettings()
    
    // Handle viewport resize
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

