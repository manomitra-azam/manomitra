import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './utils/firebase'

import Login           from './pages/Login'
import Home            from './pages/Home'
import MoodCheckIn     from './pages/MoodCheckIn'
import MoodRecords     from './pages/MoodRecords'
import MeditationTimer from './pages/MeditationTimer'
import MitraChat       from './pages/MitraChat'
import Onboarding      from './pages/Onboarding'

/**
 * App.jsx – Central router for Manomitra
 */

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4 bg-[#FFF8F0]">
        <div className="w-12 h-12 rounded-full bg-[#7C9E87]/20 flex items-center justify-center animate-pulse">
           🌿
        </div>
      </div>
    )
  }

  // Helper inside App to grab state and routing rules
  function RequireAuth({ children }) {
    if (!user) return <Navigate to="/login" replace />
    return children
  }

  function RequireOnboarding({ children }) {
    if (!user) return <Navigate to="/login" replace />
    const userName = localStorage.getItem('userName')
    if (!userName) return <Navigate to="/onboarding" replace />
    return children
  }

  function RequireGuest({ children }) {
    if (user) return <Navigate to="/" replace />
    return children
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Login screen ── */}
        <Route 
          path="/login" 
          element={
            <RequireGuest>
              <Login />
            </RequireGuest>
          } 
        />

        {/* ── Onboarding — requires auth, but no userName yet ── */}
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              {localStorage.getItem('userName') ? <Navigate to="/" replace /> : <Onboarding />}
            </RequireAuth>
          }
        />

        {/* ── Home — default route ── */}
        <Route
          path="/"
          element={
            <RequireOnboarding>
              <Home />
            </RequireOnboarding>
          }
        />

        {/* ── Check-in ── */}
        <Route
          path="/mood-checkin"
          element={
            <RequireOnboarding>
              <MoodCheckIn />
            </RequireOnboarding>
          }
        />

        {/* ── Mood history ── */}
        <Route
          path="/mood-records"
          element={
            <RequireOnboarding>
              <MoodRecords />
            </RequireOnboarding>
          }
        />

        {/* ── Meditation ── */}
        <Route
          path="/meditate"
          element={
            <RequireOnboarding>
              <MeditationTimer />
            </RequireOnboarding>
          }
        />

        {/* ── Chat ── */}
        <Route
          path="/chat"
          element={
            <RequireOnboarding>
              <MitraChat />
            </RequireOnboarding>
          }
        />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
