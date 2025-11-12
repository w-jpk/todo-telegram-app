export default defineNuxtPlugin(() => {
  if (process.client) {
    // Create reactive state for Telegram data
    const telegramState = reactive({
      webApp: null as any,
      user: null as any,
      initData: '',
      initDataUnsafe: {} as any,
      isReady: false
    })

    // Function to initialize Telegram WebApp
    const initTelegram = () => {
      const tg = (window as any).Telegram?.WebApp
      
      if (tg && !telegramState.isReady) {
        try {
          tg.ready()
          tg.expand()
          
          // Get user from initData
          const user = tg.initDataUnsafe?.user || null
          
          telegramState.webApp = tg
          telegramState.user = user
          telegramState.initData = tg.initData || ''
          telegramState.initDataUnsafe = tg.initDataUnsafe || {}
          telegramState.isReady = true
          
          console.log('Telegram WebApp initialized:', { user })
          
          // Listen for updates
          tg.onEvent('viewportChanged', () => {
            // Update user data if it changes
            if (tg.initDataUnsafe?.user) {
              telegramState.user = tg.initDataUnsafe.user
              telegramState.initDataUnsafe = tg.initDataUnsafe
            }
          })
        } catch (error) {
          console.error('Error initializing Telegram WebApp:', error)
        }
      }
    }

    // Try to initialize immediately
    initTelegram()

    // If SDK is not loaded yet, wait for it
    if (!telegramState.isReady) {
      // Check if script is already loaded
      const checkInterval = setInterval(() => {
        if ((window as any).Telegram?.WebApp) {
          initTelegram()
          if (telegramState.isReady) {
            clearInterval(checkInterval)
          }
        }
      }, 50) // Check more frequently

      // Stop checking after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!telegramState.isReady) {
          console.warn('Telegram WebApp SDK not loaded after 5 seconds')
        }
      }, 5000)

      // Also listen for script load event
      const handleLoad = () => {
        setTimeout(() => {
          initTelegram()
        }, 100)
      }
      
      if (document.readyState === 'complete') {
        handleLoad()
      } else {
        window.addEventListener('load', handleLoad, { once: true })
      }
    }

    return {
      provide: {
        telegram: telegramState
      }
    }
  }
  
  return {
    provide: {
      telegram: {
        webApp: null,
        user: null,
        initData: '',
        initDataUnsafe: {},
        isReady: false
      }
    }
  }
})

