import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, ChevronRight } from 'lucide-react'
import { useUsers } from '@/hooks/useUsers'
import { getInitials } from '@/lib/utils'
import type { Role } from '@/types'

const ROLE_COLORS: Record<Role, { bg: string; text: string }> = {
  admin:    { bg: '#3b82f615', text: '#60a5fa' },
  manager:  { bg: '#818cf815', text: '#a78bfa' },
  employee: { bg: '#10b98115', text: '#34d399' },
  guest:    { bg: '#f3f4f615', text: '#9ca3af' },
  viewer:   { bg: '#1a2538',   text: '#6b7280' },
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px 8px 36px',
  borderRadius: 7,
  fontSize: 12,
  border: '1px solid #1a2538',
  background: '#0c1322',
  color: '#e2e8f0',
  outline: 'none',
  fontFamily: "'JetBrains Mono', monospace",
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

export function Employees() {
  const { t } = useTranslation()
  const { users, loading } = useUsers()

  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')

  const filtered = users.filter((u) => {
    const matchesQuery =
      !query ||
      u.full_name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      (u.department ?? '').toLowerCase().includes(query.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesQuery && matchesRole
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>{t('nav.employees')}</h1>
        <span style={{ fontSize: 12, color: '#4b5563', fontFamily: "'JetBrains Mono', monospace" }}>
          {filtered.length} / {users.length}
        </span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
          <input
            style={inputStyle}
            placeholder={t('common.searchEmployees')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={(e) => { e.target.style.borderColor = '#3b82f6' }}
            onBlur={(e) => { e.target.style.borderColor = '#1a2538' }}
          />
        </div>
        <select
          style={selectStyle}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | 'all')}
        >
          <option value="all">{t('common.allRoles')}</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <p style={{ fontSize: 12, color: '#4b5563' }}>{t('common.loading')}</p>
      ) : filtered.length === 0 ? (
        <p style={{ fontSize: 12, color: '#4b5563' }}>{t('common.noData')}</p>
      ) : (
        <div style={{ background: '#111b2e', border: '1px solid #1a2538', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1a2538' }}>
                {['Employee', 'Role', 'Department', 'Job Title', ''].map((h) => (
                  <th key={h} style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#4b5563',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    background: '#0c132240',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => (
                <tr key={u.id} style={{
                  borderBottom: idx < filtered.length - 1 ? '1px solid #0f1724' : 'none',
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#3b82f606' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 7, flexShrink: 0,
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: '#fff',
                      }}>
                        {u.avatar_url
                          ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: 7, objectFit: 'cover' }} />
                          : getInitials(u.full_name)
                        }
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>{u.full_name}</p>
                        <p style={{ fontSize: 11, color: '#4b5563', margin: 0 }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '2px 8px', borderRadius: 20,
                      fontSize: 10, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: ROLE_COLORS[u.role]?.bg ?? '#1a2538',
                      color: ROLE_COLORS[u.role]?.text ?? '#6b7280',
                    }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{u.department ?? '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{u.job_title ?? '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <Link to={`/employees/${u.id}`} style={{ color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronRight size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
