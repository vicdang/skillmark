/**
 * Critical path: Project Management
 * - Manager can create a project
 * - Project appears in the list
 * - Project detail page loads
 * - Employee cannot see "New Project" button (RBAC)
 */

import { test, expect } from './fixtures'

const UNIQUE_TITLE = `E2E Project ${Date.now()}`

test.describe('Project Management', () => {
  test('Projects list page loads', async ({ authedPage: page }) => {
    await page.goto('/projects')
    await expect(page.getByRole('heading', { name: /projects|dự án/i })).toBeVisible({ timeout: 10_000 })
  })

  test('manager can open New Project dialog', async ({ managerPage: page }) => {
    await page.goto('/projects')
    const newBtn = page.getByRole('button', { name: /new project|dự án mới/i })
    await expect(newBtn).toBeVisible({ timeout: 8_000 })
    await newBtn.click()
    // Dialog/modal should appear
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })
  })

  test('manager can create a project', async ({ managerPage: page }) => {
    await page.goto('/projects')
    await page.getByRole('button', { name: /new project/i }).click()
    await page.getByRole('dialog').waitFor()

    const titleInput = page.getByLabel(/title/i).or(page.getByPlaceholder(/title/i)).first()
    await titleInput.fill(UNIQUE_TITLE)

    // Pick a status
    const statusSelect = page.getByLabel(/status/i).first()
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption({ index: 1 })
    }

    await page.getByRole('button', { name: /create|save/i }).click()
    await page.getByRole('dialog').waitFor({ state: 'hidden', timeout: 8_000 })

    // New project should appear
    await expect(page.getByText(UNIQUE_TITLE)).toBeVisible({ timeout: 8_000 })
  })

  test('project detail page loads', async ({ authedPage: page }) => {
    await page.goto('/projects')
    await expect(page.getByRole('heading', { name: /projects/i })).toBeVisible()
    const firstRow = page.getByRole('link', { name: /chevron|›|arrow/i }).first()
      .or(page.locator('tbody tr').first().getByRole('link'))
    if (await firstRow.count() > 0) {
      await firstRow.click()
      await page.waitForURL(/\/projects\//, { timeout: 8_000 })
      await expect(page.getByRole('tablist')).toBeVisible({ timeout: 8_000 })
    }
  })

  test('employee does not see New Project button', async ({ employeePage: page }) => {
    await page.goto('/projects')
    await expect(page.getByRole('button', { name: /new project/i })).not.toBeVisible({ timeout: 5_000 })
  })
})
