export default defineNuxtPlugin(() => {
  if (process.client) {
    // Storage key for Telegram user data
    const STORAGE_KEY = 'telegram_user_data'
    
    // Function to save user data to sessionStorage
    const saveUserData = (user: any, initData: string, initDataUnsafe: any) => {
      try {
        if (user) {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
            user,
            initData,
            initDataUnsafe,
            timestamp: Date.now()
          }))
        }
      } catch (error) {
        console.error('Error saving user data to sessionStorage:', error)
      }
    }
    
    // Function to load user data from sessionStorage
    const loadUserData = () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY)
        if (stored) {
          const data = JSON.parse(stored)
          // Check if data is not too old (24 hours)
          const maxAge = 24 * 60 * 60 * 1000
          if (Date.now() - data.timestamp < maxAge) {
            return data
          } else {
            // Remove expired data
            sessionStorage.removeItem(STORAGE_KEY)
          }
        }
      } catch (error) {
        console.error('Error loading user data from sessionStorage:', error)
      }
      return null
    }
    
    // Load saved user data first
    const savedData = loadUserData()
    
    // Create reactive state for Telegram data
    const telegramState = reactive({
      webApp: null as any,
      user: savedData?.user as any,
      initData: savedData?.initData || '',
      initDataUnsafe: savedData?.initDataUnsafe || {},
      isReady: savedData ? true : false
    })
    
    // Function to initialize Telegram WebApp
    const initTelegram = () => {
      const tg = (window as any).Telegram?.WebApp
      
      if (tg) {
        try {
          tg.ready()
          tg.expand()
          
          // Get user from initData (prefer fresh data from Telegram SDK)
          const user = tg.initDataUnsafe?.user || telegramState.user
          const initData = tg.initData || telegramState.initData
          const initDataUnsafe = tg.initDataUnsafe || telegramState.initDataUnsafe
          
          telegramState.webApp = tg
          telegramState.user = user
          telegramState.initData = initData
          telegramState.initDataUnsafe = initDataUnsafe
          telegramState.isReady = true
          
          // Save to sessionStorage if we have user data
          if (user) {
            saveUserData(user, initData, initDataUnsafe)
          }
          
          console.log('Telegram WebApp initialized:', { user })
          
          // Listen for updates
          tg.onEvent('viewportChanged', () => {
            // Update user data if it changes
            if (tg.initDataUnsafe?.user) {
              telegramState.user = tg.initDataUnsafe.user
              telegramState.initDataUnsafe = tg.initDataUnsafe
              telegramState.initData = tg.initData || ''
              // Save updated data
              saveUserData(telegramState.user, telegramState.initData, telegramState.initDataUnsafe)
            }
          })
        } catch (error) {
          console.error('Error initializing Telegram WebApp:', error)
        }
      }
    }

    // Try to initialize immediately
    initTelegram()

    // If SDK is not loaded yet, wait for it (even if we have restored data)
    const tg = (window as any).Telegram?.WebApp
    if (!tg) {
      // Check if script is already loaded
      const checkInterval = setInterval(() => {
        if ((window as any).Telegram?.WebApp) {
          initTelegram()
          // Clear interval once SDK is loaded and initialized
          if ((window as any).Telegram?.WebApp) {
            clearInterval(checkInterval)
          }
        }
      }, 50) // Check more frequently

      // Stop checking after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!(window as any).Telegram?.WebApp) {
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
  
  // Server-side: return empty state
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

