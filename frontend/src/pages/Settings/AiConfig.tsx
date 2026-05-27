import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Save, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const PROVIDERS = ['anthropic', 'openai', 'google']
const ANTHROPIC_MODELS = ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001', 'claude-opus-4-7']
const OPENAI_MODELS = ['gpt-4o', 'gpt-4o-mini']
const GOOGLE_MODELS = ['gemini-1.5-pro', 'gemini-1.5-flash']

const MATCHING_WEIGHTS = [
  { key: 'matching_weight_skill', label: 'Skill Match Weight (%)', default: '40' },
  { key: 'matching_weight_seniority', label: 'Seniority Fit Weight (%)', default: '25' },
  { key: 'matching_weight_availability', label: 'Availability Weight (%)', default: '20' },
  { key: 'matching_weight_domain', label: 'Domain Experience Weight (%)', default: '15' },
]

export function AiConfig() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get<Record<string, string>>('/settings')
      .then((r) => setSettings(r.data))
      .finally(() => setLoading(false))
  }, [])

  const set = (key: string, value: string) => setSettings((prev) => ({ ...prev, [key]: value }))

  const save = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const keys = [
        'ai_provider', 'ai_model', 'ai_api_key', 'ai_fallback_provider',
        'ai_max_retries',
        ...MATCHING_WEIGHTS.map((w) => w.key),
      ]
      await Promise.all(
        keys
          .filter((k) => settings[k] !== undefined)
          .map((k) => api.put(`/settings/${k}`, { value: settings[k] }))
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const provider = settings['ai_provider'] || 'anthropic'
  const models = provider === 'anthropic' ? ANTHROPIC_MODELS : provider === 'openai' ? OPENAI_MODELS : GOOGLE_MODELS

  const weightTotal = MATCHING_WEIGHTS.reduce(
    (sum, w) => sum + parseInt(settings[w.key] || w.default),
    0
  )

  if (loading) return <p className="text-muted-foreground">{t('common.loading')}</p>

  return (
    <div className="max-w-xl space-y-8">
      {/* AI Agent */}
      <section>
        <h2 className="mb-4 text-base font-semibold">{t('settings.aiConfig')}</h2>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>AI Provider</Label>
            <Select value={provider} onValueChange={(v) => { set('ai_provider', v); set('ai_model', '') }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Model</Label>
            <Select value={settings['ai_model'] || models[0]} onValueChange={(v) => set('ai_model', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {models.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={settings['ai_api_key'] || ''}
              onChange={(e) => set('ai_api_key', e.target.value)}
              placeholder="sk-..."
            />
            <p className="text-xs text-muted-foreground">Stored encrypted. Leave blank to use the server's environment variable.</p>
          </div>

          <div className="space-y-1">
            <Label>Fallback Provider</Label>
            <Select value={settings['ai_fallback_provider'] || '_none'} onValueChange={(v) => set('ai_fallback_provider', v === '_none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">None</SelectItem>
                {PROVIDERS.filter((p) => p !== provider).map((p) => (
                  <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="max-retries">Max Retries</Label>
            <Input
              id="max-retries"
              type="number"
              min={0}
              max={5}
              value={settings['ai_max_retries'] || '2'}
              onChange={(e) => set('ai_max_retries', e.target.value)}
              className="w-24"
            />
          </div>
        </div>
      </section>

      {/* Matching weights */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Matching Weights</h2>
          <span className={`text-sm font-medium ${weightTotal === 100 ? 'text-emerald-500' : 'text-destructive'}`}>
            Total: {weightTotal}% {weightTotal !== 100 && '(must equal 100%)'}
          </span>
        </div>
        <div className="space-y-4">
          {MATCHING_WEIGHTS.map((w) => (
            <div key={w.key} className="flex items-center gap-4">
              <Label className="w-52 shrink-0 text-sm">{w.label}</Label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={parseInt(settings[w.key] || w.default)}
                onChange={(e) => set(w.key, e.target.value)}
                className="flex-1"
              />
              <span className="w-12 text-right text-sm">{settings[w.key] || w.default}%</span>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving || weightTotal !== 100}>
          {saving ? <RefreshCw size={13} className="mr-1 animate-spin" /> : <Save size={13} className="mr-1" />}
          {t('common.save')}
        </Button>
        {saved && <span className="text-sm text-emerald-500">Saved!</span>}
      </div>
    </div>
  )
}
