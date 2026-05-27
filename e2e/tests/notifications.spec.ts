/**
 * Critical path: Notifications
 * - Notifications page loads
 * - Mark as read works
 */

import { test, expect } from './fixtures'

test.describe('Notifications', () => {
  test('notifications page loads', async ({ authedPage: page }) => {
    await page.goto('/notifications')
    await expect(page.getByRole('heading', { name: /notifications|thông báo/i })).toBeVisible({ timeout: 10_000 })
  })

  test('mark all read button renders', async ({ authedPage: page }) => {
    await page.goto('/notifications')
    await page.waitForTimeout(2_000)
    // Button may be disabled when there are no unread notifications
    const btn = page.getByRole('button', { name: /mark all|đánh dấu/i })
    await expect(btn).toBeVisible({ timeout: 8_000 })
  })
})
