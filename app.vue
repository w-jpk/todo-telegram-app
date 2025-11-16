<template>
  <div class="tg-viewport">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const { $telegram } = useNuxtApp()
const { applyTheme } = useTheme()

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
      tg.expand()
      
      // Enable closing confirmation
      tg.enableClosingConfirmation()
      
      // Log user info for debugging
      if (tg.initDataUnsafe?.user) {
        console.log('Telegram User:', tg.initDataUnsafe.user)
      }
      
      // Listen for viewport changes
      tg.onEvent('viewportChanged', handleViewportChange)
    }
    
    // Apply theme (will use saved preference or Telegram theme)
    applyTheme()
    
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

