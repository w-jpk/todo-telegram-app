/**
 * Утилиты для тестирования в dev режиме
 * Эти функции помогают тестировать компоненты и функциональность в браузере
 */

// Глобальные утилиты для dev консоли
if (process.dev && typeof window !== 'undefined') {
  (window as any).__DEV_TEST_UTILS__ = {
    /**
     * Создает тестовую задачу
     */
    createTestTodo: (overrides = {}) => ({
      id: `test-${Date.now()}`,
      text: 'Test Todo',
      description: 'Test Description',
      completed: false,
      priority: 'medium',
      userId: 123456789,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }),

    /**
     * Создает тестовый проект
     */
    createTestProject: (overrides = {}) => ({
      id: `project-${Date.now()}`,
      name: 'Test Project',
      color: '#2481cc',
      userId: 123456789,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }),

    /**
     * Логирует состояние todos в консоль
     */
    logTodos: (todos: any[]) => {
      console.group('📋 Todos State')
      console.table(todos.map(t => ({
        id: t.id,
        text: t.text,
        completed: t.completed,
        priority: t.priority,
        project: t.project?.name || 'None'
      })))
      console.groupEnd()
    },

    /**
     * Симулирует API запрос
     */
    mockApiResponse: (endpoint: string, response: any) => {
      console.log(`🔧 Mocking API: ${endpoint}`, response)
      // В dev режиме можно перехватывать fetch запросы
      if ((window as any).__MOCK_API__) {
        (window as any).__MOCK_API__[endpoint] = response
      }
    },

    /**
     * Очищает localStorage и sessionStorage
     */
    clearStorage: () => {
      localStorage.clear()
      sessionStorage.clear()
      console.log('🧹 Storage cleared')
    },

    /**
     * Устанавливает тестового пользователя Telegram
     */
    setTestUser: (user: any) => {
      try {
        // Попытка получить доступ к Nuxt app (может быть недоступен в некоторых контекстах)
        if (typeof window !== 'undefined' && (window as any).$nuxt) {
          const nuxtApp = (window as any).$nuxt
          if (nuxtApp.$telegram) {
            nuxtApp.$telegram.user = user
            nuxtApp.$telegram.isReady = true
            console.log('👤 Test user set:', user)
          }
        } else {
          // Альтернативный способ через sessionStorage
          sessionStorage.setItem('telegram_user_data', JSON.stringify({
            user,
            timestamp: Date.now()
          }))
          console.log('👤 Test user saved to sessionStorage:', user)
          console.warn('⚠️ Reload page to apply user changes')
        }
      } catch (error) {
        console.error('Error setting test user:', error)
      }
    }
  }

  console.log('%c🧪 Dev Test Utils Loaded', 'color: #4CAF50; font-weight: bold; font-size: 14px')
  console.log('Use window.__DEV_TEST_UTILS__ to access test utilities')
}

