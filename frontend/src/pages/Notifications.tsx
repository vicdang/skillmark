import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Bell, Star, Briefcase, CheckCircle, XCircle, FileText, Zap, ChevronRight,
} from 'lucide-react'
import { useNotificationStore } from '@/stores/notificationStore'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { Notification } from '@/types'

const TYPE_ICON: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  added_to_wishlist:         { icon: <Star size={14} />,         color: '#fbbf24', bg: '#fbbf2415' },
  allocation_request:        { icon: <Briefcase size={14} />,    color: '#60a5fa', bg: '#60a5fa15' },
  allocation_confirmed:      { icon: <CheckCircle size={14} />,  color: '#34d399', bg: '#34d39915' },
  allocation_rejected:       { icon: <XCircle size={14} />,      color: '#ef4444', bg: '#ef444415' },
  rfp_extraction_complete:   { icon: <FileText size={14} />,     color: '#818cf8', bg: '#818cf815' },
  skill_updated:             { icon: <Zap size={14} />,          color: '#f59e0b', bg: '#f59e0b15' },
}

const defaultType = { icon: <Bell size={14} />, color: '#6b7280', bg: '#1a2538' }

export function Notifications() {
  const { t } = useTranslation()
  const { notifications, markRead, markAllRead } = useNotificationStore()

  const handleMarkRead = async (n: Notification) => {
    markRead(n.id)
    try { await api.put(`/notifications/${n.id}/read`) } catch { /* best-effort */ }
  }

  const handleMarkAllRead = async () => {
    markAllRead()
    try { await api.put('/notifications/read-all') } catch { /* best-effort */ }
  }

  const unread = notifications.filter((n) => !n.is_read)

  return (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>{t('notifications.notifications')}</h1>
          {unread.length > 0 && (
            <p style={{ fontSize: 12, color: '#4b5563', marginTop: 2 }}>{unread.length} unread</p>
          )}
        </div>
        {unread.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{ fontSize: 12, color: '#6b7280', background: 'none', border: '1px solid #1a2538', padding: '6px 12px', borderRadius: 7, cursor: 'pointer' }}
          >
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: 192, borderRadius: 10, border: '1px dashed #1a2538', textAlign: 'center',
        }}>
          <Bell size={28} style={{ color: '#374151', marginBottom: 8 }} />
          <p style={{ fontSize: 12, color: '#4b5563' }}>{t('notifications.noNotifications')}</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map((n) => {
            const typeInfo = TYPE_ICON[n.type] ?? defaultType
            return (
              <li
                key={n.id}
                style={{
                  background: '#111b2e',
                  border: `1px solid ${!n.is_read ? '#3b82f630' : '#1a2538'}`,
                  borderLeft: `3px solid ${!n.is_read ? '#3b82f6' : '#1a2538'}`,
                  borderRadius: 8,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                  background: typeInfo.bg, color: typeInfo.color,
                }}>
                  {typeInfo.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: !n.is_read ? 600 : 500, color: '#e2e8f0', margin: 0 }}>{n.title}</p>
                  {n.message && (
                    <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>{n.message}</p>
                  )}
                  <p style={{ fontSize: 11, color: '#374151', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatDate(n.created_at)}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {n.link && (
                    <Link to={n.link} onClick={() => { if (!n.is_read) handleMarkRead(n) }}>
                      <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: '1px solid #1a2538', background: 'transparent', color: '#6b7280', cursor: 'pointer' }}>
                        <ChevronRight size={13} />
                      </button>
                    </Link>
                  )}
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkRead(n)}
                      style={{ fontSize: 11, color: '#6b7280', background: 'none', border: '1px solid #1a2538', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
