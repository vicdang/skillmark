import { useState } from 'react'
import { api } from '@/lib/api'

export interface SkillDetail {
  skill_id: string
  required_level: number
  employee_level: number
  met: boolean
}

export interface MatchResult {
  employee_id: string
  employee: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
    job_title?: string
    department?: string
  }
  score: number
  breakdown: {
    skill_match: number
    seniority_fit: number
    availability: number
    domain_experience: number
  }
  skill_details: SkillDetail[]
  available_pct: number
}

export interface WishListEntry {
  id: string
  project_id: string
  user_id: string
  added_by: string
  match_score?: number
  ai_explanation?: string
  note?: string
  created_at?: string
  users?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
    job_title?: string
  }
}

export interface Allocation {
  id: string
  user_id: string
  project_id: string
  allocation_percentage: number
  month: string
  status: 'pending' | 'confirmed' | 'rejected'
  allocated_by?: string
  projects?: { title: string; status: string }
  users?: { full_name: string; email: string; avatar_url?: string; job_title?: string; department?: string }
}

export function useMatching(projectId: string) {
  const [results, setResults] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [ran, setRan] = useState(false)

  const runMatch = async () => {
    setLoading(true)
    try {
      const res = await api.post<MatchResult[]>(`/projects/${projectId}/match`)
      setResults(res.data)
      setRan(true)
    } finally {
      setLoading(false)
    }
  }

  const getExplanation = async (employeeId: string): Promise<string> => {
    const res = await api.get<{ explanation: string }>(`/projects/${projectId}/match/${employeeId}/explain`)
    return res.data.explanation
  }

  return { results, loading, ran, runMatch, getExplanation }
}

export function useWishList(projectId: string) {
  const [wishList, setWishList] = useState<WishListEntry[]>([])
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await api.get<WishListEntry[]>(`/projects/${projectId}/wishlist`)
      setWishList(res.data)
    } finally {
      setLoading(false)
    }
  }

  const add = async (employeeId: string, score?: number, explanation?: string, notes?: string) => {
    await api.post(`/projects/${projectId}/wishlist`, {
      employee_id: employeeId,
      score,
      explanation,
      notes,
    })
    await fetch()
  }

  const remove = async (employeeId: string) => {
    await api.delete(`/projects/${projectId}/wishlist/${employeeId}`)
    setWishList((prev) => prev.filter((w) => w.user_id !== employeeId))
  }

  return { wishList, loading, fetch, add, remove }
}

export function useAllocations(projectId?: string) {
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const res = await api.get<Allocation[]>(`/projects/${projectId}/allocations`)
      setAllocations(res.data)
    } finally {
      setLoading(false)
    }
  }

  const fetchMine = async () => {
    setLoading(true)
    try {
      const res = await api.get<Allocation[]>('/allocations')
      setAllocations(res.data)
    } finally {
      setLoading(false)
    }
  }

  const create = async (data: { user_id: string; project_id: string; allocation_percentage: number; month: string }) => {
    const res = await api.post<Allocation>('/allocations', data)
    setAllocations((prev) => [res.data, ...prev])
    return res.data
  }

  const confirm = async (id: string) => {
    await api.put(`/allocations/${id}/confirm`)
    setAllocations((prev) => prev.map((a) => a.id === id ? { ...a, status: 'confirmed' } : a))
  }

  const reject = async (id: string) => {
    await api.put(`/allocations/${id}/reject`)
    setAllocations((prev) => prev.map((a) => a.id === id ? { ...a, status: 'rejected' } : a))
  }

  return { allocations, loading, fetch, fetchMine, create, confirm, reject }
}
