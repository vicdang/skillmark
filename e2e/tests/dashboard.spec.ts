/**
 * Critical path: Dashboard
 * - Dashboard loads and shows stat cards
 * - Charts render without JS errors
 * - Export buttons are visible to admin
 */

import { test, expect } from './fixtures'

test.describe('Dashboard', () => {
  test('dashboard loads stat cards', async ({ authedPage: page }) => {
    await page.goto('/')
    // At least one stat card value should be visible (numbers or loading text)
    await expect(
      page.locator('[class*="card"], [class*="stat"]').first()
        .or(page.getByText(/total employees|active projects|skill gaps/i).first())
    ).toBeVisible({ timeout: 15_000 })
  })

  test('no JS console errors on dashboard load', async ({ authedPage: page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/')
    await page.waitForTimeout(3_000)
    // Filter out known benign errors (e.g. HMR, extension noise)
    const fatal = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('extension') && !e.includes('hot-reload')
    )
    expect(fatal).toHaveLength(0)
  })

  test('export buttons visible to admin', async ({ authedPage: page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('button', { name: /excel|pdf|export/i }).first()
    ).toBeVisible({ timeout: 15_000 })
  })
})
