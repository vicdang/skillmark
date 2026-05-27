import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Save, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Prefs {
  email_on_wishlist: boolean
  email_on_allocation: boolean
  email_on_allocation_response: boolean
  email_on_rfp_complete: boolean
  inapp_on_skill_update: boolean
}

const PREF_LABELS: { key: keyof Prefs; label: string; description: string }[] = [
  { key: 'email_on_wishlist', label: 'Wish list email', description: 'Email me when I\'m added to a project wish list' },
  { key: 'email_on_allocation', label: 'Allocation request email', description: 'Email me when a manager requests my allocation to a project' },
  { key: 'email_on_allocation_response', label: 'Allocation response email', description: 'Email me when an employee confirms or rejects my allocation request' },
  { key: 'email_on_rfp_complete', label: 'RFP extraction email', description: 'Email me when AI finishes extracting data from an uploaded RFP' },
  { key: 'inapp_on_skill_update', label: 'In-app skill notifications', description: 'Show in-app notification when a skill is added or updated in the taxonomy' },
]

const DEFAULT_PREFS: Prefs = {
  email_on_wishlist: true,
  email_on_allocation: true,
  email_on_allocation_response: true,
  email_on_rfp_complete: true,
  inapp_on_skill_update: true,
}

export function NotificationPrefs() {
  const { t } = useTranslation()
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get<Prefs>('/settings/me/notification-prefs')
      .then((r) => setPrefs({ ...DEFAULT_PREFS, ...r.data }))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (key: keyof Prefs) =>
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))

  const save = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await api.put('/settings/me/notification-prefs', prefs)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-muted-foreground">{t('common.loading')}</p>

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-base font-semibold">{t('settings.notificationPrefs')}</h2>

      <div className="divide-y divide-border rounded-lg border border-border">
        {PREF_LABELS.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between gap-4 px-4 py-4">
            <div>
              <Label className="text-sm font-medium">{label}</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            </div>
            <button
              role="switch"
              aria-checked={prefs[key]}
              onClick={() => toggle(key)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                prefs[key] ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-md transition-transform ${
                  prefs[key] ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? <RefreshCw size={13} className="mr-1 animate-spin" /> : <Save size={13} className="mr-1" />}
          {t('common.save')}
        </Button>
        {saved && <span className="text-sm text-emerald-500">Saved!</span>}
      </div>
    </div>
  )
}
