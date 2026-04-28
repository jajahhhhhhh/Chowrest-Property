import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import './Auth.css'

type Mode = 'signin' | 'signup'

export default function Auth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultRole = searchParams.get('role') ?? 'buyer'

  const { signIn, signUp, loading } = useAuthStore()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState(defaultRole)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!email || !password) { setError('Email and password are required.'); return }

    if (mode === 'signin') {
      const err = await signIn(email, password)
      if (err) { setError(err); return }
    } else {
      if (!name) { setError('Full name is required.'); return }
      const err = await signUp(email, password, name, role)
      if (err) { setError(err); return }
    }

    navigate(role === 'agent' ? '/dashboard' : '/listings')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <span className="auth-brand__mark">CR</span>
          <span className="auth-brand__name">ChowtoRest</span>
        </Link>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'signin' ? 'auth-tab--active' : ''}`} onClick={() => setMode('signin')}>
            Sign In
          </button>
          <button className={`auth-tab ${mode === 'signup' ? 'auth-tab--active' : ''}`} onClick={() => setMode('signup')}>
            Create Account
          </button>
        </div>

        <div className="auth-form">
          {mode === 'signup' && (
            <div className="auth-field">
              <label>Full Name</label>
              <input placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}

          <div className="auth-field">
            <label>Email</label>
            <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          {mode === 'signup' && (
            <div className="auth-field">
              <label>I am a…</label>
              <div className="role-pills">
                <button className={`role-pill ${role === 'buyer' ? 'role-pill--active' : ''}`} onClick={() => setRole('buyer')}>
                  🏠 Buyer / Renter
                </button>
                <button className={`role-pill ${role === 'agent' ? 'role-pill--active' : ''}`} onClick={() => setRole('agent')}>
                  🤝 Real Estate Agent
                </button>
              </div>
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button className="btn btn--primary auth-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          <p className="auth-note">
            {mode === 'signin'
              ? "Don't have an account? "
              : 'Already have an account? '}
            <button className="auth-switch" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}>
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
