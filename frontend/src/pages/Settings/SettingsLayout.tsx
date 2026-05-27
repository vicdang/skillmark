import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Cpu, Bell, Layers, KeyRound, Users } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const NAV_BASE = [
  { to: '/settings/skills', labelKey: 'settings.skillTaxonomy', icon: <Layers size={14} /> },
  { to: '/settings/ai', labelKey: 'settings.aiConfig', icon: <Cpu size={14} /> },
  { to: '/settings/notifications', labelKey: 'settings.notifPrefs', icon: <Bell size={14} /> },
]
const NAV_ADMIN = [
  { to: '/settings/team', labelKey: 'settings.teamManagement', icon: <Users size={14} /> },
  { to: '/settings/license', labelKey: 'settings.license', icon: <KeyRound size={14} /> },
]

export function SettingsLayout() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'
  const nav = isAdmin ? [...NAV_BASE, ...NAV_ADMIN] : NAV_BASE

  return (
    <div style={{ display: 'flex', gap: 32 }}>
      {/* Side nav */}
      <aside style={{ width: 180, flexShrink: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 10px 8px' }}>
          {t('settings.settings')}
        </p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', borderRadius: 7,
                textDecoration: 'none', fontSize: 13, fontWeight: isActive ? 600 : 500,
                color: isActive ? '#60a5fa' : '#6b7280',
                background: isActive ? '#3b82f615' : 'transparent',
                border: isActive ? '1px solid #3b82f625' : '1px solid transparent',
                transition: 'all 0.15s',
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{ color: isActive ? '#60a5fa' : '#4b5563', display: 'flex' }}>{item.icon}</span>
                  {t(item.labelKey)}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Page content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  )
}
