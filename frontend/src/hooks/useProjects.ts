import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Project, ProjectStatus } from '@/types'

export interface ProjectFilters {
  status?: ProjectStatus | 'all'
  domain?: string
  project_type?: string
  query?: string
}

export function useProjects(filters: ProjectFilters = {}) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (filters.status && filters.status !== 'all') params.status_filter = filters.status
      if (filters.domain && filters.domain !== 'all') params.domain = filters.domain
      const res = await api.get<Project[]>('/projects', { params })
      setProjects(res.data)
    } catch {
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [filters.status, filters.domain])

  useEffect(() => { fetch() }, [fetch])

  const createProject = async (data: Omit<Project, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'status' | 'is_archived' | 'client_region'>) => {
    const res = await api.post<Project>('/projects', data)
    setProjects((prev) => [res.data, ...prev])
    return res.data
  }

  const updateProject = async (id: string, data: Partial<Project>) => {
    const res = await api.put<Project>(`/projects/${id}`, data)
    setProjects((prev) => prev.map((p) => (p.id === id ? res.data : p)))
    return res.data
  }

  const deleteProject = async (id: string) => {
    await api.delete(`/projects/${id}`)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  const bulkAction = async (ids: string[], action: 'archive' | 'delete' | 'status', status?: ProjectStatus) => {
    await api.post('/projects/bulk-action', { ids, action, status })
    if (action === 'archive' || action === 'delete') {
      setProjects((prev) => prev.filter((p) => !ids.includes(p.id)))
    } else if (action === 'status' && status) {
      setProjects((prev) => prev.map((p) => ids.includes(p.id) ? { ...p, status } : p))
    }
  }

  const uploadRfp = async (projectId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    const res = await api.post<{ status: string; url: string }>(`/projects/${projectId}/upload-rfp`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    })
    return res.data
  }

  const filtered = projects.filter((p) => {
    if (!filters.query) return true
    const q = filters.query.toLowerCase()
    return (
      p.title.toLowerCase().includes(q) ||
      (p.client_name ?? '').toLowerCase().includes(q) ||
      (p.domain ?? '').toLowerCase().includes(q)
    )
  })

  return { projects: filtered, loading, error, refetch: fetch, createProject, updateProject, deleteProject, bulkAction, uploadRfp }
}

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get<Project>(`/projects/${id}`)
      .then((r) => setProject(r.data))
      .catch(() => setProject(null))
      .finally(() => setLoading(false))
  }, [id])

  const update = async (data: Partial<Project>) => {
    if (!id) return
    const res = await api.put<Project>(`/projects/${id}`, data)
    setProject(res.data)
    return res.data
  }

  return { project, loading, update }
}
