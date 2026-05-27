import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export interface Overview {
  total_employees: number
  total_projects: number
  active_projects: number
  total_skills_logged: number
  projects_by_status: Record<string, number>
}

export interface WorkforceData {
  by_department: { name: string; count: number }[]
  by_role: { name: string; count: number }[]
  avg_skill_level: number
}

export interface SkillDistribution {
  top_skills: { skill_id: string; name: string; domain: string; count: number; avg_level: number }[]
  by_domain: { domain: string; count: number; employees: number }[]
}

export interface SkillGap {
  skill: string
  demand: number
  supply: number
  gap: number
}

export interface TrendSeries {
  skill: string
  total: number
  series: { month: string; count: number }[]
}

export interface AvailabilityBucket {
  range: string
  count: number
}

export function useDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [workforce, setWorkforce] = useState<WorkforceData | null>(null)
  const [skillDist, setSkillDist] = useState<SkillDistribution | null>(null)
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([])
  const [trends, setTrends] = useState<TrendSeries[]>([])
  const [availability, setAvailability] = useState<AvailabilityBucket[]>([])
  const [predictions, setPredictions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [ov, wf, sd, sg, tr, av, pred] = await Promise.allSettled([
          api.get<Overview>('/dashboard/overview'),
          api.get<WorkforceData>('/dashboard/workforce'),
          api.get<SkillDistribution>('/dashboard/skill-distribution'),
          api.get<{ gaps: SkillGap[] }>('/dashboard/skill-gaps'),
          api.get<{ series: TrendSeries[] }>('/dashboard/trends'),
          api.get<{ buckets: AvailabilityBucket[] }>('/dashboard/availability-overview'),
          api.get<{ predictions: string[] }>('/dashboard/predictions'),
        ])
        if (ov.status === 'fulfilled') setOverview(ov.value.data)
        if (wf.status === 'fulfilled') setWorkforce(wf.value.data)
        if (sd.status === 'fulfilled') setSkillDist(sd.value.data)
        if (sg.status === 'fulfilled') setSkillGaps(sg.value.data.gaps)
        if (tr.status === 'fulfilled') setTrends(tr.value.data.series)
        if (av.status === 'fulfilled') setAvailability(av.value.data.buckets)
        if (pred.status === 'fulfilled') setPredictions(pred.value.data.predictions)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { overview, workforce, skillDist, skillGaps, trends, availability, predictions, loading }
}
