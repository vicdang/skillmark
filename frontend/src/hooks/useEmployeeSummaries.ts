import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

export interface EmployeeSkillSummary {
  user_id: string
  total_skills: number
  avg_level: number
  domains: string[]
  strongest_domain: string | null
}

export function useEmployeeSummaries() {
  const [summaries, setSummaries] = useState<Record<string, EmployeeSkillSummary>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetch = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get<Record<string, EmployeeSkillSummary>>('/employees/summaries')
      setSummaries(res.data)
    } catch {
      setError('Failed to load skill summaries')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { summaries, loading, error }
}
