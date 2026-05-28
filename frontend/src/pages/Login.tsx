import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/lib/api'
import type { User } from '@/types'

type Mode = 'signin' | 'signup'

const inputStyle: React.CSSProperties = {
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
  transition: 'border-color 0.15s',
}

const btnPrimary: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  borderRadius: 7,
  fontSize: 13,
  fontWeight: 700,
  border: 'none',
  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  color: '#fff',
  cursor: 'pointer',
  transition: 'opacity 0.15s',
  letterSpacing: '0.01em',
}

const btnOutline: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 7,
  fontSize: 12,
  fontWeight: 600,
  border: '1px solid #1a2538',
  background: '#0c1322',
  color: '#94a3b8',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  transition: 'all 0.15s',
}

export function Login() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleOAuth = async (provider: 'google' | 'github') => {
    console.log(`[handleOAuth] Starting ${provider} OAuth...`)
    setError('')
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/` },
      })
      console.log(`[handleOAuth] OAuth response:`, err)
      if (err) {
        console.error(`[handleOAuth] OAuth error:`, err.message)
        setError(err.message)
      } else {
        console.log(`[handleOAuth] OAuth flow initiated successfully`)
      }
    } catch (e: any) {
      console.error(`[handleOAuth] Exception:`, e.message)
      setError(e.message)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        })
        if (err) { setError(err.message); return }
        setMessage(t('auth.emailVerification'))
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) { setError(err.message); return }
        if (!data.session) { setError('Sign in failed — no session returned.'); return }
        // fetch profile directly; onAuthStateChange in useAuth will also fire but
        // the redirect happens here as soon as setUser is called
        try {
          const { data: profile } = await api.get<User>('/auth/me')
          setUser(profile)
        } catch (profileErr: unknown) {
          const response = (profileErr as { response?: any })?.response
          const status = response?.status
          const detail = response?.data?.detail

          if (status === 403) {
            // Account deactivated
            setError(detail || 'Your account has been deactivated.')
          } else if (status === 404) {
            // Profile row missing — upsert then fetch
            try {
              await api.post('/auth/upsert-profile')
              const { data: profile } = await api.get<User>('/auth/me')
              setUser(profile)
            } catch {
              setError('Could not load profile. Check backend is running.')
            }
          } else {
            setError('Could not load profile. Check backend is running.')
          }
        }
      }
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Unexpected error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080e19',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      {/* Subtle grid background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(#1a253810 1px, transparent 1px), linear-gradient(90deg, #1a253810 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      <div style={{ width: '100%', maxWidth: 380, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            background: 'linear-gradient(135deg, #60a5fa, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            SkillMark
          </div>
          <div style={{ fontSize: 12, color: '#4b5563', marginTop: 4, letterSpacing: '0.04em' }}>
            SKILL MATRIX &amp; RESOURCE PLATFORM
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#111b2e',
          border: '1px solid #1a2538',
          borderRadius: 12,
          padding: 28,
        }}>
          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: 1, background: '#080e19', borderRadius: 7, padding: 3, marginBottom: 24 }}>
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setMessage('') }}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  border: 'none',
                  borderRadius: 5,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: mode === m ? '#111b2e' : 'transparent',
                  color: mode === m ? '#60a5fa' : '#4b5563',
                  boxShadow: mode === m ? '0 1px 4px #00000030' : 'none',
                }}
              >
                {m === 'signin' ? t('auth.signIn') : t('auth.signUp')}
              </button>
            ))}
          </div>

          {/* OAuth */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            <button
              style={btnOutline}
              onClick={() => {
                console.log('[BUTTON] Google button clicked!')
                alert('Google button clicked!')
                handleOAuth('google')
              }}
            >
              <GoogleIcon />
              {t('auth.continueWithGoogle')}
            </button>
            <button
              style={btnOutline}
              onClick={() => {
                console.log('[BUTTON] GitHub button clicked!')
                alert('GitHub button clicked!')
                handleOAuth('github')
              }}
            >
              <GitHubIcon />
              {t('auth.continueWithGitHub')}
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#1a2538' }} />
            <span style={{ fontSize: 10, color: '#374151', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {t('auth.orSignInWith')}
            </span>
            <div style={{ flex: 1, height: 1, background: '#1a2538' }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                  {t('auth.fullName')}
                </label>
                <input
                  style={inputStyle}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Your full name"
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6' }}
                  onBlur={(e) => { e.target.style.borderColor = '#1a2538' }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                {t('auth.email')}
              </label>
              <input
                type="email"
                style={inputStyle}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6' }}
                onBlur={(e) => { e.target.style.borderColor = '#1a2538' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                {t('auth.password')}
              </label>
              <input
                type="password"
                style={inputStyle}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6' }}
                onBlur={(e) => { e.target.style.borderColor = '#1a2538' }}
              />
            </div>

            {error && (
              <div style={{ padding: '8px 12px', borderRadius: 7, background: '#ef444410', border: '1px solid #ef444430', fontSize: 12, color: '#ef4444' }}>
                {error}
              </div>
            )}
            {message && (
              <div style={{ padding: '8px 12px', borderRadius: 7, background: '#10b98110', border: '1px solid #10b98130', fontSize: 12, color: '#34d399' }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}
              disabled={loading}
            >
              {loading ? t('common.loading') : mode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#374151' }}>
          Employee skill matrix &amp; resource matching
        </div>
      </div>
    </div>
  )
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
