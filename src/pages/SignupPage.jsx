import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'

// ── PASSWORD RULES ─────────────────────────────────────────
const rules = [
  { test: (p) => p.length >= 8,          hint: 'Use at least 8 characters' },
  { test: (p) => /[A-Z]/.test(p),        hint: 'Add an uppercase letter' },
  { test: (p) => /[a-z]/.test(p),        hint: 'Add a lowercase letter' },
  { test: (p) => /[0-9]/.test(p),        hint: 'Add a number' },
  { test: (p) => /[@#$%!&*^]/.test(p),   hint: 'Add a special character (@#$%!&)' },
]

const SEG_COLORS = ['', '#ff3b30', '#ff9500', '#ffcc00', '#30d158', '#30d158']
const SEG_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Strong']

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
export default function SignupPage() {
  const navigate   = useNavigate()
  const setAuth    = useAuthStore((s) => s.setAuth)
  const { theme, toggleDark } = useThemeStore()

  // ── form state
  const [username, setUsername]   = useState('')
  const [phone, setPhone]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')

  // ── UI state
  const [showPw, setShowPw]       = useState(false)
  const [showCf, setShowCf]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')        // banner error
  const [passedCount, setPassedCount] = useState(0)
  const [pwHint, setPwHint]       = useState('')
  const [matchHint, setMatchHint] = useState('')        // confirm match

  // ── field errors
  const [usernameErr, setUsernameErr] = useState('')
  const [phoneErr, setPhoneErr]       = useState('')

  // ── HANDLERS ───────────────────────────────────────────

  // username validation
  function handleUsername(val) {
    setUsername(val)
    setError('')
    if (val.length === 0)       { setUsernameErr(''); return }
    if (val.length < 2)         { setUsernameErr('Username must be at least 2 characters'); return }
    if (val.length > 50)        { setUsernameErr('Username must be under 50 characters'); return }
    setUsernameErr('')
  }

  // phone — only digits, max 10
  function handlePhone(val) {
    const digits = val.replace(/\D/g, '').slice(0, 10)
    setPhone(digits)
    setError('')
    if (digits.length === 0)    { setPhoneErr(''); return }
    if (digits.length !== 10)   { setPhoneErr('Phone number must be exactly 10 digits'); return }
    setPhoneErr('')
  }

  // password — check all 5 rules live
  function handlePassword(val) {
    setPassword(val)
    setError('')

    let passed = 0
    let firstFail = ''
    rules.forEach((r) => {
      if (r.test(val)) passed++
      else if (!firstFail) firstFail = r.hint
    })
    setPassedCount(passed)

    if (val.length === 0)   setPwHint('')
    else if (passed === 5)  setPwHint('✓ Password looks good')
    else                    setPwHint(firstFail)

    // re-check confirm match
    handleConfirmMatch(val, confirm)
  }

  // confirm password match
  function handleConfirm(val) {
    setConfirm(val)
    setError('')
    handleConfirmMatch(password, val)
  }

  function handleConfirmMatch(pw, cf) {
    if (cf.length === 0)  { setMatchHint(''); return }
    if (pw === cf)        setMatchHint('match')
    else                  setMatchHint('Passwords do not match')
  }

  // can submit check
  const allRulesPass = rules.every((r) => r.test(password))
  const usernameOk   = username.trim().length >= 2 && username.trim().length <= 50
  const phoneOk      = phone.length === 10
  const confirmOk    = password === confirm && confirm.length > 0
  const canSubmit    = usernameOk && phoneOk && allRulesPass && confirmOk && !loading

  // ── SUBMIT ─────────────────────────────────────────────
  async function handleSubmit() {
    if (!canSubmit) return
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/api/auth/signup', {
        username:    username.trim(),
        phoneNumber: phone,
        password:    password,
      })

      // success — save token + user, redirect to chat
      setAuth(res.data.token, {
        id:              res.data.id,
        username:        res.data.username,
        phoneNumber:     res.data.phoneNumber,
        about:           res.data.about,
        themePreference: res.data.themePreference,
        accentColor:     res.data.accentColor,
      })

      navigate('/')

    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── STRENGTH SEGMENT COLOR ─────────────────────────────
  function segColor(i) {
    // i is 1-based (1 to 5)
    if (password.length === 0) return 'var(--input-border)'
    return i <= passedCount ? SEG_COLORS[passedCount] : 'var(--input-border)'
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
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 28 }}>
          Create your account
        </p>

        {/* new account pill */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div className="sk-pill sk-pill-green">
            <div className="sk-dot" style={{ background: '#30d158' }} />
            New account
          </div>
        </div>

        {/* error banner */}
        {error && (
          <div className="sk-error-banner">
            <ErrorIcon />
            {error}
          </div>
        )}

        {/* ── USERNAME ── */}
        <div style={{ marginBottom: 14 }}>
          <label className="sk-label">Username</label>
          <input
            className={`sk-input ${usernameErr ? 'error' : ''}`}
            type="text"
            placeholder="e.g. Arjun Kumar"
            value={username}
            onChange={(e) => handleUsername(e.target.value)}
          />
          {usernameErr && (
            <div style={{ fontSize: 11, color: '#ff3b30', marginTop: 5 }}>{usernameErr}</div>
          )}
        </div>

        {/* ── PHONE ── */}
        <div style={{ marginBottom: 14 }}>
          <label className="sk-label">Phone number</label>
          <input
            className={`sk-input ${phoneErr ? 'error' : ''}`}
            type="tel"
            placeholder="10-digit number"
            value={phone}
            onChange={(e) => handlePhone(e.target.value)}
            maxLength={10}
          />
          {phoneErr && (
            <div style={{ fontSize: 11, color: '#ff3b30', marginTop: 5 }}>{phoneErr}</div>
          )}
        </div>

        {/* ── PASSWORD ── */}
        <div style={{ marginBottom: 14 }}>
          <label className="sk-label">Password</label>

          {/* input + eye */}
          <div style={{ position: 'relative' }}>
            <input
              className="sk-input"
              type={showPw ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => handlePassword(e.target.value)}
              style={{ paddingRight: 46 }}
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

          {/* strength segments */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '8px 0 4px' }}>
            <div style={{ display: 'flex', gap: 3, flex: 1 }}>
              {[1,2,3,4,5].map((i) => (
                <div key={i} style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: segColor(i),
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600, minWidth: 40, textAlign: 'right',
              color: password.length === 0 ? 'var(--text-tertiary)' : SEG_COLORS[passedCount] || 'var(--text-tertiary)',
              transition: 'color 0.3s',
            }}>
              {password.length === 0 ? '' : SEG_LABELS[passedCount]}
            </span>
          </div>

          {/* single hint line */}
          <div style={{
            fontSize: 11, minHeight: 15, marginBottom: 4,
            color: pwHint.startsWith('✓') ? '#30d158' : '#ff3b30',
            transition: 'color 0.2s',
          }}>
            {pwHint}
          </div>

          {/* static requirements */}
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>
            8 characters · (A–Z) · (a–z) · (0–9) · (@#$%!&)
          </div>
        </div>

        {/* ── CONFIRM PASSWORD ── */}
        <div style={{ marginBottom: 8 }}>
          <label className="sk-label">Confirm password</label>
          <div style={{ position: 'relative' }}>
            <input
              className={`sk-input ${matchHint === 'Passwords do not match' ? 'error' : ''}`}
              type={showCf ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={confirm}
              onChange={(e) => handleConfirm(e.target.value)}
              style={{ paddingRight: 46 }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
            />
            <button onClick={() => setShowCf(!showCf)} style={{
              position: 'absolute', right: 12, top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
            }}>
              {showCf ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {/* match hint */}
          {matchHint && (
            <div style={{
              fontSize: 11, marginTop: 5,
              color: matchHint === 'match' ? '#30d158' : '#ff3b30',
            }}>
              {matchHint === 'match' ? 'Passwords match' : matchHint}
            </div>
          )}
        </div>

        {/* ── CREATE ACCOUNT BUTTON ── */}
        <button
          className="sk-btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{ marginTop: 16 }}
        >
          {loading && <div className="sk-spinner" />}
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        {/* ── DIVIDER ── */}
        <div className="sk-divider">
          <div className="sk-divider-line" />
          <span className="sk-divider-text">or</span>
          <div className="sk-divider-line" />
        </div>

        {/* ── SIGN IN LINK ── */}
        <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#007AFF', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
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