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
  const profileResolvedRef = useRef(false)

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
          console.log('[resolveProfile] Success:', data)
          return data
        } catch (e: any) {
          const status = e.response?.status
          console.error(`[resolveProfile] Attempt ${i + 1} failed with status ${status}`, e.message)
          // 401 = invalid/expired token, 403 = account deactivated
          if (status === 401 || status === 403) {
            console.error('[resolveProfile] Auth error, returning null')
            return null
          }
          if (i < retries - 1) await new Promise((r) => setTimeout(r, 800))
        }
      }
      try {
        console.log('[resolveProfile] Trying upsert-profile...')
        await api.post('/auth/upsert-profile')
        const { data } = await api.get<User>('/auth/me')
        console.log('[resolveProfile] Success after upsert:', data)
        return data
      } catch (e: any) {
        console.error('[resolveProfile] Upsert failed:', e.message)
        // 401 = invalid/expired token, 403 = account deactivated
        const status = e.response?.status
        if (status === 401 || status === 403) {
          return null
        }
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
      console.log('[bootstrap] Starting...')
      markBootstrapped()

      // If user is already in store (from localStorage), use it
      if (user) {
        console.log('[bootstrap] User found in store:', user.email)
        profileResolvedRef.current = true
        subscribeRealtime(user.id)
        // Defer notifications loading to avoid auth issues
        setTimeout(() => {
          loadNotifications().catch(e => console.debug('[useAuth] notifications load error', e))
        }, 100)
        return
      }

      // No user in store, check Supabase session
      try {
        const { data } = await supabase.auth.getSession()
        console.log('[bootstrap] Session check:', data.session ? 'Found' : 'Not found')
        if (data.session) {
          console.log('[bootstrap] Resolving profile...')
          const profile = await resolveProfile()
          if (profile) {
            console.log('[bootstrap] Profile resolved, setting user')
            setUser(profile)
            subscribeRealtime(profile.id)
            await loadNotifications()
          } else {
            console.error('[bootstrap] Profile resolution returned null')
          }
        }
      } catch (e) {
        console.error('[useAuth] bootstrap error', e)
      }
    }

    bootstrap()

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[onAuthStateChange] Event:', event, 'Session:', session ? 'EXISTS' : 'NULL')
      if (event === 'SIGNED_IN' && session) {
        // Skip if profile already resolved to avoid duplicate resolution loops
        if (profileResolvedRef.current) {
          console.log('[onAuthStateChange] Profile already resolved, skipping duplicate')
          markBootstrapped()
          return
        }
        console.log('[onAuthStateChange] User signed in, resolving profile...')
        profileResolvedRef.current = true
        const profile = await resolveProfile()
        if (profile) {
          console.log('[onAuthStateChange] Profile resolved:', profile.email)
          setUser(profile)
          try {
            const { data: notifs } = await api.get<Notification[]>('/notifications')
            setNotifications(notifs)
          } catch { /* non-fatal */ }
          subscribeRealtime(profile.id)
        } else {
          console.error('[onAuthStateChange] Profile resolution failed, signing out')
          // Profile failed to load - could be deactivated or other error
          // Sign out and let login page handle the error
          profileResolvedRef.current = false
          await supabase.auth.signOut()
        }
        markBootstrapped()
      }

      if (event === 'SIGNED_OUT') {
        console.log('[onAuthStateChange] User signed out')
        profileResolvedRef.current = false
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
  }, [])
}
