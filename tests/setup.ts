import { vi } from 'vitest'

// Mock Nuxt composables
vi.mock('#app', () => ({
  useState: vi.fn((key: string, defaultValue: any) => {
    let currentValue = typeof defaultValue === 'function' ? defaultValue() : defaultValue
    const ref = {
      get value() {
        return currentValue
      },
      set value(newValue: any) {
        currentValue = newValue
      }
    }
    return ref
  }),
  useNuxtApp: vi.fn(() => ({
    $telegram: {
      user: {
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        language_code: 'ru'
      },
      initData: '',
      initDataUnsafe: {},
      isReady: true
    }
  })),
  readonly: vi.fn((ref) => ref),
  navigateTo: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn()
  })),
  useRoute: vi.fn(() => ({
    path: '/',
    params: {},
    query: {}
  }))
}))

// Mock $fetch
const mockFetch = vi.fn() as any
mockFetch.raw = vi.fn()
mockFetch.create = vi.fn(() => mockFetch)
global.$fetch = mockFetch

// Mock i18n
vi.mock('#imports', () => ({
  computed: vi.fn((fn) => ({ value: fn() })),
  ref: vi.fn((val) => ({ value: val })),
  reactive: vi.fn((obj) => obj),
  readonly: vi.fn((ref) => ref),
  watch: vi.fn(),
  watchEffect: vi.fn(),
  onMounted: vi.fn((fn) => fn()),
  onUnmounted: vi.fn((fn) => fn()),
  useI18n: vi.fn(() => ({
    locale: { value: 'ru' },
    locales: { value: [{ code: 'ru' }, { code: 'en' }] },
    t: vi.fn((key: string) => key),
    setLocale: vi.fn()
  })),
  useHead: vi.fn(),
  useSeoMeta: vi.fn()
}))

// Mock Telegram WebApp
if (typeof window !== 'undefined') {
  (window as any).Telegram = {
    WebApp: {
      ready: vi.fn(),
      expand: vi.fn(),
      close: vi.fn(),
      initData: '',
      initDataUnsafe: {
        user: {
          id: 123456789,
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser',
          language_code: 'ru'
        }
      },
      HapticFeedback: {
        impactOccurred: vi.fn(),
        notificationOccurred: vi.fn(),
        selectionChanged: vi.fn()
      },
      onEvent: vi.fn(),
      offEvent: vi.fn()
    }
  }
}

// Global test utilities
export const createMockTodo = (overrides = {}) => ({
  id: 'test-todo-id',
  text: 'Test Todo',
  description: 'Test Description',
  completed: false,
  priority: 'medium' as const,
  userId: 123456789,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})

export const createMockProject = (overrides = {}) => ({
  id: 'test-project-id',
  name: 'Test Project',
  color: '#2481cc',
  userId: 123456789,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})

export const createMockUser = (overrides = {}) => ({
  id: 123456789,
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
  language_code: 'ru',
  is_premium: false,
  ...overrides
})

