import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'
import api from '../api/axios'

// ── ICONS ──────────────────────────────────────────────────
function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
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
function SignOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}
function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
}
function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

// ── HELPERS ─────────────────────────────────────────────────
function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'long' })
}

// ── MAIN COMPONENT ──────────────────────────────────────────
export default function ProfilePage() {
  const navigate   = useNavigate()
  const { theme, toggleDark } = useThemeStore()
  const user       = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const clearAuth  = useAuthStore((s) => s.clearAuth)

  // ── form state — pre-filled from store
  const [username, setUsername] = useState(user?.username || '')
  const [about,    setAbout]    = useState(user?.about    || '')

  // ── UI state
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')

  // ── field errors
  const [usernameErr, setUsernameErr] = useState('')

  // ── username validation
  function handleUsername(val) {
    setUsername(val)
    setError('')
    setSuccess(false)
    if (val.trim().length === 0) { setUsernameErr('Username is required'); return }
    if (val.trim().length < 2)   { setUsernameErr('Must be at least 2 characters'); return }
    if (val.trim().length > 50)  { setUsernameErr('Must be under 50 characters'); return }
    setUsernameErr('')
  }

  // ── about change
  function handleAbout(val) {
    if (val.length > 150) return
    setAbout(val)
    setSuccess(false)
  }

  // ── save profile
  async function saveProfile() {
    if (usernameErr || username.trim().length < 2) {
      setUsernameErr('Username must be at least 2 characters')
      return
    }
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await api.put('/api/users/me', {
        username: username.trim(),
        about:    about.trim(),
      })
      // update Zustand store so topbar/avatar updates everywhere
      updateUser({ username: res.data.username, about: res.data.about })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── sign out
  function signOut() {
    clearAuth()
    navigate('/login')
  }

  // ── RENDER ─────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      padding: '80px 16px 48px',
    }}>

      {/* ── TOPBAR ── */}
      <div className="sk-topbar" style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
          }}>
            <BackIcon />
          </button>
          <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.3px' }}>
            <span style={{ color: 'var(--text-primary)' }}>Skai</span>
            <span style={{ color: '#007AFF' }}> Chat</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>· Profile</span>
        </div>
        <button onClick={toggleDark} style={{
          background: 'none', border: '0.5px solid var(--input-border)',
          borderRadius: 20, padding: '6px 14px', fontSize: 13,
          color: 'var(--text-primary)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <SunIcon />
          {theme === 'dark' ? 'Dark' : 'Light'}
        </button>
      </div>

      {/* ── CARD ── */}
      <div className="sk-card" style={{
        padding: '44px 40px',
        width: '100%', maxWidth: 440,
      }}>

        {/* ── SUCCESS BANNER ── */}
        {success && (
          <div className="sk-success-banner">
            <SaveIcon />
            Profile saved successfully
          </div>
        )}

        {/* ── ERROR BANNER ── */}
        {error && (
          <div className="sk-error-banner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* ── AVATAR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #007AFF, #5856D6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 500, color: '#fff',
            letterSpacing: '-1px', marginBottom: 12,
          }}>
            {getInitials(username)}
          </div>
          <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            {username || '—'}
          </div>
          {user?.createdAt && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Member since {formatDate(user.createdAt)}
            </div>
          )}
        </div>

        {/* ── SECTION: PROFILE INFO ── */}
        <div style={{
          fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
          letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 14,
        }}>
          Profile info
        </div>

        {/* username */}
        <div style={{ marginBottom: 14 }}>
          <label className="sk-label">Username</label>
          <input
            className={`sk-input ${usernameErr ? 'error' : ''}`}
            type="text"
            value={username}
            onChange={e => handleUsername(e.target.value)}
            maxLength={50}
            placeholder="Your display name"
          />
          {/* char count */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <div style={{ fontSize: 11, color: '#ff3b30', minHeight: 15 }}>
              {usernameErr}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              {username.length} / 50
            </div>
          </div>
        </div>

        {/* about */}
        <div style={{ marginBottom: 22 }}>
          <label className="sk-label">About</label>
          <textarea
            value={about}
            onChange={e => handleAbout(e.target.value)}
            maxLength={150}
            placeholder="Hey there, I am using Skai Chat"
            rows={3}
            style={{
              width: '100%',
              border: '0.5px solid var(--input-border)',
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 15,
              color: 'var(--text-primary)',
              background: 'var(--input-bg)',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'none',
              lineHeight: 1.5,
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={e => {
              e.target.style.borderColor = '#007AFF'
              e.target.style.borderWidth = '1.5px'
              e.target.style.boxShadow   = '0 0 0 3px rgba(0,122,255,0.12)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--input-border)'
              e.target.style.borderWidth = '0.5px'
              e.target.style.boxShadow   = 'none'
            }}
          />
          <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {about.length} / 150
          </div>
        </div>

        {/* ── SECTION: ACCOUNT ── */}
        <div style={{
          fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
          letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 14,
        }}>
          Account
        </div>

        {/* phone — read only */}
        <div style={{ marginBottom: 22 }}>
          <label className="sk-label">Phone number</label>
          <div style={{ position: 'relative' }}>
            <input
              className="sk-input"
              type="text"
              value={user?.phoneNumber || ''}
              disabled
              style={{
                background: 'var(--hover-bg)',
                color: 'var(--text-secondary)',
                cursor: 'not-allowed',
                paddingRight: 40,
              }}
            />
            <div style={{
              position: 'absolute', right: 12, top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
            }}>
              <LockIcon />
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 5 }}>
            Phone number cannot be changed here.{' '}
            <span
              onClick={() => navigate('/settings')}
              style={{ color: '#007AFF', cursor: 'pointer', fontWeight: 500 }}
            >
              Go to Settings
            </span>
          </div>
        </div>

        {/* ── SAVE BUTTON ── */}
        <button
          className="sk-btn-primary"
          onClick={saveProfile}
          disabled={loading || !!usernameErr}
        >
          {loading
            ? <><div className="sk-spinner" /> Saving...</>
            : <><SaveIcon /> Save changes</>
          }
        </button>

        {/* ── DIVIDER ── */}
        <div style={{
          width: '100%', height: '0.5px',
          background: 'var(--divider)',
          margin: '24px 0',
        }} />

        {/* ── SIGN OUT BUTTON ── */}
        <button
          className="sk-btn-danger"
          onClick={signOut}
        >
          <SignOutIcon />
          Sign out
        </button>

      </div>

      {/* ── FOOTER ── */}
      <div style={{ marginTop: 28, fontSize: 12, color: 'var(--text-secondary)' }}>
        Skai Chat · Secure · Private · Fast
      </div>

    </div>
  )
}