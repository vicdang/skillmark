import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { api } from '@/lib/api'
import type { User, Notification } from '@/types'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped)
  const { theme } = useThemeStore()
  const { setNotifications, addNotification } = useNotificationStore()
  const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const bootstrappedRef = useRef(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const { data } = await api.get<Notification[]>('/notifications')
        setNotifications(data)
      } catch {
        // non-fatal
      }
    }

    const subscribeRealtime = (userId: string) => {
      if (realtimeRef.current) return
      const channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            addNotification(payload.new as Notification)
          }
        )
        .subscribe()
      realtimeRef.current = channel
    }

    const resolveProfile = async (retries = 3): Promise<User | null> => {
      for (let i = 0; i < retries; i++) {
        try {
          const { data } = await api.get<User>('/auth/me')
          return data
        } catch {
          if (i < retries - 1) await new Promise((r) => setTimeout(r, 800))
        }
      }
      try {
        await api.post('/auth/upsert-profile')
        const { data } = await api.get<User>('/auth/me')
        return data
      } catch {
        return null
      }
    }

    const markBootstrapped = () => {
      if (!bootstrappedRef.current) {
        bootstrappedRef.current = true
        setBootstrapped()
      }
    }

    // Primary bootstrap: check existing session immediately
    const bootstrap = async () => {
      // If user is already in store (from localStorage), mark as bootstrapped immediately
      if (user) {
        markBootstrapped()
        // Still validate and refresh user data in background
        try {
          const profile = await resolveProfile()
          if (profile) {
            setUser(profile)
            await loadNotifications()
            subscribeRealtime(profile.id)
          }
        } catch (e) {
          console.error('[useAuth] background profile refresh error', e)
        }
        return
      }

      try {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          const profile = await resolveProfile()
          if (profile) {
            setUser(profile)
            await loadNotifications()
            subscribeRealtime(profile.id)
          } else {
            setUser(null)
          }
        }
      } catch (e) {
        console.error('[useAuth] bootstrap error', e)
      } finally {
        markBootstrapped()
      }
    }

    bootstrap()

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const profile = await resolveProfile()
        if (profile) {
          setUser(profile)
          try {
            const { data: notifs } = await api.get<Notification[]>('/notifications')
            setNotifications(notifs)
          } catch { /* non-fatal */ }
          subscribeRealtime(profile.id)
        }
        markBootstrapped()
      }

      if (event === 'SIGNED_OUT') {
        setUser(null)
        setNotifications([])
        if (realtimeRef.current) {
          supabase.removeChannel(realtimeRef.current)
          realtimeRef.current = null
        }
      }
    })

    return () => {
      listener.subscription.unsubscribe()
      if (realtimeRef.current) {
        supabase.removeChannel(realtimeRef.current)
        realtimeRef.current = null
      }
    }
  }, [setUser, setBootstrapped, setNotifications, addNotification])
}
