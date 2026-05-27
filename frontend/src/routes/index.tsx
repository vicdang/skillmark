import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Login } from '@/pages/Login'
import { AuthGuard } from './AuthGuard'

function Lazy(factory: () => Promise<{ [key: string]: React.ComponentType }>, name: string) {
  const Component = lazy(() => factory().then((m) => ({ default: m[name] })))
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground text-sm">Loading...</div>}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: Lazy(() => import('@/pages/Dashboard'), 'Dashboard') },
      { path: 'profile', element: Lazy(() => import('@/pages/Profile'), 'Profile') },
      { path: 'my-skills', element: Lazy(() => import('@/pages/MySkills'), 'MySkills') },
      { path: 'employees', element: Lazy(() => import('@/pages/Employees'), 'Employees') },
      { path: 'employees/:id', element: Lazy(() => import('@/pages/EmployeeDetail'), 'EmployeeDetail') },
      { path: 'employees/:id/compare', element: Lazy(() => import('@/pages/Compare'), 'Compare') },
      { path: 'projects', element: Lazy(() => import('@/pages/Projects'), 'Projects') },
      { path: 'projects/:id', element: Lazy(() => import('@/pages/ProjectDetail'), 'ProjectDetail') },
      { path: 'projects/:id/query', element: Lazy(() => import('@/pages/QueryResources'), 'QueryResources') },
      { path: 'my-allocations', element: Lazy(() => import('@/pages/MyAllocations'), 'MyAllocations') },
      { path: 'notifications', element: Lazy(() => import('@/pages/Notifications'), 'Notifications') },
      {
        path: 'settings',
        element: Lazy(() => import('@/pages/Settings/SettingsLayout'), 'SettingsLayout'),
        children: [
          { index: true, element: <Navigate to="/settings/skills" replace /> },
          { path: 'skills', element: Lazy(() => import('@/pages/Settings/SkillTaxonomy'), 'SkillTaxonomy') },
          { path: 'ai', element: Lazy(() => import('@/pages/Settings/AiConfig'), 'AiConfig') },
          { path: 'notifications', element: Lazy(() => import('@/pages/Settings/NotificationPrefs'), 'NotificationPrefs') },
          { path: 'license', element: Lazy(() => import('@/pages/Settings/LicenseInfo'), 'LicenseInfo') },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
