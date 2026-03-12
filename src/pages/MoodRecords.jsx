import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { auth, db } from '../utils/firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'

/* ── Helpers ────────────────────────────────────────────── */
const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Returns the Monday of the week containing `date` */
function getMonday(date) {
  const d   = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function buildWeek(today) {
  const monday = getMonday(today)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return {
      date:  d,
      abbr:  DAY_ABBR[d.getDay()],
      num:   d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
    }
  })
}

function moodForDate(date, entries) {
  return entries.find(
    (e) => e.date.toDateString() === date.toDateString()
  )
}

function dateLabel(date, now) {
  const diff = Math.round(
    (new Date(now.toDateString()).getTime() - new Date(date.toDateString()).getTime())
      / 86400000
  )
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return `${diff} days ago`
}

function getMoodColor(moodLabel) {
  const colors = {
    'Great': '#7C9E87',
    'Good': '#A3B18A',
    'Okay': '#A8B8C8',
    'Low': '#E8956D',
    'Struggling': '#C46D5E'
  }
  return colors[moodLabel] || '#7C9E87'
}

/* ── Nav items ──────────────────────────────────────────── */
const NAV = [
  { label: 'Home',     to: '/',             icon: HomeIcon },
  { label: 'Mood',     to: '/mood-records', icon: MoodIcon },
  { label: 'Meditate', to: '/meditate',     icon: MeditateIcon },
  { label: 'Chat',     to: '/chat',         icon: ChatIcon },
]

/* ══ Main component ═════════════════════════════════════════ */
export default function MoodRecords() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const WEEK = buildWeek(now)

  useEffect(() => {
    if (!auth.currentUser) return
    
    // Listen to real-time updates from Firestore
    const q = query(
      collection(db, 'moods', auth.currentUser.uid, 'entries'),
      orderBy('timestamp', 'desc')
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => {
        const data = doc.data()
        const date = data.timestamp ? data.timestamp.toDate() : new Date()
        return {
          id: doc.id,
          date: date,
          timeLabel: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          emoji: data.emoji,
          label: data.mood,
          note: data.note,
          color: getMoodColor(data.mood)
        }
      })
      setEntries(fetched)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const hasEntries = entries.length > 0

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#FFF8F0' }}>

      {/* ── Scrollable body ─────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-28 px-5 pt-12">

        {/* Header */}
        <h1 className="font-bold leading-tight" style={{ fontSize: 24, color: '#2D2D2D' }}>
          My Mood Journey
        </h1>
        <p className="mt-1 text-sm mb-6" style={{ color: '#7A7A7A' }}>
          Your emotional history
        </p>

        {/* ── Weekly strip ────────────────────────────────────── */}
        <WeekStrip 
          week={WEEK} 
          entries={entries} 
          onDayClick={(logged) => {
            if (logged) {
              document.getElementById('entry-' + logged.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            } else {
              navigate('/mood-checkin')
            }
          }}
        />

        {/* ── Content ─────────────────────────────────────────── */}
        <div className="mt-6">
          {loading ? (
             <p className="text-center mt-10" style={{color: '#7A7A7A'}}>Loading your journey...</p>
          ) : hasEntries ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                 style={{ color: '#B0A898' }}>
                Recent Moods
              </p>
              <div className="space-y-3">
                {entries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} now={now} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState onCheckIn={() => navigate('/mood-checkin')} />
          )}
        </div>

      </main>

      {/* ── Bottom Navigation ───────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-4 py-3 border-t bg-white"
        style={{ borderColor: '#F0E6DC' }}
      >
        {NAV.map(({ label, to, icon: Icon }) => {
          const active = location.pathname === to
          return (
            <Link key={label} to={to}
              className="flex flex-col items-center gap-1 min-w-[56px]"
            >
              <Icon active={active} />
              <span className="text-xs font-medium"
                    style={{ color: active ? '#7C9E87' : '#AAAAAA' }}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

/* ── Weekly Strip ───────────────────────────────────────── */
function WeekStrip({ week, entries, onDayClick }) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {week.map(({ date, abbr, num, isToday }) => {
        const logged = moodForDate(date, entries)
        const highlight = isToday || logged
        
        return (
          <div
            key={date.toISOString()}
            onClick={() => onDayClick(logged)}
            className="flex flex-col items-center shrink-0 rounded-2xl px-3 py-3 transition-all duration-200 cursor-pointer hover:opacity-80 active:scale-95"
            style={{
              minWidth: 52,
              backgroundColor: isToday
                ? 'rgba(124,158,135,0.10)'
                : '#FFFFFF',
              border: `2px solid ${highlight ? '#7C9E87' : 'transparent'}`,
              boxShadow: isToday
                ? '0 2px 12px rgba(124,158,135,0.18)'
                : '0 1px 6px rgba(0,0,0,0.06)',
            }}
          >
            {/* Day abbr */}
            <span
              className="text-xs font-semibold mb-1"
              style={{ color: isToday ? '#7C9E87' : '#AAAAAA' }}
            >
              {abbr}
            </span>

            {/* Date number */}
            <span
              className="text-sm font-bold mb-2"
              style={{ color: isToday ? '#2D2D2D' : '#6A6A6A' }}
            >
              {num}
            </span>

            {/* Mood emoji or empty ring */}
            {logged ? (
              <span
                className="flex items-center justify-center w-8 h-8 rounded-full text-lg"
                style={{ backgroundColor: 'rgba(124,158,135,0.12)' }}
              >
                {logged.emoji}
              </span>
            ) : (
              <span
                className="w-8 h-8 rounded-full border-2"
                style={{ borderColor: '#E8E0D8', borderStyle: 'dashed' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Entry card ─────────────────────────────────────────── */
function EntryCard({ entry, now }) {
  const relLabel = dateLabel(entry.date, now)

  return (
    <div
      id={`entry-${entry.id}`}
      className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-white transition-all"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
    >
      {/* Emoji bubble */}
      <span
        className="flex items-center justify-center w-14 h-14 rounded-2xl shrink-0 text-3xl"
        style={{ backgroundColor: `${entry.color}18` }}
      >
        {entry.emoji}
      </span>

      {/* Centre info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-base" style={{ color: '#2D2D2D' }}>
            {entry.label}
          </span>
          {/* Mood colour pip */}
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
        </div>
        <p className="text-xs" style={{ color: '#9A9A9A' }}>
          {relLabel} · {entry.timeLabel}
        </p>
        {entry.note && (
          <p
            className="text-xs mt-1.5 leading-snug truncate"
            style={{ color: '#7A7A7A' }}
          >
            "{entry.note}"
          </p>
        )}
      </div>

      {/* Chevron hint */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M9 18l6-6-6-6" stroke="#D0C8C0" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

/* ── Empty state ────────────────────────────────────────── */
function EmptyState({ onCheckIn }) {
  return (
    <div className="flex flex-col items-center justify-center text-center pt-16 pb-8">
      <span
        className="flex items-center justify-center rounded-full mb-5 text-4xl"
        style={{
          width: 100, height: 100,
          backgroundColor: 'rgba(124,158,135,0.10)',
        }}
      >
        🌱
      </span>
      <p className="font-bold text-lg mb-1" style={{ color: '#2D2D2D' }}>
        No moods logged yet
      </p>
      <p className="text-sm mb-8" style={{ color: '#7A7A7A' }}>
        Start by checking in today
      </p>
      <button
        onClick={onCheckIn}
        className="px-8 py-3 rounded-2xl font-semibold text-sm text-white active:scale-95 transition-transform"
        style={{
          backgroundColor: '#7C9E87',
          boxShadow: '0 6px 18px rgba(124,158,135,0.35)',
        }}
      >
        Check In Now
      </button>
    </div>
  )
}

/* ── SVG nav icons ──────────────────────────────────────── */
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
      <path d="M5 13c2-3 3.5-4 7-4s5 1 7 4"  stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M3 17c3-2 5-2 9-2s6 0 9 2"    stroke={c} strokeWidth="2" strokeLinecap="round"/>
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
