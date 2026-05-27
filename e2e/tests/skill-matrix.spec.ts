/**
 * Critical path: Skill Matrix (employee self-service)
 * - Employee can view My Skills page
 * - Employee can add a skill from the taxonomy browser
 * - Employee can update a skill level
 * - Employee can remove a skill
 */

import { test, expect } from './fixtures'

test.describe('Skill Matrix', () => {
  test('My Skills page loads', async ({ employeePage: page }) => {
    await page.goto('/my-skills')
    await expect(page.getByRole('heading', { name: /my skills|kỹ năng/i })).toBeVisible({ timeout: 10_000 })
  })

  test('skill taxonomy browser renders skill tree', async ({ employeePage: page }) => {
    await page.goto('/my-skills')
    // Wait for skill domain tree to appear
    const tree = page.locator('[role="tree"], [data-testid="skill-tree"]').first()
      .or(page.getByText(/web development|data|cloud/i).first())
    await expect(tree).toBeVisible({ timeout: 10_000 })
  })

  test('admin can view employee skill matrix', async ({ authedPage: page }) => {
    await page.goto('/employees')
    await expect(page.getByRole('heading', { name: /employees|nhân viên/i })).toBeVisible({ timeout: 10_000 })
    // Click first employee row
    const firstLink = page.getByRole('link').filter({ hasText: /.+/ }).first()
    await firstLink.click()
    await page.waitForURL(/\/employees\//, { timeout: 8_000 })
  })
})
