import { test, expect } from '@playwright/test'

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user: {
            id: number
            first_name: string
            last_name?: string
            username?: string
          }
        }
        ready: () => void
        expand: () => void
        close: () => void
      }
    }
  }
}

test.describe('Todo Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Telegram WebApp API
    await page.addInitScript(() => {
      window.Telegram = {
        WebApp: {
          initData: 'mock_init_data',
          initDataUnsafe: {
            user: {
              id: 123,
              first_name: 'Test User',
              last_name: 'Test',
              username: 'testuser'
            }
          },
          ready: () => {},
          expand: () => {},
          close: () => {}
        }
      }
    })

    await page.goto('/')
  })

  test('should load the main page', async ({ page }) => {
    await expect(page).toHaveTitle(/Todo Telegram App/)
    await expect(page.locator('h1')).toContainText(/Задачи/)
  })

  test('should create a new todo', async ({ page }) => {
    const todoText = 'Test todo from e2e'

    // Click the floating action button to open modal
    await page.locator('.floating-action-button').click()

    // Wait for modal to appear
    await page.waitForSelector('[data-testid="todo-modal"]')

    // Fill in the todo text
    await page.locator('input[name="text"]').fill(todoText)

    // Submit the form
    await page.locator('button[type="submit"]').click()

    // Wait for modal to close
    await page.waitForSelector('[data-testid="todo-modal"]', { state: 'hidden' })

    // Check if todo appears in the list
    await expect(page.locator('.todo-item').filter({ hasText: todoText })).toBeVisible()
  })

  test('should mark todo as completed', async ({ page }) => {
    // Create a todo first
    const todoText = 'Todo to complete'

    await page.locator('.floating-action-button').click()
    await page.waitForSelector('[data-testid="todo-modal"]')
    await page.locator('input[name="text"]').fill(todoText)
    await page.locator('button[type="submit"]').click()
    await page.waitForSelector('[data-testid="todo-modal"]', { state: 'hidden' })

    // Find the todo and mark as completed
    const todoItem = page.locator('.todo-item').filter({ hasText: todoText })
    await todoItem.locator('input[type="checkbox"]').check()

    // Verify it's marked as completed (should have completed class or styling)
    await expect(todoItem).toHaveClass(/completed/)
  })

  test('should filter todos by status', async ({ page }) => {
    // Create active and completed todos
    const activeTodo = 'Active todo'
    const completedTodo = 'Completed todo'

    // Create active todo
    await page.locator('.floating-action-button').click()
    await page.waitForSelector('[data-testid="todo-modal"]')
    await page.locator('input[name="text"]').fill(activeTodo)
    await page.locator('button[type="submit"]').click()
    await page.waitForSelector('[data-testid="todo-modal"]', { state: 'hidden' })

    // Create and complete todo
    await page.locator('.floating-action-button').click()
    await page.waitForSelector('[data-testid="todo-modal"]')
    await page.locator('input[name="text"]').fill(completedTodo)
    await page.locator('button[type="submit"]').click()
    await page.waitForSelector('[data-testid="todo-modal"]', { state: 'hidden' })

    // Mark second todo as completed
    const completedTodoItem = page.locator('.todo-item').filter({ hasText: completedTodo })
    await completedTodoItem.locator('input[type="checkbox"]').check()

    // Test filtering - show only active
    await page.locator('button').filter({ hasText: 'Активные' }).click()
    await expect(page.locator('.todo-item').filter({ hasText: activeTodo })).toBeVisible()
    await expect(page.locator('.todo-item').filter({ hasText: completedTodo })).not.toBeVisible()

    // Test filtering - show only completed
    await page.locator('button').filter({ hasText: 'Выполненные' }).click()
    await expect(page.locator('.todo-item').filter({ hasText: completedTodo })).toBeVisible()
    await expect(page.locator('.todo-item').filter({ hasText: activeTodo })).not.toBeVisible()

    // Test filtering - show all
    await page.locator('button').filter({ hasText: 'Все' }).click()
    await expect(page.locator('.todo-item').filter({ hasText: activeTodo })).toBeVisible()
    await expect(page.locator('.todo-item').filter({ hasText: completedTodo })).toBeVisible()
  })

  test('should delete a todo', async ({ page }) => {
    // Create a todo first
    const todoText = 'Todo to delete'

    await page.locator('.floating-action-button').click()
    await page.waitForSelector('[data-testid="todo-modal"]')
    await page.locator('input[name="text"]').fill(todoText)
    await page.locator('button[type="submit"]').click()
    await page.waitForSelector('[data-testid="todo-modal"]', { state: 'hidden' })

    // Delete the todo
    const todoItem = page.locator('.todo-item').filter({ hasText: todoText })
    await todoItem.locator('.delete-button').click()

    // Confirm deletion if there's a confirmation dialog
    const confirmButton = page.locator('button').filter({ hasText: 'Удалить' })
    if (await confirmButton.isVisible()) {
      await confirmButton.click()
    }

    // Verify todo is removed
    await expect(page.locator('.todo-item').filter({ hasText: todoText })).not.toBeVisible()
  })

  test('should handle empty state', async ({ page }) => {
    // Clear all todos first (assuming there's a clear completed button)
    const clearButton = page.locator('button').filter({ hasText: 'Очистить выполненные' })
    if (await clearButton.isVisible()) {
      await clearButton.click()
    }

    // Check if empty state is shown
    await expect(page.locator('.empty-state')).toBeVisible()
    await expect(page.locator('.empty-state')).toContainText(/Нет задач/)
  })
})