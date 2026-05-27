import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, ShieldAlert, ShieldOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'

interface LicenseData {
  valid: boolean
  tier: string
  seats: number
  expires_at: string | null
  mode: 'licensed' | 'trial' | 'expired' | 'missing'
  message: string
}

const MODE_ICON = {
  licensed: <ShieldCheck size={18} className="text-green-500" />,
  trial: <ShieldAlert size={18} className="text-yellow-500" />,
  expired: <ShieldOff size={18} className="text-destructive" />,
  missing: <ShieldOff size={18} className="text-muted-foreground" />,
}

const MODE_COLOR: Record<string, string> = {
  licensed: 'text-green-600',
  trial: 'text-yellow-600',
  expired: 'text-destructive',
  missing: 'text-muted-foreground',
}

export function LicenseInfo() {
  const { t } = useTranslation()
  const [license, setLicense] = useState<LicenseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [validateKey, setValidateKey] = useState('')
  const [validating, setValidating] = useState(false)
  const [validateResult, setValidateResult] = useState<LicenseData | null>(null)

  const fetchLicense = async () => {
    setLoading(true)
    try {
      const { data } = await api.get<LicenseData>('/settings/license')
      setLicense(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLicense() }, [])

  const handleValidate = async () => {
    if (!validateKey.trim()) return
    setValidating(true)
    setValidateResult(null)
    try {
      const { data } = await api.post<LicenseData>('/settings/license/validate', { key: validateKey.trim() })
      setValidateResult(data)
    } finally {
      setValidating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-lg font-semibold">{t('settings.license')}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('settings.licenseDesc')}
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : license ? (
        <div className="rounded-lg border border-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            {MODE_ICON[license.mode] ?? MODE_ICON.missing}
            <div>
              <p className={`text-sm font-medium capitalize ${MODE_COLOR[license.mode]}`}>
                {license.mode === 'licensed'
                  ? `${t('settings.licenseActive')} — ${license.tier}`
                  : license.mode === 'trial'
                  ? t('settings.licenseTrial')
                  : t('settings.licenseExpired')}
              </p>
              <p className="text-xs text-muted-foreground">{license.message}</p>
            </div>
            <button
              onClick={fetchLicense}
              className="ml-auto text-muted-foreground hover:text-foreground"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted-foreground">{t('settings.licenseTier')}</dt>
            <dd className="font-medium capitalize">{license.tier}</dd>
            <dt className="text-muted-foreground">{t('settings.licenseSeats')}</dt>
            <dd className="font-medium">{license.seats === 0 ? t('settings.unlimited') : license.seats}</dd>
            {license.expires_at && (
              <>
                <dt className="text-muted-foreground">{t('settings.licenseExpires')}</dt>
                <dd className="font-medium">{new Date(license.expires_at).toLocaleDateString()}</dd>
              </>
            )}
          </dl>
        </div>
      ) : null}

      {/* Validate a key manually */}
      <div className="space-y-3">
        <p className="text-sm font-medium">{t('settings.validateKey')}</p>
        <div className="flex gap-2">
          <Input
            placeholder="eyJ..."
            value={validateKey}
            onChange={(e) => setValidateKey(e.target.value)}
            className="font-mono text-xs"
          />
          <Button size="sm" onClick={handleValidate} disabled={validating || !validateKey.trim()}>
            {validating ? t('common.loading') : t('settings.validate')}
          </Button>
        </div>
        {validateResult && (
          <div className={`rounded-md border p-3 text-sm ${validateResult.valid ? 'border-green-500/40 bg-green-500/5 text-green-700' : 'border-destructive/40 bg-destructive/5 text-destructive'}`}>
            <span className="font-medium">{validateResult.valid ? t('settings.keyValid') : t('settings.keyInvalid')}</span>
            {' — '}
            {validateResult.message}
            {validateResult.valid && validateResult.tier && (
              <span className="ml-2 text-xs opacity-70">
                ({validateResult.tier}{validateResult.seats > 0 ? `, ${validateResult.seats} seats` : ''})
              </span>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {t('settings.licenseEnvNote')}
      </p>
    </div>
  )
}
