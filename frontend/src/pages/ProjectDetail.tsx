import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Pencil, Upload, ExternalLink, Calendar, Users, Globe, Cpu, Search, Plus, X } from 'lucide-react'
import { useProject } from '@/hooks/useProjects'
import { useAuthStore } from '@/stores/authStore'
import { useWishList, useAllocations } from '@/hooks/useMatching'
import { StatusBadge } from '@/components/projects/StatusBadge'
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog'
import { RfpUploadZone } from '@/components/projects/RfpUploadZone'
import { AllocateDialog } from '@/components/projects/AllocateDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { api } from '@/lib/api'
import { getInitials } from '@/lib/utils'

const ALLOC_STATUS_VARIANT = {
  pending: 'warning' as const,
  confirmed: 'success' as const,
  rejected: 'secondary' as const,
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const { project, loading, update } = useProject(id)
  const { wishList, loading: wlLoading, fetch: fetchWL, remove: removeWL } = useWishList(id!)
  const { allocations, loading: allocLoading, fetch: fetchAlloc, create: createAlloc } = useAllocations(id)

  const [showEdit, setShowEdit] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showRfpUpload, setShowRfpUpload] = useState(false)
  const [showAllocate, setShowAllocate] = useState(false)
  const [extracting, setExtracting] = useState(false)

  const canManage = user?.role === 'admin' || user?.role === 'manager'

  useEffect(() => {
    if (id) {
      fetchWL()
      fetchAlloc()
    }
  }, [id])

  useEffect(() => {
    if (!id || !project?.rfp_file_url || project?.rfp_extracted_data) {
      setExtracting(false)
      return
    }

    setExtracting(true)
    let mounted = true
    let attempt = 0
    const maxAttempts = 30 // 2.5 minutes max (5s * 30)

    const pollExtraction = async () => {
      if (!mounted || attempt >= maxAttempts) return
      attempt++

      try {
        const res = await api.get(`/projects/${id}`)
        if (res.data.rfp_extracted_data) {
          if (mounted) {
            await update(res.data)
            setExtracting(false)
          }
          return
        }
      } catch {
        // continue polling on error
      }

      if (mounted && attempt < maxAttempts) {
        setTimeout(pollExtraction, 5000) // Poll every 5 seconds
      } else if (mounted && attempt >= maxAttempts) {
        setExtracting(false)
      }
    }

    pollExtraction()

    return () => {
      mounted = false
    }
  }, [id])

  const handleUpload = async (file: File) => {
    if (!id) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      await api.post(`/projects/${id}/upload-rfp`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const res = await api.get(`/projects/${id}`)
      await update(res.data as any)
      setShowRfpUpload(false)
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <p className="text-muted-foreground">{t('common.loading')}</p>
  if (!project) return <p className="text-muted-foreground">{t('common.noData')}</p>

  const rfp = project.rfp_extracted_data as Record<string, unknown> | undefined

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/projects" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={project.status} />
              {project.domain && <Badge variant="outline">{project.domain}</Badge>}
              {project.project_type && <Badge variant="outline">{project.project_type}</Badge>}
            </div>
          </div>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Link to={`/projects/${id}/query`}>
              <Button size="sm" variant="outline">
                <Search size={13} className="mr-1" />
                {t('projects.queryResources')}
              </Button>
            </Link>
            <Button size="sm" variant="outline" onClick={() => setShowRfpUpload((v) => !v)}>
              <Upload size={13} className="mr-1" />
              {t('projects.uploadRfp')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowEdit(true)}>
              <Pencil size={13} className="mr-1" />
              {t('common.edit')}
            </Button>
          </div>
        )}
      </div>

      {/* RFP upload zone */}
      {showRfpUpload && (
        <div className="rounded-lg border border-border p-4">
          <h3 className="mb-3 text-sm font-semibold">Upload RFP Document</h3>
          <RfpUploadZone onUpload={handleUpload} uploading={uploading} existingUrl={project.rfp_file_url} />
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wishlist">Wish List {wishList.length > 0 && `(${wishList.length})`}</TabsTrigger>
          <TabsTrigger value="allocations">Allocations {allocations.length > 0 && `(${allocations.length})`}</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              {project.description && (
                <section>
                  <h2 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Description</h2>
                  <p className="text-sm leading-relaxed">{project.description}</p>
                </section>
              )}

              {project.tech_stack && project.tech_stack.length > 0 && (
                <section>
                  <h2 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Cpu size={13} />Tech Stack
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map((tech) => (
                      <Badge key={tech} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                </section>
              )}

              {rfp && (
                <section>
                  <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">AI-Extracted RFP Data</h2>
                  <RfpExtractedView data={rfp} />
                </section>
              )}

              {project.rfp_file_url && !rfp && (
                <section className="rounded-lg border border-dashed border-border p-6 text-center">
                  {extracting ? (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <div className="inline-flex h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Extracting RFP data...</p>
                        <p className="mt-1 text-xs text-muted-foreground">Claude AI is analyzing your document</p>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div className="h-full w-1/3 animate-pulse bg-primary" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">RFP uploaded</p>
                      <a href={project.rfp_file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                        <ExternalLink size={13} />View document
                      </a>
                    </div>
                  )}
                </section>
              )}
            </div>

            <div className="space-y-4">
              <InfoCard>
                <InfoRow icon={<Globe size={14} />} label="Client" value={project.client_name} />
                <InfoRow icon={<Globe size={14} />} label="Country" value={project.client_country} />
                <InfoRow icon={<Globe size={14} />} label="Region" value={project.client_region} />
              </InfoCard>
              <InfoCard>
                <InfoRow icon={<Calendar size={14} />} label="Kick-off" value={project.kick_off_date} />
                <InfoRow icon={<Calendar size={14} />} label="End Date" value={project.end_date} />
              </InfoCard>
              <InfoCard>
                <InfoRow icon={<Users size={14} />} label="Team size" value={project.team_size_required ? `${project.team_size_required} people` : undefined} />
                <InfoRow icon={<Users size={14} />} label="Budget" value={project.budget_range} />
              </InfoCard>
            </div>
          </div>
        </TabsContent>

        {/* Wish List tab */}
        <TabsContent value="wishlist" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{wishList.length} candidate{wishList.length !== 1 ? 's' : ''} shortlisted</p>
              {canManage && (
                <Link to={`/projects/${id}/query`}>
                  <Button size="sm" variant="outline">
                    <Search size={13} className="mr-1" />Add from Query
                  </Button>
                </Link>
              )}
            </div>

            {wlLoading ? (
              <p className="text-muted-foreground">{t('common.loading')}</p>
            ) : wishList.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
                <p className="text-sm text-muted-foreground">No candidates shortlisted yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {wishList.map((w) => (
                  <div key={w.id} className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={w.users?.avatar_url} />
                      <AvatarFallback className="text-xs">{getInitials(w.users?.full_name ?? '?')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{w.users?.full_name ?? w.user_id}</p>
                      {w.users?.job_title && <p className="text-xs text-muted-foreground">{w.users.job_title}</p>}
                      {w.ai_explanation && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{w.ai_explanation}</p>}
                    </div>
                    {w.match_score != null && (
                      <Badge variant="outline" className="shrink-0">{w.match_score}% match</Badge>
                    )}
                    {canManage && (
                      <button
                        onClick={() => removeWL(w.user_id)}
                        className="text-muted-foreground hover:text-destructive"
                        title="Remove from wish list"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Allocations tab */}
        <TabsContent value="allocations" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{allocations.length} allocation{allocations.length !== 1 ? 's' : ''}</p>
              {canManage && (
                <Button size="sm" onClick={() => setShowAllocate(true)}>
                  <Plus size={13} className="mr-1" />Allocate Resource
                </Button>
              )}
            </div>

            {allocLoading ? (
              <p className="text-muted-foreground">{t('common.loading')}</p>
            ) : allocations.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
                <p className="text-sm text-muted-foreground">No allocations yet.</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Employee</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Month</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Allocation</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {allocations.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={a.users?.avatar_url} />
                              <AvatarFallback className="text-xs">{getInitials(a.users?.full_name ?? '?')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{a.users?.full_name ?? a.user_id}</p>
                              {a.users?.department && <p className="text-xs text-muted-foreground">{a.users.department}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{a.month.slice(0, 7)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${a.allocation_percentage}%` }} />
                            </div>
                            <span className="text-xs">{a.allocation_percentage}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={ALLOC_STATUS_VARIANT[a.status]} className="capitalize">{a.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {showEdit && (
        <ProjectFormDialog
          project={project}
          onSubmit={async (data) => { await update(data) }}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showAllocate && id && (
        <AllocateDialog
          projectId={id}
          onSubmit={async (data) => { await createAlloc(data) }}
          onClose={() => setShowAllocate(false)}
        />
      )}
    </div>
  )
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-border bg-card p-4 space-y-3">{children}</div>
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number | null }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

function RfpExtractedView({ data }: { data: Record<string, unknown> }) {
  const FIELD_LABELS: Record<string, string> = {
    project_name: 'Project Name',
    client_name: 'Client',
    client_country: 'Country',
    project_type: 'Type',
    domain: 'Domain',
    tech_stack: 'Tech Stack',
    required_roles: 'Required Roles',
    team_size: 'Team Size',
    kick_off_date: 'Kick-off Date',
    end_date: 'End Date',
    budget_range: 'Budget',
    compliance_requirements: 'Compliance',
    deliverables: 'Deliverables',
    summary: 'Summary',
  }

  return (
    <div className="rounded-lg border border-border bg-card divide-y divide-border">
      {Object.entries(data).map(([key, value]) => {
        if (value === null || value === undefined || value === '') return null
        const label = FIELD_LABELS[key] ?? key.replace(/_/g, ' ')
        const display = Array.isArray(value) ? value.join(', ') : String(value)
        return (
          <div key={key} className="grid grid-cols-3 gap-2 px-4 py-3">
            <span className="text-xs text-muted-foreground capitalize">{label}</span>
            <span className="col-span-2 text-sm">{display}</span>
          </div>
        )
      })}
    </div>
  )
}
