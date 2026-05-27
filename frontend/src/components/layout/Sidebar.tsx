import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Lightbulb,
  Users,
  FolderKanban,
  Bell,
  Settings,
  User,
  CalendarCheck,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import type { Role } from '@/types'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles: Role[]
}

function useNavItems(): NavItem[] {
  const { t } = useTranslation()
  return [
    { label: t('nav.dashboard'),    href: '/',                icon: <LayoutDashboard size={16} />, roles: ['admin', 'manager', 'employee', 'viewer'] },
    { label: t('nav.mySkills'),     href: '/my-skills',       icon: <Lightbulb size={16} />,       roles: ['admin', 'manager', 'employee'] },
    { label: t('nav.employees'),    href: '/employees',       icon: <Users size={16} />,            roles: ['admin', 'manager', 'employee', 'viewer'] },
    { label: t('nav.projects'),     href: '/projects',        icon: <FolderKanban size={16} />,    roles: ['admin', 'manager', 'employee', 'viewer'] },
    { label: t('nav.myAllocations'),href: '/my-allocations',  icon: <CalendarCheck size={16} />,   roles: ['admin', 'manager', 'employee'] },
    { label: t('nav.notifications'),href: '/notifications',   icon: <Bell size={16} />,             roles: ['admin', 'manager', 'employee'] },
    { label: t('nav.settings'),     href: '/settings/skills', icon: <Settings size={16} />,         roles: ['admin'] },
  ]
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const items = useNavItems()
  const visible = items.filter((i) => !user?.role || i.roles.includes(user.role))

  return (
    <aside style={{
      width: 224,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#0c1322',
      borderRight: '1px solid #1a2538',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1a2538' }}>
        <div style={{
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #60a5fa, #34d399)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          SkillMark
        </div>
        <div style={{ fontSize: 10, color: '#4b5563', marginTop: 2, letterSpacing: '0.04em' }}>
          SKILL MATRIX PLATFORM
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
        <div style={{ fontSize: 9, color: '#374151', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 10px 6px' }}>
          Navigation
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {visible.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                end={item.href === '/'}
                onClick={onNavigate}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 7,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#60a5fa' : '#8892a4',
                  background: isActive ? '#3b82f615' : 'transparent',
                  border: isActive ? '1px solid #3b82f625' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                })}
              >
                {({ isActive }) => (
                  <>
                    <span style={{ color: isActive ? '#60a5fa' : '#4b5563', display: 'flex' }}>{item.icon}</span>
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Profile link */}
      <div style={{ borderTop: '1px solid #1a2538', padding: '10px' }}>
        <NavLink
          to="/profile"
          onClick={onNavigate}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            borderRadius: 7,
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: isActive ? 600 : 500,
            color: isActive ? '#60a5fa' : '#8892a4',
            background: isActive ? '#3b82f615' : 'transparent',
            border: isActive ? '1px solid #3b82f625' : '1px solid transparent',
            transition: 'all 0.15s ease',
          })}
        >
          {({ isActive }) => (
            <>
              <span style={{ color: isActive ? '#60a5fa' : '#4b5563', display: 'flex' }}><User size={16} /></span>
              {t('nav.profile')}
            </>
          )}
        </NavLink>

        {/* User badge */}
        {user && (
          <div style={{
            marginTop: 8,
            padding: '8px 10px',
            borderRadius: 7,
            background: '#080e19',
            border: '1px solid #1a2538',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.full_name}
            </div>
            <div style={{ fontSize: 9, color: '#4b5563', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {user.role}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
