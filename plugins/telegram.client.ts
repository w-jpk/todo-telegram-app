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
      // Check if Telegram WebApp is available
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp

        try {
          // Modern initialization for Telegram WebApp v6.0+
          if (tg.ready) {
            tg.ready()
          }

          // Get user data safely
          const user = tg.initDataUnsafe?.user
          const initData = tg.initData || ''
          const initDataUnsafe = tg.initDataUnsafe || {}

          // Update state
          telegramState.webApp = tg
          telegramState.user = user
          telegramState.initData = initData
          telegramState.initDataUnsafe = initDataUnsafe
          telegramState.isReady = true

          // Save user data if available
          if (user) {
            saveUserData(user, initData, initDataUnsafe)
          }

          console.log('Telegram WebApp initialized successfully')

        } catch (error) {
          console.error('Error initializing Telegram WebApp:', error)
        }
      } else {
        console.warn('Telegram WebApp not available')
      }
    }

    // Initialize Telegram WebApp when script is loaded
    const initWhenReady = () => {
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        initTelegram()
      } else {
        // Wait for script to load, but don't wait forever
        const maxAttempts = 50 // 5 seconds max
        let attempts = 0
        const checkInterval = setInterval(() => {
          attempts++
          if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
            clearInterval(checkInterval)
            initTelegram()
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval)
            // If Telegram WebApp is not available but we have saved data, keep it
            if (savedData?.user) {
              console.log('[Telegram Plugin] Using saved user data, Telegram WebApp not available')
              telegramState.isReady = true
            } else {
              console.warn('[Telegram Plugin] Telegram WebApp not available and no saved data')
            }
          }
        }, 100)
      }
    }

    // Start initialization immediately
    initWhenReady()
    
    // Also try to initialize after a short delay to catch late-loading scripts
    setTimeout(() => {
      if (!telegramState.isReady && typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        initTelegram()
      }
    }, 500)

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

