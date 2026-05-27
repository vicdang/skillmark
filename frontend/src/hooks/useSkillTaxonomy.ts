import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { SkillDomain, SkillCategory, Skill } from '@/types'

export interface TaxonomyData {
  domains: SkillDomain[]
  categories: SkillCategory[]
  skills: Skill[]
}

export function useSkillTaxonomy() {
  const [data, setData] = useState<TaxonomyData>({ domains: [], categories: [], skills: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetch = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get<TaxonomyData>('/skills/taxonomy')
      setData(res.data)
    } catch {
      setError('Failed to load skills')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { ...data, loading, error, refetch: fetch }
}
