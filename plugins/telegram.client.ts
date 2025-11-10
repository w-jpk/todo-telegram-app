export default defineNuxtPlugin(() => {
  if (process.client) {
    // Wait for Telegram Web App SDK to load
    const tg = (window as any).Telegram?.WebApp
    
    if (tg) {
      tg.ready()
      tg.expand()
      
      // Get user from initData
      const user = tg.initDataUnsafe?.user || null
      
      return {
        provide: {
          telegram: {
            webApp: tg,
            user: user,
            initData: tg.initData || '',
            initDataUnsafe: tg.initDataUnsafe || {}
          }
        }
      }
    }
  }
  
  return {
    provide: {
      telegram: {
        webApp: null,
        user: null,
        initData: '',
        initDataUnsafe: {}
      }
    }
  }
})

