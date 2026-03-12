import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, googleProvider } from '../utils/firebase'
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth'

export default function Login() {
  const navigate = useNavigate()
  const [isSignUP, setIsSignUp] = useState(false)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError('')
      await signInWithPopup(auth, googleProvider)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill out all fields')
      return
    }

    try {
      setLoading(true)
      setError('')
      if (isSignUP) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh px-6 pt-12 pb-8" style={{ backgroundColor: '#FFF8F0' }}>
      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
        
        {/* Glow bubble & welcome text */}
        <div className="flex flex-col items-center justify-center text-center mb-10">
          <div
            className="flex items-center justify-center rounded-full mb-6"
            style={{
              width: 100, height: 100,
              backgroundColor: 'rgba(124,158,135,0.12)',
              boxShadow: '0 0 50px rgba(124,158,135,0.20)',
            }}
          >
            <span style={{ fontSize: 52, lineHeight: 1 }}>🌿</span>
          </div>
          <h1 className="font-bold mb-2 leading-tight" style={{ fontSize: 26, color: '#2D2D2D' }}>
            {isSignUP ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="font-medium" style={{ fontSize: 15, color: '#7A7A7A' }}>
            Your safe space is waiting
          </p>
        </div>

        {/* Error Box */}
        {error && (
          <div className="p-3 mb-6 rounded-xl text-sm text-center" style={{ backgroundColor: '#FFEBEA', color: '#D9534F' }}>
            {error}
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full px-4 py-4 rounded-2xl text-base transition-all duration-200 focus:outline-none"
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid transparent',
              color: '#2D2D2D',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            }}
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-4 rounded-2xl text-base transition-all duration-200 focus:outline-none"
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid transparent',
              color: '#2D2D2D',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            }}
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-semibold text-base text-white active:scale-95 transition-transform duration-150"
            style={{
              backgroundColor: '#E8956D', 
              boxShadow: '0 8px 24px rgba(232,149,109,0.3)',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Please wait...' : (isSignUP ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px" style={{ backgroundColor: '#E8E0D8' }} />
          <span className="text-xs uppercase font-semibold" style={{ color: '#B0A898' }}>Or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: '#E8E0D8' }} />
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-semibold text-base text-white flex items-center justify-center gap-3 active:scale-95 transition-transform duration-150"
          style={{
            backgroundColor: '#7C9E87',
            boxShadow: '0 8px 24px rgba(124,158,135,0.35)',
            opacity: loading ? 0.7 : 1
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Toggle Mode */}
        <p className="text-center mt-8 text-sm" style={{ color: '#7A7A7A' }}>
          {isSignUP ? 'Already have an account?' : 'New user?'}
          <button
            onClick={() => setIsSignUp(!isSignUP)}
            className="ml-2 font-bold focus:outline-none"
            style={{ color: '#2D2D2D' }}
          >
            {isSignUP ? 'Log in' : 'Create account'}
          </button>
        </p>

      </div>
    </div>
  )
}
