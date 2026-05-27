import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/lib/api'
import { getInitials } from '@/lib/utils'
import type { User } from '@/types'

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin:    { bg: '#3b82f615', text: '#60a5fa' },
  manager:  { bg: '#818cf815', text: '#a78bfa' },
  employee: { bg: '#10b98115', text: '#34d399' },
  viewer:   { bg: '#1a2538',   text: '#6b7280' },
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 7,
  fontSize: 13,
  fontWeight: 500,
  border: '1.5px solid #1a2538',
  background: '#0c1322',
  color: '#e2e8f0',
  outline: 'none',
  fontFamily: "'DM Sans', sans-serif",
}

export function Profile() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    full_name: user?.full_name ?? '',
    department: user?.department ?? '',
    job_title: user?.job_title ?? '',
    phone: user?.phone ?? '',
    bio: user?.bio ?? '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const { data } = await api.put<User>(`/users/${user.id}`, form)
      setUser(data)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const roleStyle = ROLE_COLORS[user.role] ?? ROLE_COLORS.viewer

  return (
    <div style={{ maxWidth: 580, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>{t('profile.profile')}</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', padding: '7px 14px', borderRadius: 7, border: '1px solid #1a2538', background: 'transparent', cursor: 'pointer' }}
          >
            {t('profile.editProfile')}
          </button>
        )}
      </div>

      <div style={{ background: '#111b2e', border: '1px solid #1a2538', borderRadius: 10, padding: 24 }}>
        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: editing ? 24 : 0 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: '#fff',
            overflow: 'hidden',
          }}>
            {user.avatar_url
              ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : getInitials(user.full_name)
            }
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>{user.full_name}</h2>
            <p style={{ fontSize: 12, color: '#4b5563', margin: '2px 0 6px' }}>{user.email}</p>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '2px 8px', borderRadius: 20,
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              background: roleStyle.bg, color: roleStyle.text,
            }}>{user.role}</span>
          </div>
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { id: 'full_name', label: t('auth.fullName'), key: 'full_name' as const },
              { id: 'department', label: t('profile.department'), key: 'department' as const },
              { id: 'job_title', label: t('profile.jobTitle'), key: 'job_title' as const },
              { id: 'phone', label: t('profile.phone'), key: 'phone' as const },
            ].map(({ id, label, key }) => (
              <div key={id}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                  {label}
                </label>
                <input
                  id={id}
                  style={fieldStyle}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6' }}
                  onBlur={(e) => { e.target.style.borderColor = '#1a2538' }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                {t('profile.bio')}
              </label>
              <textarea
                style={{ ...fieldStyle, resize: 'vertical', minHeight: 80 }}
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                rows={3}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6' }}
                onBlur={(e) => { e.target.style.borderColor = '#1a2538' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '9px 20px', borderRadius: 7, fontSize: 13, fontWeight: 700,
                  border: 'none', background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? t('common.loading') : t('common.save')}
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{ padding: '9px 16px', borderRadius: 7, fontSize: 13, fontWeight: 600, border: '1px solid #1a2538', background: 'transparent', color: '#6b7280', cursor: 'pointer' }}
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <dl style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: t('profile.department'), value: user.department },
              { label: t('profile.jobTitle'), value: user.job_title },
              { label: t('profile.phone'), value: user.phone },
              { label: t('profile.bio'), value: user.bio },
            ].filter((r) => r.value).map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                <dt style={{ width: 120, flexShrink: 0, color: '#4b5563', fontWeight: 500 }}>{label}</dt>
                <dd style={{ color: '#94a3b8', flex: 1 }}>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  )
}
