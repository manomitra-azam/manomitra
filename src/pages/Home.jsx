import { Link, useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Home',     icon: HomeIcon,     to: '/' },
  { label: 'Mood',     icon: MoodIcon,     to: '/mood-records' },
  { label: 'Meditate', icon: MeditateIcon, to: '/meditate' },
  { label: 'Chat',     icon: ChatIcon,     to: '/chat' },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function Home() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const fullName  = localStorage.getItem('userName') || ''
  const firstName = fullName.split(' ')[0]

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#FFF8F0' }}>
      {/* ── Scrollable content ─────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-5 pt-12 pb-28 space-y-4">

        {/* Greeting */}
        <div className="mb-2">
          <h1 className="font-bold leading-tight" style={{ fontSize: 24, color: '#1A1A1A' }}>
            {getGreeting()}{firstName ? `, ${firstName}` : ''} 👋
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#7A7A7A' }}>
            How are you feeling today?
          </p>
        </div>

        {/* ── Check In card ──────────────────────────────────── */}
        <button
          onClick={() => navigate('/mood-checkin')}
          className="w-full rounded-3xl p-6 text-left active:scale-95 transition-transform duration-150 shadow-sm"
          style={{ backgroundColor: '#E8956D' }}
        >
          <span
            className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
          >
            <span style={{ fontSize: 20 }}>✨</span>
          </span>
          <p className="text-white font-bold text-xl leading-snug">Check In</p>
          <p className="text-white text-sm mt-1" style={{ opacity: 0.85 }}>
            Track today's mood
          </p>
        </button>

        {/* ── Two equal cards ────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Meditate */}
          <button
            onClick={() => navigate('/meditate')}
            className="rounded-3xl p-5 text-left active:scale-95 transition-transform duration-150 shadow-sm"
            style={{ backgroundColor: '#7C9E87' }}
          >
            <span className="block text-2xl mb-3">🧘</span>
            <p className="text-white font-semibold text-base leading-snug">Meditate</p>
            <p className="text-white text-xs mt-1" style={{ opacity: 0.8 }}>
              Clear your mind
            </p>
          </button>

          {/* Talk to Mitra */}
          <button
            onClick={() => navigate('/chat')}
            className="rounded-3xl p-5 text-left active:scale-95 transition-transform duration-150 shadow-sm"
            style={{ backgroundColor: '#7C9E87' }}
          >
            <span className="block text-2xl mb-3">💬</span>
            <p className="text-white font-semibold text-base leading-snug">Talk to Mitra</p>
            <p className="text-white text-xs mt-1" style={{ opacity: 0.8 }}>
              Share how you feel
            </p>
          </button>
        </div>

        {/* ── Daily thought card ─────────────────────────────── */}
        <div
          className="rounded-2xl px-5 py-4 border-l-4"
          style={{
            backgroundColor: '#FFF3E6',
            borderLeftColor: '#E8956D',
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#E8956D' }}>
            Daily Thought
          </p>
          <p className="text-sm leading-relaxed font-medium" style={{ color: '#3D3D3D' }}>
            "You don't have to be positive all the time 🌿"
          </p>
        </div>

      </main>

      {/* ── Bottom Navigation ──────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-4 py-3 border-t"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#F0E6DC' }}
      >
        {navItems.map(({ label, icon: Icon, to }) => {
          const active = location.pathname === to
          return (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center gap-1 min-w-[56px] transition-opacity duration-150"
            >
              <Icon active={active} />
              <span
                className="text-xs font-medium"
                style={{ color: active ? '#7C9E87' : '#AAAAAA' }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

/* ── SVG Icons ───────────────────────────────────────────── */

function HomeIcon({ active }) {
  const c = active ? '#7C9E87' : '#BBBBBB'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke={c} strokeWidth="2" strokeLinejoin="round" fill={active ? '#7C9E87' : 'none'} fillOpacity={active ? 0.15 : 0} />
      <path d="M9 21V12h6v9" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MoodIcon({ active }) {
  const c = active ? '#7C9E87' : '#BBBBBB'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2" fill={active ? '#7C9E87' : 'none'} fillOpacity={active ? 0.1 : 0} />
      <path d="M8.5 14.5s1 2 3.5 2 3.5-2 3.5-2" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="10" r="1.2" fill={c} />
      <circle cx="15" cy="10" r="1.2" fill={c} />
    </svg>
  )
}

function MeditateIcon({ active }) {
  const c = active ? '#7C9E87' : '#BBBBBB'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="2" stroke={c} strokeWidth="2" />
      <path d="M5 13c2-3 3.5-4 7-4s5 1 7 4" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path d="M3 17c3-2 5-2 9-2s6 0 9 2" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ChatIcon({ active }) {
  const c = active ? '#7C9E87' : '#BBBBBB'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M20 2H4a1 1 0 00-1 1v13a1 1 0 001 1h3l3 4 3-4h7a1 1 0 001-1V3a1 1 0 00-1-1z" stroke={c} strokeWidth="2" strokeLinejoin="round" fill={active ? '#7C9E87' : 'none'} fillOpacity={active ? 0.1 : 0} />
      <path d="M8 9h8M8 13h5" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
