import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { auth, db } from '../utils/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const MOODS = [
  { id: 'great',      emoji: '😄', label: 'Great',      sub: 'Feeling wonderful' },
  { id: 'good',       emoji: '🙂', label: 'Good',       sub: 'Pretty okay today' },
  { id: 'okay',       emoji: '😐', label: 'Okay',       sub: 'Just getting by' },
  { id: 'low',        emoji: '😔', label: 'Low',        sub: 'Feeling a bit down' },
  { id: 'struggling', emoji: '😢', label: 'Struggling', sub: "It's a tough day" },
]

const NAV = [
  { label: 'Home',     to: '/',             icon: HomeIcon },
  { label: 'Mood',     to: '/mood-records', icon: MoodIcon },
  { label: 'Meditate', to: '/meditate',     icon: MeditateIcon },
  { label: 'Chat',     to: '/chat',     icon: ChatIcon },
]

export default function MoodCheckIn() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [selected, setSelected] = useState(null)
  const [note,     setNote]     = useState('')
  const [saved,    setSaved]    = useState(false)
  const [loading,  setLoading]  = useState(false)

  async function handleSave() {
    if (!selected || !auth.currentUser) return
    
    setLoading(true)
    try {
      const moodData = MOODS.find(m => m.id === selected)
      await addDoc(collection(db, 'moods', auth.currentUser.uid, 'entries'), {
        mood: moodData.label,
        emoji: moodData.emoji,
        note: note.trim(),
        timestamp: serverTimestamp()
      })
      setSaved(true)
      setTimeout(() => navigate('/mood-records'), 1200)
    } catch (err) {
      console.error('Error saving mood:', err)
      alert('Failed to save mood. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#FFF8F0' }}>

      {/* ── Scrollable body ──────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-5 pt-10 pb-32">

        {/* Back arrow */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 mb-7 active:opacity-60 transition-opacity"
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#2D2D2D" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm font-medium" style={{ color: '#2D2D2D' }}>Back</span>
        </button>

        {/* Heading */}
        <h1 className="font-bold leading-snug mb-1" style={{ fontSize: 24, color: '#2D2D2D' }}>
          How's your mind today?
        </h1>
        <p className="text-sm mb-7" style={{ color: '#7A7A7A' }}>
          No right or wrong answer, just honest
        </p>

        {/* ── Mood cards ──────────────────────────────────────── */}
        <div className="space-y-3">
          {MOODS.map((mood) => {
            const active = selected === mood.id
            return (
              <button
                key={mood.id}
                onClick={() => setSelected(mood.id)}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-200 active:scale-[0.98]"
                style={{
                  backgroundColor: active ? '#7C9E87' : '#FFFFFF',
                  boxShadow: active
                    ? '0 4px 16px rgba(124,158,135,0.30)'
                    : '0 2px 10px rgba(0,0,0,0.07)',
                  transform: active ? 'scale(1)' : undefined,
                }}
              >
                {/* Emoji bubble */}
                <span
                  className="flex items-center justify-center w-12 h-12 rounded-full shrink-0 text-2xl"
                  style={{
                    backgroundColor: active ? 'rgba(255,255,255,0.22)' : '#FFF3E8',
                  }}
                >
                  {mood.emoji}
                </span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-base leading-none"
                    style={{ color: active ? '#FFFFFF' : '#2D2D2D' }}
                  >
                    {mood.label}
                  </p>
                  <p
                    className="text-xs mt-1 leading-none"
                    style={{ color: active ? 'rgba(255,255,255,0.80)' : '#9A9A9A' }}
                  >
                    {mood.sub}
                  </p>
                </div>

                {/* Selection indicator */}
                <span
                  className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center"
                  style={{
                    borderColor: active ? '#FFFFFF' : '#D9D9D9',
                    backgroundColor: active ? '#FFFFFF' : 'transparent',
                  }}
                >
                  {active && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#7C9E87" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Optional note (slides in after mood picked) ─────── */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: selected ? 160 : 0, opacity: selected ? 1 : 0, marginTop: selected ? 20 : 0 }}
        >
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind? (optional)"
            rows={3}
            className="w-full rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
              color: '#2D2D2D',
            }}
          />
        </div>

        {/* ── Save button ─────────────────────────────────────── */}
        <button
          onClick={handleSave}
          disabled={!selected || saved || loading}
          className="mt-6 w-full py-4 rounded-2xl font-semibold text-base text-white transition-all duration-200 active:scale-95"
          style={{
            backgroundColor: selected ? '#7C9E87' : '#C8D8CC',
            boxShadow: selected ? '0 6px 20px rgba(124,158,135,0.35)' : 'none',
          }}
        >
          {loading ? 'Saving...' : saved ? '✓ Mood Saved!' : 'Save My Mood'}
        </button>

      </main>

      {/* ── Bottom Navigation ─────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-4 py-3 border-t"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#F0E6DC' }}
      >
        {NAV.map(({ label, to, icon: Icon }) => {
          const active = location.pathname === to
          return (
            <Link key={label} to={to}
              className="flex flex-col items-center gap-1 min-w-[56px] transition-opacity duration-150"
            >
              <Icon active={active} />
              <span className="text-xs font-medium" style={{ color: active ? '#7C9E87' : '#AAAAAA' }}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

/* ── SVG nav icons (shared palette) ─────────────────────── */

function HomeIcon({ active }) {
  const c = active ? '#7C9E87' : '#BBBBBB'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
            stroke={c} strokeWidth="2" strokeLinejoin="round"
            fill={active ? '#7C9E87' : 'none'} fillOpacity={active ? 0.15 : 0}/>
      <path d="M9 21V12h6v9" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function MoodIcon({ active }) {
  const c = active ? '#7C9E87' : '#BBBBBB'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2"
              fill={active ? '#7C9E87' : 'none'} fillOpacity={active ? 0.1 : 0}/>
      <path d="M8.5 14.5s1 2 3.5 2 3.5-2 3.5-2" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="9"  cy="10" r="1.2" fill={c}/>
      <circle cx="15" cy="10" r="1.2" fill={c}/>
    </svg>
  )
}
function MeditateIcon({ active }) {
  const c = active ? '#7C9E87' : '#BBBBBB'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="2" stroke={c} strokeWidth="2"/>
      <path d="M5 13c2-3 3.5-4 7-4s5 1 7 4"   stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M3 17c3-2 5-2 9-2s6 0 9 2"      stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function ChatIcon({ active }) {
  const c = active ? '#7C9E87' : '#BBBBBB'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M20 2H4a1 1 0 00-1 1v13a1 1 0 001 1h3l3 4 3-4h7a1 1 0 001-1V3a1 1 0 00-1-1z"
            stroke={c} strokeWidth="2" strokeLinejoin="round"
            fill={active ? '#7C9E87' : 'none'} fillOpacity={active ? 0.1 : 0}/>
      <path d="M8 9h8M8 13h5" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
