import { useTranslation } from 'react-i18next'
import {
  Users, FolderKanban, TrendingUp, AlertTriangle, Sparkles, Download,
  BarChart2, Cpu, CalendarClock,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import { useAuthStore } from '@/stores/authStore'
import { useDashboard } from '@/hooks/useDashboard'
import { SENIORITY_LABELS } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  draft: '#64748b',
  review: '#60a5fa',
  approved: '#fbbf24',
  in_progress: '#818cf8',
  completed: '#34d399',
}

const CHART_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#fb923c', '#a3e635']

const tooltipStyle = {
  backgroundColor: '#111b2e',
  border: '1px solid #1a2538',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: 12,
}

const axisStyle = { fill: '#6b7280', fontSize: 10 }

export function Dashboard() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const {
    overview, workforce, skillDist, skillGaps, trends, availability, predictions, loading,
  } = useDashboard()

  const statCards = [
    { label: t('dashboard.totalEmployees'), value: overview?.total_employees, icon: <Users size={18} />, accent: '#3b82f6', bg: '#3b82f610' },
    { label: t('dashboard.activeProjects'), value: overview?.active_projects, icon: <FolderKanban size={18} />, accent: '#818cf8', bg: '#818cf810' },
    { label: 'Skill Gaps', value: skillGaps.length, icon: <AlertTriangle size={18} />, accent: '#f59e0b', bg: '#f59e0b10' },
    { label: 'Avg Skill Level', value: workforce?.avg_skill_level ? `${workforce.avg_skill_level}/5` : '—', icon: <TrendingUp size={18} />, accent: '#10b981', bg: '#10b98110' },
  ]

  const projectPieData = overview?.projects_by_status
    ? Object.entries(overview.projects_by_status).map(([k, v]) => ({ name: t(`projects.status.${k}`), value: v, color: STATUS_COLORS[k] ?? '#64748b' }))
    : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>{t('dashboard.overview')}</h1>
          <p style={{ fontSize: 12, color: '#4b5563', marginTop: 2 }}>Welcome back, {user?.full_name}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ExportBtn label="Excel" url="/api/v1/dashboard/export/excel" />
          <ExportBtn label="PDF" url="/api/v1/dashboard/export/pdf" />
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {statCards.map((s) => (
          <div key={s.label} style={{
            background: '#111b2e',
            border: '1px solid #1a2538',
            borderRadius: 10,
            padding: '18px 20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 8,
                background: s.bg,
                color: s.accent,
              }}>{s.icon}</span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>
              {loading ? '—' : (s.value ?? '—')}
            </p>
          </div>
        ))}
      </div>

      {/* Row 1: charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <Card title="Projects by Status" icon={<FolderKanban size={13} />}>
          {projectPieData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={projectPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} labelLine={false} fontSize={11}>
                  {projectPieData.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Availability This Month" icon={<CalendarClock size={13} />}>
          {availability.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={availability} barCategoryGap="30%">
                <XAxis dataKey="range" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#3b82f608' }} />
                <Bar dataKey="count" name="Employees" radius={[4, 4, 0, 0]}>
                  {availability.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="By Department" icon={<Users size={13} />}>
          {!workforce?.by_department?.length ? <Empty /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={workforce.by_department.slice(0, 8)} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" allowDecimals={false} tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={90} tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#3b82f608' }} />
                <Bar dataKey="count" name="Employees" radius={[0, 4, 4, 0]}>
                  {(workforce.by_department || []).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Row 2: Top skills + Skill gaps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title="Top Skills" icon={<BarChart2 size={13} />}>
          {!skillDist?.top_skills?.length ? <Empty /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={skillDist.top_skills.slice(0, 10)} layout="vertical" margin={{ left: 12 }}>
                <XAxis type="number" allowDecimals={false} tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={100} tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: '#3b82f608' }}
                  formatter={(value, _name, props) => [
                    `${value} employees · avg ${SENIORITY_LABELS[Math.round(props.payload.avg_level)] ?? props.payload.avg_level}`,
                    'Skill',
                  ]}
                />
                <Bar dataKey="count" name="Employees" radius={[0, 4, 4, 0]}>
                  {(skillDist.top_skills || []).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Skill Gaps" icon={<AlertTriangle size={13} />}>
          {skillGaps.length === 0 ? (
            <div style={{ display: 'flex', height: 192, alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#4b5563' }}>
              No skill gaps detected in active projects.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 224, paddingRight: 4 }}>
              {skillGaps.map((g) => (
                <div key={g.skill} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 112, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: '#94a3b8' }}>{g.skill}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 2, height: 6, borderRadius: 3, overflow: 'hidden', background: '#1a2538' }}>
                      <div style={{ background: '#10b981', height: '100%', width: `${Math.min(100, (g.supply / Math.max(g.demand, 1)) * 100)}%`, borderRadius: 3 }} title={`Supply: ${g.supply}`} />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>-{g.gap}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Trending skills */}
      {trends.length > 0 && (
        <Card title="Trending Skills (last 12 months)" icon={<TrendingUp size={13} />}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart margin={{ right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2538" />
              <XAxis dataKey="month" type="category" allowDuplicatedCategory={false} tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              {trends.slice(0, 5).map((series, i) => (
                <Line
                  key={series.skill}
                  data={series.series}
                  type="monotone"
                  dataKey="count"
                  name={series.skill}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  dot={false}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* AI Forecast */}
      <div style={{ background: '#111b2e', border: '1px solid #1a2538', borderRadius: 10, padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Sparkles size={14} style={{ color: '#818cf8' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Skill Forecast</span>
        </div>
        {loading ? (
          <p style={{ fontSize: 12, color: '#4b5563' }}>Generating forecast...</p>
        ) : predictions.length === 0 ? (
          <p style={{ fontSize: 12, color: '#4b5563' }}>No predictions available — add projects and skills to generate a forecast.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {predictions.map((p, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#818cf815', color: '#818cf8',
                  fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1,
                }}>{i + 1}</span>
                <span style={{ color: '#94a3b8' }}>{p}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Skills by Domain */}
      {skillDist?.by_domain && skillDist.by_domain.length > 0 && (
        <Card title="Skills by Domain" icon={<Cpu size={13} />}>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
            {skillDist.by_domain.map((d, i) => {
              const maxCount = Math.max(...skillDist.by_domain.map((x) => x.count))
              const intensity = maxCount > 0 ? d.count / maxCount : 0
              return (
                <div key={d.domain} style={{
                  borderRadius: 8,
                  padding: '12px 14px',
                  textAlign: 'center',
                  background: `rgba(${50 + i * 15}, ${80 + i * 10}, ${180 - i * 8}, ${0.08 + intensity * 0.12})`,
                  border: `1px solid rgba(${50 + i * 15}, ${80 + i * 10}, ${180 - i * 8}, ${0.15 + intensity * 0.2})`,
                }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.domain}</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace", margin: '4px 0 2px' }}>{d.count}</p>
                  <p style={{ fontSize: 10, color: '#4b5563' }}>entries</p>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: '#111b2e', border: '1px solid #1a2538', borderRadius: 10, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14, fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {icon}{title}
      </div>
      {children}
    </div>
  )
}

function ExportBtn({ label, url }: { label: string; url: string }) {
  return (
    <button
      onClick={() => window.open(url, '_blank')}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 12px', borderRadius: 7,
        fontSize: 12, fontWeight: 600,
        border: '1px solid #1a2538',
        background: 'transparent', color: '#6b7280', cursor: 'pointer',
      }}
    >
      <Download size={12} />{label}
    </button>
  )
}

function Empty() {
  return <div style={{ display: 'flex', height: 192, alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#374151' }}>No data yet.</div>
}
