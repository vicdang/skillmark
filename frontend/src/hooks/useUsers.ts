import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'manager' | 'employee' | 'guest' | 'viewer'
  avatar_url?: string
  job_title?: string
  department?: string
  is_active: boolean
  created_at?: string
}

export function useUser(userId?: string) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await api.get<UserProfile>(`/users/${userId}`)
        setUser(res.data)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [userId])

  return { user, loading }
}

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<UserProfile[]>('/users')
      setUsers(res.data || [])
    } finally {
      setLoading(false)
    }
  }, [])

  const updateRole = useCallback(async (userId: string, role: string) => {
    const res = await api.put<UserProfile>(`/users/${userId}`, { role })
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: res.data.role } : u))
    )
    return res.data
  }, [])

  const toggleActive = useCallback(async (userId: string, isActive: boolean) => {
    const res = await api.put<UserProfile>(`/users/${userId}`, { is_active: isActive })
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: res.data.is_active } : u))
    )
    return res.data
  }, [])

  return { users, loading, fetch, updateRole, toggleActive }
}
