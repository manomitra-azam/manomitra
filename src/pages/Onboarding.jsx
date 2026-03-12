import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../utils/firebase'
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'

/* ── Mood data (shared with MoodCheckIn) ────────────────── */
const MOODS = [
  { id: 'great',      emoji: '😄', label: 'Great',      sub: 'Feeling wonderful' },
  { id: 'good',       emoji: '🙂', label: 'Good',       sub: 'Pretty okay today' },
  { id: 'okay',       emoji: '😐', label: 'Okay',       sub: 'Just getting by' },
  { id: 'low',        emoji: '😔', label: 'Low',        sub: 'Feeling a bit down' },
  { id: 'struggling', emoji: '😢', label: 'Struggling', sub: "It's a tough day" },
]

/* ── Root component ──────────────────────────────────────── */
export default function Onboarding() {
  const navigate   = useNavigate()
  const [step,     setStep]   = useState(1)
  const [name,     setName]   = useState('')
  const [mood,     setMood]   = useState(null)
  const [fading,   setFading] = useState(false)

  /* Crossfade transition between steps */
  function advance(nextStep) {
    setFading(true)
    setTimeout(() => { setStep(nextStep); setFading(false) }, 220)
  }

  const [loading,  setLoading] = useState(false)

  async function handleFinish() {
    if (!auth.currentUser || loading) return
    setLoading(true)

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid)
      await setDoc(userRef, {
        name: name.trim(),
        email: auth.currentUser.email,
        createdAt: serverTimestamp()
      }, { merge: true })

      if (mood) {
        const moodData = MOODS.find(m => m.id === mood)
        if (moodData) {
          await addDoc(collection(db, 'moods', auth.currentUser.uid, 'entries'), {
            mood: moodData.label,
            emoji: moodData.emoji,
            note: 'First check-in from onboarding',
            timestamp: serverTimestamp()
          })
        }
      }

      localStorage.setItem('userName', name.trim())
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Error saving profile:', err)
      alert('Failed to save your profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex flex-col min-h-dvh px-6 pt-10 pb-8"
      style={{ backgroundColor: '#FFF8F0' }}
    >
      {/* ── Progress dots ─────────────────────────────────── */}
      <div className="flex justify-center items-center gap-2 mb-12">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className="rounded-full transition-all duration-400 ease-in-out"
            style={{
              height: 8,
              width: s === step ? 28 : 8,
              backgroundColor: s <= step ? '#7C9E87' : '#D9D9D9',
            }}
          />
        ))}
      </div>

      {/* ── Animated step container ───────────────────────── */}
      <div
        className="flex-1 flex flex-col transition-all duration-200"
        style={{ opacity: fading ? 0 : 1, transform: fading ? 'translateY(8px)' : 'translateY(0)' }}
      >
        {step === 1 && <Screen1 onNext={() => advance(2)} />}
        {step === 2 && <Screen2 name={name} setName={setName} onNext={() => advance(3)} />}
        {step === 3 && <Screen3 name={name} mood={mood} setMood={setMood} onFinish={handleFinish} loading={loading} />}
      </div>
    </div>
  )
}

/* ══ Screen 1 — Welcome ═══════════════════════════════════ */
function Screen1({ onNext }) {
  return (
    <div className="flex flex-col flex-1">
      {/* Central illustrated content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* Glow bubble */}
        <div
          className="flex items-center justify-center rounded-full mb-8"
          style={{
            width: 140, height: 140,
            backgroundColor: 'rgba(124,158,135,0.12)',
            boxShadow: '0 0 60px rgba(124,158,135,0.20)',
          }}
        >
          <span style={{ fontSize: 72, lineHeight: 1 }}>🌿</span>
        </div>

        <h1 className="font-bold mb-3 leading-tight" style={{ fontSize: 28, color: '#2D2D2D' }}>
          Welcome to Manomitra
        </h1>

        <p className="font-medium mb-4" style={{ fontSize: 16, color: '#7A7A7A' }}>
          Your mind deserves a friend
        </p>

        <p className="leading-relaxed max-w-xs" style={{ fontSize: 14, color: '#9A9A9A' }}>
          A safe, warm space to check in with yourself every day
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {['🌙 Daily check-ins', '🧘 Guided breathing', '💬 Talk to Mitra'].map((f) => (
            <span
              key={f}
              className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ backgroundColor: 'rgba(124,158,135,0.12)', color: '#5C8A6A' }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        className="w-full py-4 rounded-2xl font-semibold text-base text-white mt-8 active:scale-95 transition-transform duration-150"
        style={{
          backgroundColor: '#7C9E87',
          boxShadow: '0 8px 24px rgba(124,158,135,0.35)',
        }}
      >
        Get Started
      </button>
    </div>
  )
}

/* ══ Screen 2 — Name ══════════════════════════════════════ */
function Screen2({ name, setName, onNext }) {
  const [focused, setFocused] = useState(false)
  const trimmed = name.trim()

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 flex flex-col justify-center">
        {/* Emoji */}
        <div className="mb-7 flex justify-center">
          <span
            className="flex items-center justify-center rounded-full"
            style={{
              width: 80, height: 80, fontSize: 40,
              backgroundColor: 'rgba(124,158,135,0.12)',
            }}
          >
            ✍️
          </span>
        </div>

        <h1 className="font-bold mb-2 leading-snug" style={{ fontSize: 24, color: '#2D2D2D' }}>
          What should Mitra call you?
        </h1>
        <p className="text-sm mb-8" style={{ color: '#7A7A7A' }}>
          So your experience feels personal
        </p>

        {/* Name input */}
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && trimmed && onNext()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Enter your name"
            autoFocus
            className="w-full px-4 py-4 rounded-2xl text-base transition-all duration-200 focus:outline-none"
            style={{
              backgroundColor: '#FFFFFF',
              border: `2px solid ${focused ? '#7C9E87' : '#E8E0D8'}`,
              color: '#2D2D2D',
              boxShadow: focused
                ? '0 0 0 4px rgba(124,158,135,0.12)'
                : '0 2px 10px rgba(0,0,0,0.06)',
            }}
          />
          {/* Checkmark when name is valid */}
          {trimmed && (
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#7C9E87' }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )}
        </div>

        {/* Greeting preview */}
        {trimmed && (
          <p className="mt-4 text-sm text-center transition-opacity duration-300" style={{ color: '#7C9E87' }}>
            Nice to meet you, <strong>{trimmed}</strong>! 👋
          </p>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!trimmed}
        className="w-full py-4 rounded-2xl font-semibold text-base text-white transition-all duration-200 active:scale-95"
        style={{
          backgroundColor: trimmed ? '#7C9E87' : '#C8D8CC',
          boxShadow: trimmed ? '0 8px 24px rgba(124,158,135,0.35)' : 'none',
          marginTop: 24,
        }}
      >
        Continue
      </button>
    </div>
  )
}

/* ══ Screen 3 — First Mood ════════════════════════════════ */
function Screen3({ name, mood, setMood, onFinish, loading }) {
  const firstName = name.trim().split(' ')[0]

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 overflow-y-auto">
        <h1 className="font-bold mb-2 leading-snug" style={{ fontSize: 24, color: '#2D2D2D' }}>
          How are you feeling right now{firstName ? `, ${firstName}` : ''}?
        </h1>
        <p className="text-sm mb-7" style={{ color: '#7A7A7A' }}>
          Let's start your wellness journey
        </p>

        {/* Mood cards */}
        <div className="space-y-3">
          {MOODS.map((m) => {
            const active = mood === m.id
            return (
              <button
                key={m.id}
                onClick={() => setMood(m.id)}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-200 active:scale-[0.98]"
                style={{
                  backgroundColor: active ? '#7C9E87' : '#FFFFFF',
                  boxShadow: active
                    ? '0 4px 16px rgba(124,158,135,0.30)'
                    : '0 2px 10px rgba(0,0,0,0.07)',
                }}
              >
                {/* Emoji bubble */}
                <span
                  className="flex items-center justify-center w-12 h-12 rounded-full shrink-0 text-2xl"
                  style={{ backgroundColor: active ? 'rgba(255,255,255,0.22)' : '#FFF3E8' }}
                >
                  {m.emoji}
                </span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base leading-none"
                     style={{ color: active ? '#FFFFFF' : '#2D2D2D' }}>
                    {m.label}
                  </p>
                  <p className="text-xs mt-1 leading-none"
                     style={{ color: active ? 'rgba(255,255,255,0.80)' : '#9A9A9A' }}>
                    {m.sub}
                  </p>
                </div>

                {/* Radio dot */}
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
      </div>

      <button
        onClick={onFinish}
        disabled={!mood || loading}
        className="w-full py-4 rounded-2xl font-semibold text-base text-white transition-all duration-200 active:scale-95 mt-6"
        style={{
          backgroundColor: mood ? '#7C9E87' : '#C8D8CC',
          boxShadow: mood ? '0 8px 24px rgba(124,158,135,0.35)' : 'none',
        }}
      >
        {loading ? 'Starting...' : 'Start My Journey ✨'}
      </button>
    </div>
  )
}
