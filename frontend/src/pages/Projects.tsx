import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Plus, ChevronRight, Trash2, Archive } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { useAuthStore } from '@/stores/authStore'
import { StatusBadge } from '@/components/projects/StatusBadge'
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog'
import type { Project, ProjectStatus } from '@/types'

const DOMAINS = ['all', 'Web Development', 'Mobile', 'Data & AI', 'Cloud & DevOps', 'Security', 'Embedded', 'QA & Testing', 'Design', 'Other']
const STATUSES: Array<ProjectStatus | 'all'> = ['all', 'draft', 'review', 'approved', 'in_progress', 'completed']

const inputStyle: React.CSSProperties = {
  padding: '8px 12px 8px 36px',
  borderRadius: 7,
  fontSize: 12,
  border: '1px solid #1a2538',
  background: '#0c1322',
  color: '#e2e8f0',
  outline: 'none',
  fontFamily: "'JetBrains Mono', monospace",
  width: '100%',
}

const selectStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 7,
  fontSize: 12,
  border: '1px solid #1a2538',
  background: '#0c1322',
  color: '#94a3b8',
  outline: 'none',
  fontFamily: "'DM Sans', sans-serif",
  cursor: 'pointer',
}

const btnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', borderRadius: 7,
  fontSize: 12, fontWeight: 700,
  border: 'none',
  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  color: '#fff', cursor: 'pointer',
}

export function Projects() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const canManage = user?.role === 'admin' || user?.role === 'manager'

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [domainFilter, setDomainFilter] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showCreate, setShowCreate] = useState(false)

  const { projects, loading, createProject, bulkAction } = useProjects({
    status: statusFilter,
    domain: domainFilter,
    query,
  })

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(selected.size === projects.length ? new Set() : new Set(projects.map((p) => p.id)))
  }

  const handleBulkArchive = async () => {
    if (selected.size === 0) return
    await bulkAction(Array.from(selected), 'archive')
    setSelected(new Set())
  }

  const handleBulkDelete = async () => {
    if (selected.size === 0) return
    if (!confirm(`Delete ${selected.size} project(s)? This cannot be undone.`)) return
    await bulkAction(Array.from(selected), 'delete')
    setSelected(new Set())
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>{t('projects.projects')}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#4b5563', fontFamily: "'JetBrains Mono', monospace" }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </span>
          {canManage && (
            <button style={btnStyle} onClick={() => setShowCreate(true)}>
              <Plus size={13} />{t('projects.newProject')}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
          <input
            style={inputStyle}
            placeholder={t('common.searchProjects')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={(e) => { e.target.style.borderColor = '#3b82f6' }}
            onBlur={(e) => { e.target.style.borderColor = '#1a2538' }}
          />
        </div>
        <select style={selectStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s === 'all' ? t('common.allStatuses') : t(`projects.status.${s}`)}</option>
          ))}
        </select>
        <select style={selectStyle} value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>
          {DOMAINS.map((d) => (
            <option key={d} value={d}>{d === 'all' ? t('common.allDomains') : d}</option>
          ))}
        </select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && canManage && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', borderRadius: 8,
          background: '#1a253880', border: '1px solid #1a2538',
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>{selected.size} selected</span>
          <button
            onClick={handleBulkArchive}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, fontSize: 12, border: '1px solid #1a2538', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
          >
            <Archive size={12} />Archive
          </button>
          <button
            onClick={handleBulkDelete}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, fontSize: 12, border: '1px solid #ef444430', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
          >
            <Trash2 size={12} />Delete
          </button>
          <button
            onClick={() => setSelected(new Set())}
            style={{ marginLeft: 'auto', fontSize: 11, color: '#4b5563', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p style={{ fontSize: 12, color: '#4b5563' }}>{t('common.loading')}</p>
      ) : projects.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: 192, borderRadius: 10, border: '1px dashed #1a2538', textAlign: 'center',
        }}>
          <p style={{ fontSize: 12, color: '#4b5563' }}>No projects found.</p>
          {canManage && (
            <button
              onClick={() => setShowCreate(true)}
              style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, fontSize: 12, border: '1px solid #1a2538', background: 'transparent', color: '#6b7280', cursor: 'pointer' }}
            >
              <Plus size={12} />Create first project
            </button>
          )}
        </div>
      ) : (
        <div style={{ background: '#111b2e', border: '1px solid #1a2538', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1a2538' }}>
                {canManage && (
                  <th style={{ padding: '10px 16px', width: 40, background: '#0c132240' }}>
                    <input
                      type="checkbox"
                      checked={selected.size === projects.length && projects.length > 0}
                      onChange={toggleAll}
                      style={{ accentColor: '#3b82f6' }}
                    />
                  </th>
                )}
                {['Project', 'Status', 'Client', 'Domain', 'Team', ''].map((h) => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontSize: 10, fontWeight: 700, color: '#4b5563',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    background: '#0c132240', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((project, idx) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  canManage={canManage}
                  selected={selected.has(project.id)}
                  onToggleSelect={() => toggleSelect(project.id)}
                  isLast={idx === projects.length - 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <ProjectFormDialog
          onSubmit={async (data) => { await createProject(data as Parameters<typeof createProject>[0]) }}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}

function ProjectRow({ project, canManage, selected, onToggleSelect, isLast }: {
  project: Project
  canManage: boolean
  selected: boolean
  onToggleSelect: () => void
  isLast: boolean
}) {
  return (
    <tr
      style={{ borderBottom: isLast ? 'none' : '1px solid #0f1724', transition: 'background 0.1s' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#3b82f606' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
    >
      {canManage && (
        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
          <input type="checkbox" checked={selected} onChange={onToggleSelect} style={{ accentColor: '#3b82f6' }} />
        </td>
      )}
      <td style={{ padding: '12px 16px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>{project.title}</p>
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {project.tech_stack.slice(0, 3).map((t) => (
              <span key={t} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, border: '1px solid #1a2538', color: '#6b7280', fontFamily: "'JetBrains Mono', monospace" }}>{t}</span>
            ))}
            {project.tech_stack.length > 3 && (
              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, border: '1px solid #1a2538', color: '#4b5563' }}>+{project.tech_stack.length - 3}</span>
            )}
          </div>
        )}
      </td>
      <td style={{ padding: '12px 16px' }}><StatusBadge status={project.status} /></td>
      <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>
        {project.client_name ?? '—'}
        {project.client_country && <span style={{ fontSize: 10, color: '#374151', marginLeft: 4 }}>({project.client_country})</span>}
      </td>
      <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{project.domain ?? '—'}</td>
      <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280', fontFamily: "'JetBrains Mono', monospace" }}>
        {project.team_size_required ? `${project.team_size_required}` : '—'}
      </td>
      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
        <Link to={`/projects/${project.id}`} style={{ color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronRight size={15} />
        </Link>
      </td>
    </tr>
  )
}
