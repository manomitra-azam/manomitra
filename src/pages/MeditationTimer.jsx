import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import meditationMusic from '../sounds/meditation.mp3'

/* ── Constants ──────────────────────────────────────────── */
const DURATIONS = [
  { label: '5 min', seconds: 5 * 60 },
  { label: '10 min', seconds: 10 * 60 },
  { label: '15 min', seconds: 15 * 60 },
]

const CIRCLE_R = 96
const CIRCLE_CX = 120
const CIRCLE_CY = 120
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R   // ≈ 603.19

const NAV = [
  { label: 'Home', to: '/', icon: HomeIcon },
  { label: 'Mood', to: '/mood-records', icon: MoodIcon },
  { label: 'Meditate', to: '/meditate', icon: MeditateIcon },
  { label: 'Chat', to: '/chat', icon: ChatIcon },
]

/* ── Helpers ────────────────────────────────────────────── */
function fmt(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return `${m}:${s}`
}

/* ── Component ──────────────────────────────────────────── */
export default function MeditationTimer() {
  const navigate = useNavigate()
  const location = useLocation()

  const [durationIdx, setDurationIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATIONS[0].seconds)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [musicOn, setMusicOn] = useState(true)

  const intervalRef = useRef(null)
  const audioRef = useRef(null)
  const totalSeconds = DURATIONS[durationIdx].seconds
  const progress = timeLeft / totalSeconds               // 1 → 0
  const dashOffset = CIRCUMFERENCE * (1 - progress)       // 0 → full

  useEffect(() => {
    return () => { 
      if (audioRef.current) {
        audioRef.current.pause() 
      }
    }
  }, [])

  /* ── Timer tick ─────────────────────────────────────────── */
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            setFinished(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  /* ── Duration change resets everything ─────────────────── */
  function selectDuration(idx) {
    clearInterval(intervalRef.current)
    setDurationIdx(idx)
    setTimeLeft(DURATIONS[idx].seconds)
    setRunning(false)
    setFinished(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  /* ── Reset ──────────────────────────────────────────────── */
  function handleReset() {
    clearInterval(intervalRef.current)
    setTimeLeft(DURATIONS[durationIdx].seconds)
    setRunning(false)
    setFinished(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  /* ── Toggle begin / pause ───────────────────────────────── */
  function handleToggle() {
    if (finished) { handleReset(); return }
    
    if (!running) {
      if (!audioRef.current) {
        const audio = new Audio(meditationMusic);
        audio.loop = true;
        audio.volume = 0.5;
        audioRef.current = audio;
      }
      if (musicOn) {
        audioRef.current.play().catch(err => console.log(err));
      }
      setRunning(true);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setRunning(false);
    }
  }

  const btnLabel = finished ? 'Session Complete 🎉' : running ? 'Pause Session' : 'Begin Session'

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#FFF8F0' }}>

      {/* ── Scrollable body ─────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-5 pt-10 pb-32">

        {/* Back arrow */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 mb-7 active:opacity-60 transition-opacity"
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#2D2D2D" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-medium" style={{ color: '#2D2D2D' }}>Back</span>
        </button>

        {/* Heading */}
        <h1 className="font-bold mb-1 leading-snug" style={{ fontSize: 24, color: '#2D2D2D' }}>
          Take a Breath
        </h1>
        <p className="text-sm mb-10" style={{ color: '#7A7A7A' }}>
          A few minutes for your mind 🌿
        </p>

        {/* ── Circle timer ────────────────────────────────────── */}
        <div className="flex justify-center mb-8">
          <div
            className="relative flex items-center justify-center"
            style={{
              width: 240, height: 240,
              filter: running
                ? 'drop-shadow(0 0 24px rgba(124,158,135,0.55))'
                : 'drop-shadow(0 0 12px rgba(124,158,135,0.25))',
              transition: 'filter 0.6s ease',
            }}
          >
            {/* Music Toggle */}
            <button
              onClick={() => {
                if (audioRef.current) {
                  if (musicOn) {
                    audioRef.current.pause();
                  } else if (running) {
                    audioRef.current.play().catch(e => console.log(e));
                  }
                }
                setMusicOn(!musicOn);
              }}
              className="absolute text-xl transition-transform active:scale-95 z-10"
              style={{ top: 0, right: 0, color: '#7C9E87' }}
              aria-label="Toggle music"
            >
              {musicOn ? '🔊' : '🔇'}
            </button>

            <svg
              width="240" height="240"
              viewBox="0 0 240 240"
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              {/* Background track */}
              <circle
                cx={CIRCLE_CX} cy={CIRCLE_CY} r={CIRCLE_R}
                fill="none"
                stroke="#E9F0EC"
                strokeWidth="10"
              />
              {/* Progress arc */}
              <circle
                cx={CIRCLE_CX} cy={CIRCLE_CY} r={CIRCLE_R}
                fill="none"
                stroke="#7C9E87"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 120 120)"
                style={{ transition: running ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.4s ease' }}
              />
            </svg>

            {/* Centre content */}
            <div className="relative flex flex-col items-center justify-center select-none">
              {/* Breathing label */}
              <span
                className="text-xs font-semibold uppercase tracking-widest mb-1"
                style={{
                  color: '#7C9E87',
                  opacity: running ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                }}
              >
                Breathing
              </span>

              {/* Countdown */}
              <span
                className="font-bold tabular-nums"
                style={{
                  fontSize: 44,
                  color: finished ? '#7C9E87' : '#2D2D2D',
                  letterSpacing: '-1px',
                  transition: 'color 0.4s ease',
                }}
              >
                {finished ? '✓' : fmt(timeLeft)}
              </span>

              {/* Sub-label */}
              <span className="text-xs mt-1" style={{ color: '#9A9A9A' }}>
                {finished ? 'Well done!' : running ? 'remaining' : 'ready'}
              </span>

              {/* Pulse ring when running */}
              {running && (
                <span
                  className="absolute rounded-full"
                  style={{
                    width: 200, height: 200,
                    border: '2px solid rgba(124,158,135,0.3)',
                    animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Duration pills ──────────────────────────────────── */}
        <div className="flex justify-center gap-3 mb-8">
          {DURATIONS.map((d, i) => {
            const active = durationIdx === i
            return (
              <button
                key={d.label}
                onClick={() => selectDuration(i)}
                disabled={running}
                className="px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200 active:scale-95 disabled:opacity-40"
                style={{
                  backgroundColor: active ? '#7C9E87' : '#FFFFFF',
                  borderColor: '#7C9E87',
                  color: active ? '#FFFFFF' : '#7C9E87',
                  boxShadow: active ? '0 4px 12px rgba(124,158,135,0.30)' : 'none',
                }}
              >
                {d.label}
              </button>
            )
          })}
        </div>

        {/* ── Begin / Pause button ────────────────────────────── */}
        <button
          onClick={handleToggle}
          className="w-full py-4 rounded-2xl font-semibold text-base text-white transition-all duration-200 active:scale-95 mb-3"
          style={{
            backgroundColor: finished ? '#E8956D' : '#7C9E87',
            boxShadow: `0 6px 20px rgba(${finished ? '232,149,109' : '124,158,135'},0.35)`,
          }}
        >
          {btnLabel}
        </button>

        {/* ── Reset link ──────────────────────────────────────── */}
        <div className="flex justify-center">
          <button
            onClick={handleReset}
            className="text-sm font-medium py-1 px-4 transition-opacity active:opacity-50"
            style={{ color: '#7A7A7A' }}
          >
            Reset
          </button>
        </div>

        {/* ── Motivational caption ────────────────────────────── */}
        <p
          className="text-center text-xs mt-8"
          style={{ color: '#7A7A7A' }}
        >
          Even 5 minutes makes a difference
        </p>

      </main>

      {/* ── Bottom Navigation ───────────────────────────────── */}
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

      {/* ── Pulse keyframe ──────────────────────────────────── */}
      <style>{`
        @keyframes ping {
          0%   { transform: scale(1);    opacity: 0.6; }
          70%  { transform: scale(1.18); opacity: 0; }
          100% { transform: scale(1.18); opacity: 0; }
        }
      `}</style>

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
        fill={active ? '#7C9E87' : 'none'} fillOpacity={active ? 0.15 : 0} />
      <path d="M9 21V12h6v9" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function MoodIcon({ active }) {
  const c = active ? '#7C9E87' : '#BBBBBB'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2"
        fill={active ? '#7C9E87' : 'none'} fillOpacity={active ? 0.1 : 0} />
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
      <path d="M20 2H4a1 1 0 00-1 1v13a1 1 0 001 1h3l3 4 3-4h7a1 1 0 001-1V3a1 1 0 00-1-1z"
        stroke={c} strokeWidth="2" strokeLinejoin="round"
        fill={active ? '#7C9E87' : 'none'} fillOpacity={active ? 0.1 : 0} />
      <path d="M8 9h8M8 13h5" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
