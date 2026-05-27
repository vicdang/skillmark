import { Link } from 'react-router-dom'
import { Bell, LogOut, Globe, Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { supabase } from '@/lib/supabase'
import { getInitials } from '@/lib/utils'

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { t, i18n } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const unreadCount = useNotificationStore((s) => s.unreadCount)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'vi' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem('skillmark-lang', next)
  }

  const iconBtn: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 7,
    border: '1px solid #1a2538',
    background: 'transparent',
    color: '#8892a4',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  }

  return (
    <header style={{
      height: 52,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      background: '#0c1322',
      borderBottom: '1px solid #1a2538',
      flexShrink: 0,
    }}>
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        style={{ ...iconBtn, display: 'none' }}
        className="lg:hidden-topbar"
        title="Menu"
      >
        <Menu size={16} />
      </button>

      {/* Page breadcrumb area — empty, room for page titles */}
      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Lang toggle */}
        <button onClick={toggleLang} style={iconBtn} title="Toggle language">
          <Globe size={14} />
        </button>

        {/* Notifications */}
        <Link to="/notifications" style={{ position: 'relative', display: 'flex' }}>
          <button style={iconBtn} title={t('nav.notifications')}>
            <Bell size={14} />
          </button>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              background: '#ef4444',
              color: '#fff',
              fontSize: 9,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              padding: '0 3px',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User avatar */}
        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 30,
            height: 30,
            borderRadius: 7,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}>
            {user ? getInitials(user.full_name) : '?'}
          </div>
          <div style={{ display: 'none' }} className="sm-show">
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.2 }}>
              {user?.full_name ?? '—'}
            </div>
            <div style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {user?.role}
            </div>
          </div>
        </Link>

        {/* Logout */}
        <button onClick={handleLogout} style={{ ...iconBtn, color: '#6b7280' }} title={t('nav.logout')}>
          <LogOut size={14} />
        </button>
      </div>
    </header>
  )
}
