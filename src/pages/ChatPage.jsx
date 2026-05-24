import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'
import api from '../api/axios'

// ── ICONS ──────────────────────────────────────────────────
const Icon = ({ d, size = 16, fill = 'none', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" {...props}>{d}</svg>
)
function SearchIcon()    { return <Icon size={14} d={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>} /> }
function SendIcon()      { return <Icon size={14} d={<><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>} /> }
function SettingsIcon()  { return <Icon size={15} d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>} /> }
function BackIcon()      { return <Icon size={18} d={<><polyline points="15 18 9 12 15 6"/></>} /> }
function BellIcon()      { return <Icon size={16} d={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>} /> }
function SunIcon()       { return <Icon size={14} d={<><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>} /> }
function RemoveUserIcon(){ return <Icon size={13} d={<><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></>} /> }
function ContactsIcon()  { return <Icon size={15} d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} /> }
function RefreshIcon()   { return <Icon size={14} d={<><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>} /> }

// ── HELPERS ─────────────────────────────────────────────────
const AVATAR_COLORS = [
  'linear-gradient(135deg,#007AFF,#5856D6)',
  'linear-gradient(135deg,#30d158,#34c759)',
  'linear-gradient(135deg,#ff9500,#ff6b00)',
  'linear-gradient(135deg,#5856D6,#AF52DE)',
  'linear-gradient(135deg,#ff2d55,#ff375f)',
]
function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
function getAvatarColor(id) {
  return AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length]
}
function formatTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function formatConvTime(dateStr) {
  if (!dateStr) return ''
  const d    = new Date(dateStr)
  const now  = new Date()
  const diff = Math.floor((now - d) / 86400000)
  if (diff === 0) return formatTime(d)
  if (diff === 1) return 'Yesterday'
  if (diff < 7)  return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

// ── STYLES ──────────────────────────────────────────────────
const S = {
  page:       { display:'flex', flexDirection:'column', height:'100vh', width:'100vw', overflow:'hidden' },
  topbar:     { height:52, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', zIndex:100 },
  main:       { display:'flex', flex:1, overflow:'hidden', padding:10, gap:10 },
  leftPanel:  { display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--panel-bg)', backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)', border:'0.5px solid var(--border)', borderRadius:16, boxShadow:'var(--shadow)' },
  rightPanel: { flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--panel-bg)', backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)', border:'0.5px solid var(--border)', borderRadius:16, boxShadow:'var(--shadow)' },
  iconBtn:    { width:34, height:34, borderRadius:'50%', border:'0.5px solid var(--input-border)', background:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-secondary)', transition:'all 0.2s', flexShrink:0 },
}

// ── LOADING SKELETON ─────────────────────────────────────────
function ConvSkeleton() {
  return (
    <div style={{ padding:'10px 8px', display:'flex', gap:10, alignItems:'center' }}>
      <div style={{ width:42, height:42, borderRadius:'50%', background:'var(--hover-bg)', flexShrink:0, animation:'pulse 1.5s infinite' }} />
      <div style={{ flex:1 }}>
        <div style={{ height:13, width:'60%', borderRadius:6, background:'var(--hover-bg)', marginBottom:8, animation:'pulse 1.5s infinite' }} />
        <div style={{ height:11, width:'80%', borderRadius:6, background:'var(--hover-bg)', animation:'pulse 1.5s infinite' }} />
      </div>
    </div>
  )
}

// ── ERROR STATE ──────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, padding:20 }}>
      <div style={{ fontSize:28 }}>⚠️</div>
      <div style={{ fontSize:14, color:'var(--text-secondary)', textAlign:'center', lineHeight:1.5 }}>{message}</div>
      <button onClick={onRetry} style={{
        display:'flex', alignItems:'center', gap:6,
        height:34, padding:'0 16px', background:'#007AFF', color:'#fff',
        border:'none', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer',
      }}>
        <RefreshIcon /> Retry
      </button>
    </div>
  )
}

// ── MAIN COMPONENT ───────────────────────────────────────────
export default function ChatPage() {
  const navigate   = useNavigate()
  const user       = useAuthStore((s) => s.user)
  const clearAuth  = useAuthStore((s) => s.clearAuth)
  const { theme, toggleDark } = useThemeStore()

  // ── state
  const [convs,      setConvs]      = useState([])
  const [messages,   setMessages]   = useState({})        // { convId: [msg, ...] }
  const [activeConv, setActiveConv] = useState(null)
  const [msgInput,   setMsgInput]   = useState('')
  const [search,     setSearch]     = useState('')
  const [tab,        setTab]        = useState('chats')

  // ── loading / error states
  const [convsLoading,  setConvsLoading]  = useState(true)
  const [convsError,    setConvsError]    = useState('')
  const [msgsLoading,   setMsgsLoading]   = useState(false)
  const [msgsError,     setMsgsError]     = useState('')
  const [sendLoading,   setSendLoading]   = useState(false)

  // ── mobile
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 768)
  const [showPanel,  setShowPanel]  = useState(true)

  // ── polling interval ref
  const pollRef        = useRef(null)
  const messagesEndRef = useRef(null)
  const textareaRef    = useRef(null)
  const activeConvRef  = useRef(null)   // keep latest activeConv in ref for polling

  // keep ref in sync
  useEffect(() => { activeConvRef.current = activeConv }, [activeConv])

  // ── resize listener
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  // ── scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeConv])

  // ══════════════════════════════════════════════════════════
  // REAL API: LOAD CONVERSATIONS
  // GET /api/conversations
  // ══════════════════════════════════════════════════════════
  // ── FIX: silent=true during polling — never flicker the UI
  const loadConversations = useCallback(async (silent = false) => {
    if (!silent) {
      setConvsLoading(true)
      setConvsError('')
    }
    try {
      const res = await api.get('/api/conversations')
      setConvs(prev => {
        // smart merge — only update state if data actually changed
        // this stops React from re-rendering the list on every poll
        const incoming = JSON.stringify(res.data)
        const current  = JSON.stringify(prev)
        if (incoming === current) return prev
        return res.data
      })
    } catch (err) {
      if (err.response?.status === 401) {
        clearAuth()
        navigate('/login')
        return
      }
      if (!silent) setConvsError('Failed to load conversations. Check your connection.')
    } finally {
      if (!silent) setConvsLoading(false)
    }
  }, [clearAuth, navigate])

  // load on mount
  useEffect(() => {
    loadConversations(false)
  }, [loadConversations])

  // ══════════════════════════════════════════════════════════
  // REAL API: LOAD MESSAGES — silent during polling
  // GET /api/messages/:convId
  // ══════════════════════════════════════════════════════════
  const loadMessages = useCallback(async (convId, silent = false) => {
    if (!silent) setMsgsLoading(true)
    setMsgsError('')
    try {
      const res = await api.get(`/api/messages/${convId}`)
      setMessages(prev => {
        // smart merge — only update if messages actually changed
        const incoming = JSON.stringify(res.data)
        const current  = JSON.stringify(prev[convId] || [])
        if (incoming === current) return prev
        return { ...prev, [convId]: res.data }
      })

      // mark as read only when user actively opens the chat (not on poll)
      if (!silent) {
        await api.put(`/api/messages/read/${convId}`)
        setConvs(prev => prev.map(c =>
          c.id === convId ? { ...c, unread: 0 } : c
        ))
      }
    } catch (err) {
      if (!silent) setMsgsError('Failed to load messages.')
    } finally {
      if (!silent) setMsgsLoading(false)
    }
  }, [])

  // ══════════════════════════════════════════════════════════
  // POLLING — every 4 seconds, always silent
  // No loading spinners, no flickering, no re-renders
  // unless data actually changed
  // ══════════════════════════════════════════════════════════
  useEffect(() => {
    pollRef.current = setInterval(() => {
      loadConversations(true)                         // silent conv refresh
      const conv = activeConvRef.current
      if (conv) loadMessages(conv.id, true)           // silent msg refresh
    }, 4000)

    return () => clearInterval(pollRef.current)
  }, [loadMessages, loadConversations])

  // ══════════════════════════════════════════════════════════
  // OPEN CONVERSATION
  // ══════════════════════════════════════════════════════════
  async function openConv(conv) {
    setActiveConv(conv)
    setMsgsError('')

    // on mobile — show right panel
    if (isMobile) setShowPanel(false)

    // load messages if not already loaded
    await loadMessages(conv.id)
  }

  // go back to list — mobile only
  function goBack() {
    setShowPanel(true)
    setActiveConv(null)
  }

  // ══════════════════════════════════════════════════════════
  // REAL API: SEND MESSAGE
  // POST /api/messages/send
  // ══════════════════════════════════════════════════════════
  async function sendMessage() {
    const text = msgInput.trim()
    if (!text || !activeConv || sendLoading) return

    // ── optimistic update — show message instantly
    const tempId  = 'tmp_' + Date.now()
    const tempMsg = {
      id:          tempId,
      senderId:    user?.id,
      receiverId:  activeConv.otherUserId,
      content:     text,
      createdAt:   new Date().toISOString(),
      isDelivered: false,
      isRead:      false,
    }
    setMessages(prev => ({
      ...prev,
      [activeConv.id]: [...(prev[activeConv.id] || []), tempMsg],
    }))
    setMsgInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    // update last message preview immediately
    setConvs(prev => prev.map(c =>
      c.id === activeConv.id
        ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() }
        : c
    ))

    setSendLoading(true)
    try {
      // real API call
      const res = await api.post('/api/messages/send', {
        conversationId: activeConv.id,
        content:        text,
      })

      // replace temp message with real one from server
      setMessages(prev => ({
        ...prev,
        [activeConv.id]: (prev[activeConv.id] || []).map(m =>
          m.id === tempId ? res.data : m
        ),
      }))
    } catch (err) {
      // remove failed temp message + show error
      setMessages(prev => ({
        ...prev,
        [activeConv.id]: (prev[activeConv.id] || []).filter(m => m.id !== tempId),
      }))
      setMsgInput(text)   // restore input so user can retry
      alert('Failed to send message. Please try again.')
    } finally {
      setSendLoading(false)
    }
  }

  // ══════════════════════════════════════════════════════════
  // REMOVE CONTACT
  // DELETE /api/contacts/:requestId
  // ══════════════════════════════════════════════════════════
  async function removeContact() {
    if (!activeConv) return
    if (!window.confirm(`Remove ${activeConv.otherUsername} from contacts?\nYou can still see old messages but can't send new ones.`)) return
    try {
      // find the requestId from contacts — you may need to store it in conv object
      // for now navigate to contacts page to manage
      navigate('/contacts')
    } catch (err) {
      alert('Failed to remove contact.')
    }
  }

  // ── auto resize textarea
  function handleMsgInput(val) {
    setMsgInput(val)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }

  // ── filter conversations by search
  const filteredConvs = convs.filter(c =>
    c.otherUsername?.toLowerCase().includes(search.toLowerCase()) ||
    c.otherUserPhone?.includes(search)
  )

  // ── current messages for active conv
  const currentMsgs = activeConv ? (messages[activeConv.id] || []) : []
  const myId        = user?.id

  // ── left panel width
  const leftWidth = isMobile ? '100%' : 300

  // ── RENDER ─────────────────────────────────────────────
  return (
    <div style={S.page}>

      {/* ── TOPBAR ── */}
      <div className="sk-topbar" style={S.topbar}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {isMobile && !showPanel && (
            <button onClick={goBack} style={{ ...S.iconBtn, border:'none' }}>
              <BackIcon />
            </button>
          )}
          <div style={{ fontSize:18, fontWeight:500, letterSpacing:'-0.3px' }}>
            <span style={{ color:'var(--text-primary)' }}>Skai</span>
            <span style={{ color:'#007AFF' }}> Chat</span>
          </div>
          {(!isMobile || showPanel) && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--input-bg)', border:'0.5px solid var(--input-border)', borderRadius:10, padding:'0 12px', height:34, width: isMobile ? 160 : 220 }}>
              <SearchIcon />
              <input
                style={{ border:'none', background:'transparent', outline:'none', fontSize:14, color:'var(--text-primary)', width:'100%', fontFamily:'inherit' }}
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {/* notification bell */}
          <div style={{ position:'relative' }}>
            <button style={S.iconBtn}><BellIcon /></button>
            {convs.some(c => c.unread > 0) && (
              <div style={{ position:'absolute', top:-2, right:-2, width:16, height:16, background:'#ff3b30', borderRadius:'50%', fontSize:9, fontWeight:700, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', border:'1.5px solid var(--bg)' }}>
                {convs.reduce((sum, c) => sum + (c.unread || 0), 0)}
              </div>
            )}
          </div>
          <button onClick={toggleDark} style={{ background:'none', border:'0.5px solid var(--input-border)', borderRadius:20, padding: isMobile ? '6px 10px' : '6px 12px', fontSize:12, color:'var(--text-primary)', cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
            <SunIcon />
            {!isMobile && (theme === 'dark' ? 'Dark' : 'Light')}
          </button>
          <div onClick={() => navigate('/profile')} style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#007AFF,#5856D6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'#fff', cursor:'pointer', flexShrink:0 }}>
            {getInitials(user?.username || '?')}
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={S.main}>

        {/* ── LEFT PANEL ── */}
        {(!isMobile || showPanel) && (
          <div style={{ ...S.leftPanel, width: leftWidth, flexShrink:0 }}>

            {/* tabs */}
            <div style={{ display:'flex', padding:'10px 10px 0', gap:4, flexShrink:0 }}>
              {['chats','contacts'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  flex:1, height:34, border:'none', borderRadius:8,
                  fontSize:13, fontWeight:500, cursor:'pointer',
                  background: tab === t ? 'var(--active-bg)' : 'none',
                  color:      tab === t ? '#007AFF' : 'var(--text-secondary)',
                  transition:'all 0.2s', textTransform:'capitalize',
                }}>
                  {t}
                </button>
              ))}
            </div>

            {/* search */}
            <div style={{ padding:'8px 10px', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--input-bg)', border:'0.5px solid var(--input-border)', borderRadius:10, padding:'0 10px', height:36 }}>
                <SearchIcon />
                <input
                  style={{ border:'none', background:'transparent', outline:'none', fontSize:13, color:'var(--text-primary)', width:'100%', fontFamily:'inherit' }}
                  placeholder={tab === 'chats' ? 'Search chats' : 'Search contacts'}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* conversation / contacts list */}
            <div style={{ flex:1, overflowY:'auto', padding:'4px 6px' }}>

              {/* loading skeletons */}
              {convsLoading && [1,2,3,4].map(i => <ConvSkeleton key={i} />)}

              {/* error state */}
              {!convsLoading && convsError && (
                <ErrorState message={convsError} onRetry={loadConversations} />
              )}

              {/* empty state */}
              {!convsLoading && !convsError && filteredConvs.length === 0 && (
                <div style={{ textAlign:'center', padding:24, fontSize:13, color:'var(--text-secondary)' }}>
                  {search ? `No results for "${search}"` : tab === 'chats' ? 'No conversations yet.\nAdd contacts to start chatting.' : 'No contacts yet.'}
                </div>
              )}

              {/* list items */}
              {!convsLoading && !convsError && filteredConvs.map(conv => (
                <div key={conv.id} onClick={() => openConv(conv)} style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'10px 8px', borderRadius:10, cursor:'pointer',
                  background: activeConv?.id === conv.id ? 'var(--active-bg)' : 'none',
                  transition:'background 0.15s',
                }}
                onMouseEnter={e => { if (activeConv?.id !== conv.id) e.currentTarget.style.background = 'var(--hover-bg)' }}
                onMouseLeave={e => { if (activeConv?.id !== conv.id) e.currentTarget.style.background = 'none' }}
                >
                  <div style={{ width:42, height:42, borderRadius:'50%', background: getAvatarColor(conv.otherUserId), display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:500, color:'#fff', flexShrink:0 }}>
                    {getInitials(conv.otherUsername)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:500, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{conv.otherUsername}</div>
                    <div style={{ fontSize:12, color:'var(--text-secondary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginTop:2 }}>{conv.lastMessage || 'No messages yet'}</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
                    <span style={{ fontSize:11, color:'var(--text-tertiary)' }}>{formatConvTime(conv.lastMessageAt)}</span>
                    {conv.unread > 0 && (
                      <div style={{ width:18, height:18, background:'#007AFF', borderRadius:'50%', fontSize:10, fontWeight:700, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>{conv.unread}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* bottom strip */}
            <div style={{ padding:'10px 12px', borderTop:'0.5px solid var(--border-mid)', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#007AFF,#5856D6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:'#fff', flexShrink:0 }}>
                {getInitials(user?.username || '?')}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.username || ''}</div>
                <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:1 }}>{user?.phoneNumber || ''}</div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={() => navigate('/settings')} style={S.iconBtn} title="Settings"><SettingsIcon /></button>
                <button onClick={() => navigate('/contacts')} style={S.iconBtn} title="Contacts"><ContactsIcon /></button>
              </div>
            </div>

          </div>
        )}

        {/* ── RIGHT PANEL ── */}
        {(!isMobile || !showPanel) && (
          <div style={S.rightPanel}>

            {activeConv ? (
              <>
                {/* chat header */}
                <div style={{ height:60, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', borderBottom:'0.5px solid var(--border-mid)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    {isMobile && (
                      <button onClick={goBack} style={{ ...S.iconBtn, border:'none', marginLeft:-8 }}>
                        <BackIcon />
                      </button>
                    )}
                    <div style={{ width:38, height:38, borderRadius:'50%', background: getAvatarColor(activeConv.otherUserId), display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:500, color:'#fff', flexShrink:0 }}>
                      {getInitials(activeConv.otherUsername)}
                    </div>
                    <div>
                      <div style={{ fontSize:15, fontWeight:500, color:'var(--text-primary)' }}>{activeConv.otherUsername}</div>
                      <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:1 }}>{activeConv.otherUserPhone}</div>
                    </div>
                  </div>
                  <button onClick={removeContact} style={{ height:30, padding: isMobile ? '0 10px' : '0 14px', background:'none', color:'#ff3b30', border:'0.5px solid rgba(255,59,48,0.3)', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
                    <RemoveUserIcon />
                    {!isMobile && 'Remove contact'}
                  </button>
                </div>

                {/* messages area */}
                <div style={{ flex:1, overflowY:'auto', padding: isMobile ? '16px 12px' : '20px', display:'flex', flexDirection:'column', gap:4 }}>

                  {/* messages loading */}
                  {msgsLoading && (
                    <div style={{ display:'flex', flexDirection:'column', gap:8, padding:'20px 0' }}>
                      {[1,2,3].map(i => (
                        <div key={i} style={{ display:'flex', justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start' }}>
                          <div style={{ height:40, width: 140 + i * 30, borderRadius:18, background:'var(--hover-bg)', animation:'pulse 1.5s infinite' }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* messages error */}
                  {!msgsLoading && msgsError && (
                    <ErrorState message={msgsError} onRetry={() => loadMessages(activeConv.id)} />
                  )}

                  {/* date divider */}
                  {!msgsLoading && currentMsgs.length > 0 && (
                    <div style={{ display:'flex', alignItems:'center', gap:10, margin:'10px 0' }}>
                      <div style={{ flex:1, height:'0.5px', background:'var(--border-mid)' }} />
                      <span style={{ fontSize:11, color:'var(--text-tertiary)', whiteSpace:'nowrap' }}>Today</span>
                      <div style={{ flex:1, height:'0.5px', background:'var(--border-mid)' }} />
                    </div>
                  )}

                  {/* no messages yet */}
                  {!msgsLoading && !msgsError && currentMsgs.length === 0 && (
                    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
                      <div style={{ fontSize:28 }}>👋</div>
                      <div style={{ fontSize:14, color:'var(--text-secondary)' }}>
                        Say hello to {activeConv.otherUsername}!
                      </div>
                    </div>
                  )}

                  {/* actual messages */}
                  {!msgsLoading && currentMsgs.map(msg => {
                    const isMine = msg.senderId === myId
                    const isTemp = String(msg.id).startsWith('tmp_')
                    return (
                      <div key={msg.id} style={{ display:'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom:2 }}>
                        <div style={{
                          maxWidth:       isMobile ? '80%' : '65%',
                          padding:        '10px 14px',
                          borderRadius:   18,
                          borderBottomRightRadius: isMine ? 4 : 18,
                          borderBottomLeftRadius:  isMine ? 18 : 4,
                          background:     isMine ? '#007AFF' : 'var(--recv-bubble)',
                          color:          isMine ? '#fff' : 'var(--text-primary)',
                          border:         isMine ? 'none' : '0.5px solid var(--border-mid)',
                          fontSize:       14,
                          lineHeight:     1.5,
                          wordBreak:      'break-word',
                          opacity:        isTemp ? 0.7 : 1,
                          transition:     'opacity 0.3s',
                        }}>
                          {msg.content}
                          <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:4, justifyContent:'flex-end' }}>
                            <span style={{ fontSize:10, opacity:0.7 }}>
                              {isTemp ? '...' : formatTime(msg.createdAt)}
                            </span>
                            {isMine && !isTemp && (
                              <span style={{
                                fontSize: 11,
                                color: msg.isRead ? '#a8d8ff' : 'rgba(255,255,255,0.7)',
                              }}>
                                {msg.isRead ? '✓✓' : msg.isDelivered ? '✓✓' : '✓'}
                              </span>
                            )}
                            {isMine && isTemp && (
                              <span style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  <div ref={messagesEndRef} />
                </div>

                {/* input area */}
                <div style={{ padding: isMobile ? '10px 12px' : '12px 16px', borderTop:'0.5px solid var(--border-mid)', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                  <div style={{ flex:1, display:'flex', alignItems:'center', background:'var(--input-bg)', border:'0.5px solid var(--input-border)', borderRadius:12, padding:'0 14px', minHeight:44 }}>
                    <textarea
                      ref={textareaRef}
                      value={msgInput}
                      onChange={e => handleMsgInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                      placeholder="Type a message..."
                      rows={1}
                      style={{ flex:1, border:'none', background:'transparent', outline:'none', fontSize:15, color:'var(--text-primary)', fontFamily:'inherit', resize:'none', maxHeight:120, lineHeight:1.5, padding:'10px 0' }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!msgInput.trim() || sendLoading}
                    style={{
                      height:44, padding:'0 18px',
                      background: (msgInput.trim() && !sendLoading) ? '#007AFF' : 'var(--input-border)',
                      color:'#fff', border:'none', borderRadius:12,
                      fontSize:14, fontWeight:500,
                      cursor: (msgInput.trim() && !sendLoading) ? 'pointer' : 'not-allowed',
                      display:'flex', alignItems:'center', gap:6, flexShrink:0,
                      transition:'background 0.2s',
                    }}
                  >
                    {sendLoading
                      ? <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                      : <>{!isMobile && 'Send'}<SendIcon /></>
                    }
                  </button>
                </div>
              </>
            ) : (
              /* empty state */
              <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--active-bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={24} d={<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>} style={{ color:'#007AFF' }} />
                </div>
                <div style={{ fontSize:16, fontWeight:500, color:'var(--text-primary)' }}>Your messages</div>
                <div style={{ fontSize:13, color:'var(--text-secondary)', textAlign:'center', maxWidth:220, lineHeight:1.5 }}>
                  {convsLoading ? 'Loading...' : convs.length === 0 ? 'Add contacts to start chatting' : 'Select a conversation to start chatting'}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ── PULSE ANIMATION ── */}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin   { to{transform:rotate(360deg)} }
      `}</style>

    </div>
  )
}