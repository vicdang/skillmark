import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  bootstrapped: boolean
  setUser: (user: User | null) => void
  setBootstrapped: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      bootstrapped: false,
      setUser: (user) => set({ user }),
      setBootstrapped: () => set({ bootstrapped: true }),
    }),
    {
      name: 'skillmark-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
