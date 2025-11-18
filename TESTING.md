# Руководство по тестированию

## Обзор

Проект использует два типа тестирования:
- **Unit тесты** (Vitest) - для тестирования composables и утилит
- **E2E тесты** (Playwright) - для тестирования пользовательских сценариев

## Тестирование в Dev режиме

Для тестирования во время разработки доступны специальные инструменты:

### Быстрый старт
```bash
# Запустить dev сервер
npm run dev

# В другом терминале запустить тесты в watch режиме
npm run test:watch
```

### Страница для тестирования компонентов
1. Запустите `npm run dev`
2. Откройте `http://localhost:3002/dev/components`
3. Используйте интерактивную страницу для тестирования компонентов

### Dev утилиты в консоли браузера
В dev режиме доступны утилиты через `window.__DEV_TEST_UTILS__`:
- `createTestTodo()` - создать тестовую задачу
- `createTestProject()` - создать тестовый проект
- `logTodos()` - логировать состояние задач
- `clearStorage()` - очистить хранилище
- `setTestUser()` - установить тестового пользователя

Подробнее см. [DEV_TESTING.md](./DEV_TESTING.md)

## Настройка для разработки

### Запуск unit тестов

```bash
# Запуск тестов в watch режиме (рекомендуется для разработки)
npm run test:watch

# Запуск тестов один раз
npm run test:run

# Запуск тестов с покрытием
npm run test:coverage

# Запуск тестов с UI
npm run test:ui
```

### Запуск E2E тестов

```bash
# Запуск всех E2E тестов
npm run test:e2e

# Запуск E2E тестов с UI
npm run test:e2e:ui
```

### Запуск всех тестов

```bash
npm run test:all
```

## Структура тестов

```
tests/
├── setup.ts              # Глобальная настройка тестов
├── utils/
│   └── test-helpers.ts   # Утилиты для создания mock данных
├── composables/
│   ├── useTodos.test.ts  # Тесты для useTodos
│   └── useProjects.test.ts # Тесты для useProjects
└── e2e/
    ├── navigation.spec.ts
    └── todo-management.spec.ts
```

## Написание тестов

### Unit тесты для composables

Пример теста для composable:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTodos } from '~/composables/useTodos'
import { createMockTodo } from '../utils/test-helpers'

describe('useTodos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should filter todos correctly', () => {
    const { todos, setFilter, filteredTodos } = useTodos()
    todos.value = [
      createMockTodo({ id: '1', completed: false }),
      createMockTodo({ id: '2', completed: true })
    ]

    setFilter('active')
    expect(filteredTodos.value).toHaveLength(1)
  })
})
```

### E2E тесты

Пример E2E теста:

```typescript
import { test, expect } from '@playwright/test'

test('should create a new todo', async ({ page }) => {
  await page.goto('/')
  await page.click('[data-testid="add-task-button"]')
  await page.fill('[data-testid="task-input"]', 'New Task')
  await page.click('[data-testid="save-button"]')
  
  await expect(page.locator('text=New Task')).toBeVisible()
})
```

## Mock данные

Используйте утилиты из `tests/utils/test-helpers.ts`:

```typescript
import { createMockTodo, createMockProject } from '../utils/test-helpers'

const todo = createMockTodo({ text: 'Custom Todo' })
const project = createMockProject({ name: 'Custom Project' })
```

## Тестирование в dev режиме

Для разработки рекомендуется использовать watch режим:

```bash
npm run test:watch
```

Это позволит автоматически перезапускать тесты при изменении файлов.

## Покрытие кода

Для проверки покрытия кода:

```bash
npm run test:coverage
```

Результаты будут доступны в `coverage/` директории.

## Рекомендации

1. **Пишите тесты параллельно с кодом** - это помогает выявить проблемы на раннем этапе
2. **Используйте описательные имена тестов** - они служат документацией
3. **Тестируйте граничные случаи** - пустые массивы, null значения, ошибки
4. **Изолируйте тесты** - каждый тест должен быть независимым
5. **Используйте моки для внешних зависимостей** - API, база данных, Telegram SDK

## Отладка тестов

### Отладка unit тестов

Используйте `console.log` или точки останова в VS Code:

```typescript
it('should debug test', () => {
  const result = useTodos()
  console.log(result) // Отладка
  debugger // Точка останова
})
```

### Отладка E2E тестов

Используйте Playwright Inspector:

```bash
PWDEBUG=1 npm run test:e2e
```

Или используйте UI режим:

```bash
npm run test:e2e:ui
```

## CI/CD

Тесты автоматически запускаются в CI/CD пайплайне. Убедитесь, что все тесты проходят перед созданием PR.

