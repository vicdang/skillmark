import { RouterProvider } from 'react-router-dom'
import { Suspense } from 'react'
import { router } from '@/routes'
import { useAuth } from '@/hooks/useAuth'
import '@/styles/globals.css'
import '@/lib/i18n'

function AppInner() {
  useAuth()
  return <RouterProvider router={router} />
}

export function App() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading…</div>}>
      <AppInner />
    </Suspense>
  )
}
