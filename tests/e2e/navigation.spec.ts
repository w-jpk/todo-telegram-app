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

test.describe('Navigation', () => {
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
  })

  test('should navigate between pages', async ({ page }) => {
    await page.goto('/')

    // Check main page
    await expect(page).toHaveTitle(/Todo Telegram App/)
    await expect(page.locator('h1')).toContainText(/Задачи/)

    // Navigate to settings
    await page.locator('nav a[href="/settings"]').click()
    await expect(page).toHaveURL(/\/settings/)
    await expect(page.locator('h1')).toContainText(/Настройки/)

    // Navigate to stats
    await page.locator('nav a[href="/stats"]').click()
    await expect(page).toHaveURL(/\/stats/)
    await expect(page.locator('h1')).toContainText(/Статистика/)

    // Navigate to calendar
    await page.locator('nav a[href="/calendar"]').click()
    await expect(page).toHaveURL(/\/calendar/)
    await expect(page.locator('h1')).toContainText(/Календарь/)

    // Navigate back to main page
    await page.locator('nav a[href="/"]').click()
    await expect(page).toHaveURL(/\//)
  })

  test('should handle responsive navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // Mobile size

    await page.goto('/')

    // Check if bottom navigation is visible on mobile
    await expect(page.locator('.bottom-navigation')).toBeVisible()

    // Test bottom navigation
    await page.locator('.bottom-navigation a[href="/settings"]').click()
    await expect(page).toHaveURL(/\/settings/)

    await page.locator('.bottom-navigation a[href="/"]').click()
    await expect(page).toHaveURL(/\//)
  })

  test('should handle language switching', async ({ page }) => {
    await page.goto('/settings')

    // Find language selector and switch to English
    const langSelector = page.locator('select[name="language"]')
    await langSelector.selectOption('en')

    // Check if UI switched to English
    await expect(page.locator('h1')).toContainText(/Settings/)

    // Switch back to Russian
    await langSelector.selectOption('ru')
    await expect(page.locator('h1')).toContainText(/Настройки/)
  })

  test('should handle theme switching', async ({ page }) => {
    await page.goto('/settings')

    // Find theme selector
    const themeSelector = page.locator('select[name="theme"]')

    // Switch to dark theme
    await themeSelector.selectOption('dark')

    // Check if body has dark class
    await expect(page.locator('body')).toHaveClass(/dark/)

    // Switch to light theme
    await themeSelector.selectOption('light')
    await expect(page.locator('body')).toHaveClass(/light/)
  })
})