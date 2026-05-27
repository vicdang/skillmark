/**
 * Critical path: Authentication
 * - Login with valid credentials → lands on Dashboard
 * - Login with invalid credentials → shows error
 * - Visiting a protected route while unauthenticated → redirected to /login
 * - Logout → redirected to /login
 */

import { test, expect, loginAs, USERS } from './fixtures'

test.describe('Authentication', () => {
  test('unauthenticated access redirects to /login', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL(/\/login/)
    await expect(page).toHaveURL(/\/login/)
  })

  test('login with valid credentials lands on Dashboard', async ({ page }) => {
    await loginAs(page, USERS.admin)
    await expect(page).not.toHaveURL(/\/login/)
    // Dashboard heading or nav item should be visible
    await expect(page.locator('nav, [data-testid="sidebar"]').first()).toBeVisible()
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder(/email/i).fill('bad@example.com')
    await page.getByPlaceholder(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/invalid|incorrect|wrong|error/i).first()).toBeVisible({ timeout: 8_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('logout redirects to /login', async ({ authedPage: page }) => {
    // Open user menu and click logout
    const logoutTrigger = page.getByRole('button', { name: /logout|sign out/i })
      .or(page.getByText(/logout|sign out/i).first())
    await logoutTrigger.click()
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })
})
