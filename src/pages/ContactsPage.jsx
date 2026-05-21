import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useThemeStore from '../store/themeStore'
import useAuthStore from '../store/authStore'
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
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
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
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

// ── AVATAR COLORS ───────────────────────────────────────────
const AVATAR_COLORS = [
  'linear-gradient(135deg,#007AFF,#5856D6)',
  'linear-gradient(135deg,#30d158,#34c759)',
  'linear-gradient(135deg,#ff9500,#ff6b00)',
  'linear-gradient(135deg,#5856D6,#AF52DE)',
  'linear-gradient(135deg,#ff2d55,#ff375f)',
]
function getInitials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}
function getAvatarColor(id) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length]
}

// ── MOCK DATA ───────────────────────────────────────────────
const MOCK_CONTACTS = [
  { requestId: 1, userId: 10, username: 'Priya Sharma',  phoneNumber: '9876543210', about: 'Available' },
  { requestId: 2, userId: 11, username: 'Rahul Verma',   phoneNumber: '8765432109', about: 'Busy — in a meeting' },
  { requestId: 3, userId: 12, username: 'Sneha Patel',   phoneNumber: '7654321098', about: 'Hey there!' },
  { requestId: 4, userId: 13, username: 'Vikram Singh',  phoneNumber: '6543210987', about: 'Photography enthusiast' },
]
const MOCK_INCOMING = [
  { requestId: 5, userId: 20, username: 'Kavya Nair',    phoneNumber: '5432109876', about: 'Living my best life' },
  { requestId: 6, userId: 21, username: 'Dev Joshi',     phoneNumber: '4321098765', about: 'Software engineer' },
]
const MOCK_SEARCH = [
  { id: 30, username: 'Ananya Roy',    phoneNumber: '3210987654', about: 'Coffee lover ☕',    status: 'none'    },
  { id: 31, username: 'Karan Mehta',   phoneNumber: '2109876543', about: 'Music producer 🎵', status: 'none'    },
  { id: 32, username: 'Priya Sharma',  phoneNumber: '9876543210', about: 'Available',          status: 'friend'  },
  { id: 33, username: 'Riya Kapoor',   phoneNumber: '1098765432', about: 'Traveller ✈️',      status: 'pending' },
]

// ── SECTION LABEL ───────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
      letterSpacing: '0.5px', textTransform: 'uppercase',
      marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

// ── USER ROW ────────────────────────────────────────────────
function UserRow({ user, actions }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 0',
      borderBottom: '0.5px solid var(--border-mid)',
    }}>
      {/* avatar */}
      <div style={{
        width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
        background: getAvatarColor(user.userId || user.id),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 500, color: '#fff',
      }}>
        {getInitials(user.username)}
      </div>

      {/* info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 500, color: 'var(--text-primary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {user.username}
        </div>
        <div style={{
          fontSize: 12, color: 'var(--text-secondary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginTop: 2,
        }}>
          {user.about}
        </div>
      </div>

      {/* action buttons */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {actions}
      </div>
    </div>
  )
}

// ── SMALL BUTTON ────────────────────────────────────────────
function SmBtn({ label, color, bg, border, onClick, icon }) {
  return (
    <button onClick={onClick} style={{
      height: 32, padding: '0 14px',
      background: bg || 'none',
      color: color || '#007AFF',
      border: border || '0.5px solid #007AFF',
      borderRadius: 8, fontSize: 13, fontWeight: 500,
      cursor: 'pointer', transition: 'opacity 0.2s',
      display: 'flex', alignItems: 'center', gap: 5,
      whiteSpace: 'nowrap',
    }}
    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      {icon}{label}
    </button>
  )
}

// ── TOAST ───────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%',
      transform: 'translateX(-50%)',
      background: '#1d1d1f', color: '#f5f5f7',
      fontSize: 13, padding: '10px 20px',
      borderRadius: 20, zIndex: 999,
      whiteSpace: 'nowrap', pointerEvents: 'none',
    }}>
      {msg}
    </div>
  )
}

// ── MAIN COMPONENT ──────────────────────────────────────────
export default function ContactsPage() {
  const navigate = useNavigate()
  const { theme, toggleDark } = useThemeStore()
  const user = useAuthStore((s) => s.user)

  // ── state
  const [contacts, setContacts]   = useState(MOCK_CONTACTS)
  const [incoming, setIncoming]   = useState(MOCK_INCOMING)
  const [searchQ, setSearchQ]     = useState('')
  const [searchRes, setSearchRes] = useState([])
  const [searching, setSearching] = useState(false)
  const [toast, setToast]         = useState('')
  const [searchTimer, setSearchTimer] = useState(null)

  // ── show toast briefly
  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  // ── live search with 400ms debounce
  function handleSearch(val) {
    setSearchQ(val)
    clearTimeout(searchTimer)
    if (val.trim().length < 2) { setSearchRes([]); setSearching(false); return }
    setSearching(true)
    const t = setTimeout(() => {
      // real API: api.get(`/api/users/search?q=${val}`).then(res => setSearchRes(res.data))
      const results = MOCK_SEARCH.filter(u =>
        u.username.toLowerCase().includes(val.toLowerCase()) ||
        u.phoneNumber.includes(val)
      )
      setSearchRes(results)
      setSearching(false)
    }, 400)
    setSearchTimer(t)
  }

  // ── send friend request
  async function sendRequest(userId, username) {
    // real API: await api.post('/api/contacts/request', { receiverId: userId })
    setSearchRes(prev => prev.map(u =>
      u.id === userId ? { ...u, status: 'pending' } : u
    ))
    showToast(`Request sent to ${username}`)
  }

  // ── cancel sent request
  async function cancelRequest(userId, username) {
    // real API: await api.delete(`/api/contacts/decline/${requestId}`)
    setSearchRes(prev => prev.map(u =>
      u.id === userId ? { ...u, status: 'none' } : u
    ))
    showToast('Request cancelled')
  }

  // ── accept incoming request
  async function acceptRequest(requestId, username) {
    // real API: await api.put(`/api/contacts/accept/${requestId}`)
    const accepted = incoming.find(r => r.requestId === requestId)
    if (accepted) {
      setContacts(prev => [...prev, accepted])
      setIncoming(prev => prev.filter(r => r.requestId !== requestId))
      showToast(`You and ${username} are now connected`)
    }
  }

  // ── decline incoming request
  async function declineRequest(requestId, username) {
    // real API: await api.delete(`/api/contacts/decline/${requestId}`)
    setIncoming(prev => prev.filter(r => r.requestId !== requestId))
    showToast(`Request from ${username} declined`)
  }

  // ── remove contact
  async function removeContact(requestId, username) {
    if (!window.confirm(`Remove ${username} from contacts?`)) return
    // real API: await api.delete(`/api/contacts/${requestId}`)
    setContacts(prev => prev.filter(c => c.requestId !== requestId))
    showToast(`${username} removed from contacts`)
  }

  // ── RENDER ─────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 16px 48px' }}>

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
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>· Contacts</span>
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

      {/* ── CONTENT WRAPPER — responsive max-width ── */}
      <div style={{ width: '100%', maxWidth: 680 }}>

        {/* ── SEARCH CARD ── */}
        <div className="sk-card" style={{ padding: '28px 28px 24px', marginBottom: 16 }}>
          <SectionLabel>Find people</SectionLabel>

          {/* search input */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--input-bg)', border: '0.5px solid var(--input-border)',
            borderRadius: 12, padding: '0 14px', height: 46,
            marginBottom: 16,
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}>
            <SearchIcon />
            <input
              style={{
                flex: 1, border: 'none', background: 'transparent',
                outline: 'none', fontSize: 15, color: 'var(--text-primary)',
                fontFamily: 'inherit',
              }}
              placeholder="Search by name or phone number"
              value={searchQ}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>

          {/* search results */}
          {searching && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '8px 0' }}>
              Searching...
            </div>
          )}

          {!searching && searchQ.length >= 2 && searchRes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: 14 }}>
              No users found for "{searchQ}"
            </div>
          )}

          {searchRes.map(u => (
            <UserRow key={u.id} user={u} actions={
              <>
                {u.status === 'none' && (
                  <SmBtn
                    label="Add"
                    bg="#007AFF" color="#fff" border="none"
                    onClick={() => sendRequest(u.id, u.username)}
                  />
                )}
                {u.status === 'pending' && (
                  <SmBtn
                    label="Pending"
                    color="var(--text-secondary)"
                    border="0.5px solid var(--input-border)"
                    onClick={() => cancelRequest(u.id, u.username)}
                  />
                )}
                {u.status === 'friend' && (
                  <SmBtn
                    label="Remove"
                    color="#ff3b30"
                    border="0.5px solid rgba(255,59,48,0.3)"
                    onClick={() => removeContact(u.id, u.username)}
                  />
                )}
              </>
            } />
          ))}
        </div>

        {/* ── INCOMING REQUESTS CARD ── */}
        {incoming.length > 0 && (
          <div className="sk-card" style={{ padding: '28px 28px 24px', marginBottom: 16 }}>
            <SectionLabel>Incoming requests · {incoming.length}</SectionLabel>
            {incoming.map(r => (
              <UserRow key={r.requestId} user={r} actions={
                <>
                  <SmBtn
                    label="Accept"
                    bg="#30d158" color="#fff" border="none"
                    icon={<CheckIcon />}
                    onClick={() => acceptRequest(r.requestId, r.username)}
                  />
                  <SmBtn
                    label="Decline"
                    color="#ff3b30"
                    border="0.5px solid rgba(255,59,48,0.3)"
                    icon={<XIcon />}
                    onClick={() => declineRequest(r.requestId, r.username)}
                  />
                </>
              } />
            ))}
          </div>
        )}

        {/* ── MY CONTACTS CARD ── */}
        <div className="sk-card" style={{ padding: '28px 28px 24px', marginBottom: 16 }}>
          <SectionLabel>My contacts · {contacts.length}</SectionLabel>

          {contacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>👥</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                No contacts yet. Search for people above.
              </div>
            </div>
          ) : (
            contacts.map(c => (
              <UserRow key={c.requestId} user={c} actions={
                <SmBtn
                  label="Remove"
                  color="#ff3b30"
                  border="0.5px solid rgba(255,59,48,0.3)"
                  onClick={() => removeContact(c.requestId, c.username)}
                />
              } />
            ))
          )}
        </div>

      </div>

      {/* footer */}
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
        Skai Chat · Secure · Private · Fast
      </div>

      {/* toast */}
      <Toast msg={toast} />

    </div>
  )
}