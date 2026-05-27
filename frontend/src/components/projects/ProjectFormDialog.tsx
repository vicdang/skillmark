import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Project, ProjectStatus } from '@/types'

const DOMAINS = ['Web Development', 'Mobile', 'Data & AI', 'Cloud & DevOps', 'Security', 'Embedded', 'QA & Testing', 'Design', 'Other']
const PROJECT_TYPES = ['Fixed Price', 'Time & Material', 'Dedicated Team', 'Pilot', 'R&D']
const STATUSES: ProjectStatus[] = ['draft', 'review', 'approved', 'in_progress', 'completed']

interface Props {
  project?: Project
  onSubmit: (data: Partial<Project>) => Promise<void>
  onClose: () => void
}

export function ProjectFormDialog({ project, onSubmit, onClose }: Props) {
  const { t } = useTranslation()
  const isEdit = Boolean(project)

  const [title, setTitle] = useState(project?.title ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [clientName, setClientName] = useState(project?.client_name ?? '')
  const [clientCountry, setClientCountry] = useState(project?.client_country ?? '')
  const [domain, setDomain] = useState(project?.domain ?? '')
  const [projectType, setProjectType] = useState(project?.project_type ?? '')
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? 'draft')
  const [kickOffDate, setKickOffDate] = useState(project?.kick_off_date ?? '')
  const [endDate, setEndDate] = useState(project?.end_date ?? '')
  const [teamSize, setTeamSize] = useState(String(project?.team_size_required ?? ''))
  const [budgetRange, setBudgetRange] = useState(project?.budget_range ?? '')
  const [techStack, setTechStack] = useState((project?.tech_stack ?? []).join(', '))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError('')
    try {
      await onSubmit({
        title: title.trim(),
        description: description || undefined,
        client_name: clientName || undefined,
        client_country: clientCountry || undefined,
        domain: domain || undefined,
        project_type: projectType || undefined,
        status,
        kick_off_date: kickOffDate || undefined,
        end_date: endDate || undefined,
        team_size_required: teamSize ? parseInt(teamSize) : undefined,
        budget_range: budgetRange || undefined,
        tech_stack: techStack ? techStack.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      })
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Failed to save project. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('common.edit') : t('projects.newProject')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="clientName">Client Name</Label>
              <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Acme Corp" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="clientCountry">Client Country</Label>
              <Input id="clientCountry" value={clientCountry} onChange={(e) => setClientCountry(e.target.value)} placeholder="US" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Domain</Label>
              <Select value={domain || '_none'} onValueChange={(v) => setDomain(v === '_none' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">— None —</SelectItem>
                  {DOMAINS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Project Type</Label>
              <Select value={projectType || '_none'} onValueChange={(v) => setProjectType(v === '_none' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">— None —</SelectItem>
                  {PROJECT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isEdit && (
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{t(`projects.status.${s}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="kickOff">Kick-off Date</Label>
              <Input id="kickOff" type="date" value={kickOffDate} onChange={(e) => setKickOffDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="teamSize">Team Size Required</Label>
              <Input id="teamSize" type="number" min={1} max={200} value={teamSize} onChange={(e) => setTeamSize(e.target.value)} placeholder="5" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="budget">Budget Range</Label>
              <Input id="budget" value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)} placeholder="$50k–$100k" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="techStack">Tech Stack (comma-separated)</Label>
            <Input id="techStack" value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="React, Node.js, PostgreSQL" />
          </div>

          {error && (
            <div style={{ padding: '8px 12px', borderRadius: 7, background: '#ef444410', border: '1px solid #ef444430', fontSize: 12, color: '#ef4444' }}>
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={saving || !title.trim()}>{saving ? t('common.loading') : t('common.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
