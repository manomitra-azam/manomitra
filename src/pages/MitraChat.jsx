import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'

/* ── Initial State ────────────────────────────────────────── */

const NAV = [
  { label: 'Home',     to: '/',             icon: HomeIcon },
  { label: 'Mood',     to: '/mood-records', icon: MoodIcon },
  { label: 'Meditate', to: '/meditate',     icon: MeditateIcon },
  { label: 'Chat',     to: '/chat',         icon: ChatIcon },
]

/* ── API Integration ──────────────────────────────────────── */
const sendToGroq = async (userMessage, conversationHistory) => {
  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are Mitra, a warm and empathetic mental wellness companion for Indian users. Speak like a caring close friend, not a doctor. Keep responses to 2-3 sentences. Never give medical advice."
          },
          ...conversationHistory,
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    }
  );
  const data = await response.json();
  return data?.choices?.[0]?.message?.content 
    || "Mitra is resting, try again 🌿";
};

/* ── Component ──────────────────────────────────────────── */
export default function MitraChat() {
  const navigate  = useNavigate()
  const location  = useLocation()

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Mitra, your mental wellness friend. How are you feeling today? 😊",
      from: 'mitra',
      time: `${String(new Date().getHours()).padStart(2,'0')}:${String(new Date().getMinutes()).padStart(2,'0')}`
    }
  ]);
  const [input,    setInput]    = useState('')
  const [typing,   setTyping]   = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  /* Auto-scroll to latest message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  async function handleSend() {
    const text = input.trim()
    if (!text || typing) return

    const now = new Date()
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

    /* Add user message */
    const userMsg = { id: Date.now(), from: 'user', text, time }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    try {
      const conversationHistory = messages
        .filter(msg => msg.id !== 1)
        .map(msg => ({
          role: msg.from === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      const reply = await sendToGroq(text, conversationHistory);

      const replyNow = new Date()
      const replyTime = `${String(replyNow.getHours()).padStart(2,'0')}:${String(replyNow.getMinutes()).padStart(2,'0')}`

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: 'mitra', text: reply, time: replyTime },
      ])
    } catch (err) {
      console.log('Groq error:', err)
      console.error('Groq API Error:', err)
      const replyNow = new Date()
      const replyTime = `${String(replyNow.getHours()).padStart(2,'0')}:${String(replyNow.getMinutes()).padStart(2,'0')}`
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: 'mitra', text: "Mitra is resting, try again in a moment 🌿", time: replyTime },
      ])
    } finally {
      setTyping(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#FFF8F0' }}>

      {/* ══ Header ════════════════════════════════════════════ */}
      <header
        className="flex items-center gap-3 px-4 pt-10 pb-4 sticky top-0 z-10 border-b"
        style={{ backgroundColor: '#FFF8F0', borderColor: '#F0E6DC' }}
      >
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="mr-1 active:opacity-60 transition-opacity"
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#2D2D2D" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-xl"
          style={{ backgroundColor: '#7C9E87' }}
        >
          🌿
        </div>

        {/* Name + caption */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base leading-none" style={{ color: '#2D2D2D' }}>Mitra</p>
          <p className="text-xs mt-0.5 leading-none" style={{ color: '#7A7A7A' }}>
            Always here to listen
          </p>
        </div>

        {/* Online dot */}
        <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#7C9E87' }}>
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: '#7C9E87',
              boxShadow: '0 0 0 3px rgba(124,158,135,0.25)',
            }}
          />
          Online
        </span>
      </header>

      {/* ══ Chat area ═════════════════════════════════════════ */}
      <main
        className="flex-1 overflow-y-auto px-4 py-4 pb-6 space-y-3"
        style={{ paddingBottom: 140 }}
      >
        {/* Date chip */}
        <div className="flex justify-center mb-2">
          <span
            className="text-xs px-3 py-1 rounded-full"
            style={{ backgroundColor: '#EDE3D8', color: '#8A7A6E' }}
          >
            Today
          </span>
        </div>

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="flex items-end gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
              style={{ backgroundColor: '#7C9E87' }}
            >
              🌿
            </div>
            <div
              className="px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center"
              style={{ backgroundColor: '#7C9E87' }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-white"
                  style={{
                    animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    opacity: 0.85,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* ══ Input bar ══════════════════════════════════════════ */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 pt-3"
        style={{ borderColor: '#F0E6DC', paddingBottom: 'calc(env(safe-area-inset-bottom) + 72px)' }}
      >
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Talk to Mitra..."
            className="flex-1 rounded-full px-4 py-3 text-sm focus:outline-none"
            style={{
              backgroundColor: '#F5EDE3',
              color: '#2D2D2D',
              caretColor: '#7C9E87',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || typing}
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 active:scale-90"
            style={{
              backgroundColor: input.trim() && !typing ? '#7C9E87' : '#C8D8CC',
              boxShadow: input.trim() && !typing ? '0 4px 14px rgba(124,158,135,0.40)' : 'none',
            }}
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="white" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ══ Bottom Navigation ══════════════════════════════════ */}
      <nav
        className="fixed left-0 right-0 flex items-center justify-around px-4 py-3 border-t bg-white"
        style={{ bottom: 0, borderColor: '#F0E6DC', zIndex: 20 }}
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

      {/* ══ Keyframes ══════════════════════════════════════════ */}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0);    }
          30%            { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}

/* ── Message bubble ─────────────────────────────────────── */
function MessageBubble({ msg }) {
  const isMitra = msg.from === 'mitra'

  return (
    <div className={`flex items-end gap-2 ${isMitra ? '' : 'flex-row-reverse'}`}>

      {/* Mitra avatar */}
      {isMitra && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mb-0.5"
          style={{ backgroundColor: '#7C9E87' }}
        >
          🌿
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[78%] ${isMitra ? 'items-start' : 'items-end'}`}>
        <div
          className="px-4 py-3 text-sm leading-relaxed"
          style={{
            backgroundColor: isMitra ? '#7C9E87' : '#FFFFFF',
            color:           isMitra ? '#FFFFFF' : '#2D2D2D',
            borderRadius:    isMitra
              ? '16px 16px 16px 4px'
              : '16px 16px 4px 16px',
            boxShadow: isMitra
              ? '0 2px 10px rgba(124,158,135,0.25)'
              : '0 2px 10px rgba(0,0,0,0.07)',
          }}
        >
          {msg.text}
        </div>
        <span className="text-xs px-1" style={{ color: '#B0A898' }}>
          {msg.time}
        </span>
      </div>
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
