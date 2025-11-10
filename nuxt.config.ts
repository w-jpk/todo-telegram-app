// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  compatibilityDate: '2024-01-01',
  
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  
  css: ['~/assets/css/main.css'],
  
  runtimeConfig: {
    // Private keys (only available on server-side)
    databaseUrl: process.env.DATABASE_URL,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    
    // Public keys (exposed to client-side)
    public: {
      apiBase: process.env.API_BASE || '/api'
    }
  },
  
  app: {
    head: {
      title: 'Todo Telegram App',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      script: [
        {
          src: 'https://telegram.org/js/telegram-web-app.js'
        }
      ]
    }
  },
  
  typescript: {
    strict: true,
    typeCheck: true
  }
})

