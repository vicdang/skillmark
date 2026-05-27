import { useState } from 'react'
import { api } from '@/lib/api'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'manager' | 'employee' | 'guest' | 'viewer'
  avatar_url?: string
  is_active: boolean
  created_at?: string
}

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await api.get<UserProfile[]>('/users')
      setUsers(res.data || [])
    } finally {
      setLoading(false)
    }
  }

  const updateRole = async (userId: string, role: string) => {
    const res = await api.put<UserProfile>(`/users/${userId}`, { role })
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: res.data.role } : u))
    )
    return res.data
  }

  return { users, loading, fetch, updateRole }
}
