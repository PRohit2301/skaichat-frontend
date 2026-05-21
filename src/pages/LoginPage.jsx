import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'

// ── ICONS ──────────────────────────────────────────────────
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}
function ErrorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}
function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

// ── MAIN COMPONENT ─────────────────────────────────────────
export default function LoginPage() {
  const navigate  = useNavigate()
  const setAuth   = useAuthStore((s) => s.setAuth)
  const { theme, toggleDark } = useThemeStore()

  // ── form state
  const [phone, setPhone]       = useState('')
  const [password, setPassword] = useState('')

  // ── UI state
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // ── phone — digits only
  function handlePhone(val) {
    const digits = val.replace(/\D/g, '').slice(0, 10)
    setPhone(digits)
    setError('')
  }

  // ── SUBMIT ─────────────────────────────────────────────
  async function handleSubmit() {
    // basic validation
    if (!phone || !password) {
      setError('Please fill in all fields')
      return
    }
    if (phone.length !== 10) {
      setError('Phone number must be 10 digits')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await api.post('/api/auth/login', {
        phoneNumber: phone,
        password:    password,
      })

      // success — save token + user
      setAuth(res.data.token, {
        id:              res.data.id,
        username:        res.data.username,
        phoneNumber:     res.data.phoneNumber,
        about:           res.data.about,
        themePreference: res.data.themePreference,
        accentColor:     res.data.accentColor,
      })

      // load saved theme
      // (imported separately to keep login clean)
      navigate('/')

    } catch (err) {
      const msg = err.response?.data?.message || 'Incorrect phone number or password'
      setError(msg)
      setPassword('') // clear password on error like real apps
    } finally {
      setLoading(false)
    }
  }

  // ── RENDER ─────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 16px 40px',
    }}>

      {/* ── TOPBAR ── */}
      <div className="sk-topbar" style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', zIndex: 100,
      }}>
        <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.3px' }}>
          <span style={{ color: 'var(--text-primary)' }}>Skai</span>
          <span style={{ color: '#007AFF' }}> Chat</span>
        </div>
        <button onClick={toggleDark} style={{
          background: 'none',
          border: '0.5px solid var(--input-border)',
          borderRadius: 20, padding: '6px 14px',
          fontSize: 13, color: 'var(--text-primary)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <SunIcon />
          {theme === 'dark' ? 'Dark' : 'Light'}
        </button>
      </div>

      {/* ── CARD ── */}
      <div className="sk-card" style={{ padding: '44px 40px', width: '100%', maxWidth: 420 }}>

        {/* brand */}
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.5px' }}>
            <span style={{ color: 'var(--text-primary)' }}>Skai</span>
            <span style={{ color: '#007AFF' }}> Chat</span>
          </div>
        </div>
        <p style={{
          fontSize: 14, color: 'var(--text-secondary)',
          textAlign: 'center', marginBottom: 28,
        }}>
          Sign in to continue
        </p>

        {/* welcome back pill */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div className="sk-pill sk-pill-blue">
            <div className="sk-dot" style={{ background: '#007AFF' }} />
            Welcome back
          </div>
        </div>

        {/* error banner */}
        {error && (
          <div className="sk-error-banner">
            <ErrorIcon />
            {error}
          </div>
        )}

        {/* ── PHONE ── */}
        <div style={{ marginBottom: 14 }}>
          <label className="sk-label">Phone number</label>
          <input
            className="sk-input"
            type="tel"
            placeholder="10-digit number"
            value={phone}
            onChange={(e) => handlePhone(e.target.value)}
            maxLength={10}
            autoComplete="off"
          />
        </div>

        {/* ── PASSWORD ── */}
        <div style={{ marginBottom: 8 }}>
          {/* label row with forgot password */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 6,
          }}>
            <label className="sk-label" style={{ margin: 0 }}>Password</label>
            <a href="#" style={{
              fontSize: 12, color: '#007AFF',
              textDecoration: 'none', fontWeight: 500,
            }}>
              Forgot password?
            </a>
          </div>

          {/* input + eye */}
          <div style={{ position: 'relative' }}>
            <input
              className="sk-input"
              type={showPw ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              style={{ paddingRight: 46 }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
            />
            <button onClick={() => setShowPw(!showPw)} style={{
              position: 'absolute', right: 12, top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
            }}>
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {/* ── SIGN IN BUTTON ── */}
        <button
          className="sk-btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: 16 }}
        >
          {loading && <div className="sk-spinner" />}
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        {/* ── DIVIDER ── */}
        <div className="sk-divider">
          <div className="sk-divider-line" />
          <span className="sk-divider-text">or</span>
          <div className="sk-divider-line" />
        </div>

        {/* ── CREATE ACCOUNT LINK ── */}
        <div style={{
          textAlign: 'center', fontSize: 14,
          color: 'var(--text-secondary)',
        }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{
            color: '#007AFF', textDecoration: 'none', fontWeight: 500,
          }}>
            Create account
          </Link>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <div style={{ marginTop: 28, fontSize: 12, color: 'var(--text-secondary)' }}>
        Skai Chat · Secure · Private · Fast
      </div>

    </div>
  )
}