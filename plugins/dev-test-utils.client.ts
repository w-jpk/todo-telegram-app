/**
 * Плагин для загрузки dev тестовых утилит
 * Доступен только в dev режиме
 */
export default defineNuxtPlugin(() => {
  if (process.dev && process.client) {
    // Импортируем dev-helpers
    import('~/tests/dev-helpers').then(() => {
      console.log('%c✅ Dev Test Utils loaded', 'color: #4CAF50; font-weight: bold')
    }).catch((err) => {
      console.warn('Failed to load dev test utils:', err)
    })
  }
})

