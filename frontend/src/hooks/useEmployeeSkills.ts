import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { EmployeeSkill } from '@/types'

export function useEmployeeSkills(userId: string | undefined) {
  const [skills, setSkills] = useState<EmployeeSkill[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError('')
    try {
      const res = await api.get<EmployeeSkill[]>(`/users/${userId}/skills`)
      setSkills(res.data)
    } catch {
      setError('Failed to load skills')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  const addSkill = async (payload: { skill_id: string; level: number; years_experience?: number; evidence_url?: string; evidence_note?: string }) => {
    const res = await api.post<EmployeeSkill>('/my/skills', payload)
    setSkills((prev) => [...prev, res.data])
    return res.data
  }

  const updateSkill = async (id: string, payload: { level?: number; years_experience?: number; evidence_url?: string; evidence_note?: string }) => {
    const res = await api.put<EmployeeSkill>(`/my/skills/${id}`, payload)
    setSkills((prev) => prev.map((s) => (s.id === id ? res.data : s)))
    return res.data
  }

  const removeSkill = async (id: string) => {
    await api.delete(`/my/skills/${id}`)
    setSkills((prev) => prev.filter((s) => s.id !== id))
  }

  return { skills, loading, error, refetch: fetch, addSkill, updateSkill, removeSkill }
}
