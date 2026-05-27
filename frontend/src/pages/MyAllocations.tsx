import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, X, Calendar, Briefcase } from 'lucide-react'
import { useAllocations } from '@/hooks/useMatching'

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending:   { bg: '#f59e0b15', text: '#fbbf24', label: 'Pending' },
  confirmed: { bg: '#10b98115', text: '#34d399', label: 'Confirmed' },
  rejected:  { bg: '#ef444415', text: '#f87171', label: 'Rejected' },
}

export function MyAllocations() {
  const { t } = useTranslation()
  const { allocations, loading, fetchMine, confirm, reject } = useAllocations()

  useEffect(() => { fetchMine() }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>My Allocations</h1>

      {loading ? (
        <p style={{ fontSize: 12, color: '#4b5563' }}>{t('common.loading')}</p>
      ) : allocations.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: 192, borderRadius: 10, border: '1px dashed #1a2538', textAlign: 'center',
        }}>
          <Briefcase size={28} style={{ color: '#374151', marginBottom: 8 }} />
          <p style={{ fontSize: 12, color: '#4b5563' }}>No allocations yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {allocations.map((a) => {
            const st = STATUS_STYLES[a.status] ?? STATUS_STYLES.pending
            return (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: '#111b2e', border: '1px solid #1a2538', borderRadius: 10, padding: '14px 18px',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: '#1a2538', color: '#4b5563',
                }}>
                  <Briefcase size={15} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.projects?.title ?? 'Project'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, fontSize: 11, color: '#4b5563', fontFamily: "'JetBrains Mono', monospace" }}>
                    <Calendar size={11} />
                    <span>{a.month.slice(0, 7)}</span>
                    <span>·</span>
                    <span>{a.allocation_percentage}% effort</span>
                  </div>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '2px 10px', borderRadius: 20,
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                  background: st.bg, color: st.text,
                }}>{st.label}</span>
                {a.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => confirm(a.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, border: '1px solid #10b98140', background: '#10b98110', color: '#34d399', cursor: 'pointer' }}
                    >
                      <Check size={12} />Confirm
                    </button>
                    <button
                      onClick={() => reject(a.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, border: '1px solid #ef444440', background: '#ef444410', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <X size={12} />Reject
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
