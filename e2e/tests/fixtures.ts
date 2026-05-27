import { test as base, Page } from '@playwright/test'

export type TestUser = {
  email: string
  password: string
  role: 'admin' | 'manager' | 'employee'
}

// These credentials must exist in your test Supabase project.
// Override via E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD etc. env vars.
export const USERS: Record<string, TestUser> = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? 'admin@test.skillmark.dev',
    password: process.env.E2E_ADMIN_PASSWORD ?? 'Test1234!',
    role: 'admin',
  },
  manager: {
    email: process.env.E2E_MANAGER_EMAIL ?? 'manager@test.skillmark.dev',
    password: process.env.E2E_MANAGER_PASSWORD ?? 'Test1234!',
    role: 'manager',
  },
  employee: {
    email: process.env.E2E_EMPLOYEE_EMAIL ?? 'employee@test.skillmark.dev',
    password: process.env.E2E_EMPLOYEE_PASSWORD ?? 'Test1234!',
    role: 'employee',
  },
}

export async function loginAs(page: Page, user: TestUser) {
  await page.goto('/login')
  await page.getByPlaceholder(/email/i).fill(user.email)
  await page.getByPlaceholder(/password/i).fill(user.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  // wait for redirect away from /login
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15_000 })
}

type Fixtures = {
  authedPage: Page
  managerPage: Page
  employeePage: Page
}

export const test = base.extend<Fixtures>({
  authedPage: async ({ page }, use) => {
    await loginAs(page, USERS.admin)
    await use(page)
  },
  managerPage: async ({ page }, use) => {
    await loginAs(page, USERS.manager)
    await use(page)
  },
  employeePage: async ({ page }, use) => {
    await loginAs(page, USERS.employee)
    await use(page)
  },
})

export { expect } from '@playwright/test'
