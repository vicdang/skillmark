import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface Props {
  children: React.ReactNode
}

export function AuthGuard({ children }: Props) {
  const user = useAuthStore((s) => s.user)
  const bootstrapped = useAuthStore((s) => s.bootstrapped)
  if (!bootstrapped) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
