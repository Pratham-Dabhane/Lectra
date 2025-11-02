import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import toast, { Toaster } from 'react-hot-toast'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Welcome back to Lectra!')
        router.push('/')
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast.success('Account created! Please check your email.')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--background)' }}>
      <Toaster position="top-center" />
      
      {/* Background gradient mesh */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ 
          background: 'radial-gradient(circle, var(--lectra-blue) 0%, transparent 70%)' 
        }}></div>
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ 
          background: 'radial-gradient(circle, var(--electric-cyan) 0%, transparent 70%)' 
        }}></div>
      </div>

      <div className="max-w-md w-full px-6 py-8 fade-in">
        {/* Logo/Brand */}
        <div className="text-center mb-10">
          <h1 className="gradient-text mb-3" style={{ 
            fontSize: '3rem', 
            fontWeight: 700, 
            letterSpacing: '0.05em'
          }}>
            LECTRA
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>
            Your Personal AI Learning Companion
          </p>
        </div>

        {/* Auth Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <div className="text-center mb-8">
            <h2 style={{ 
              fontSize: '1.75rem', 
              fontWeight: 600, 
              color: 'var(--text-primary)',
              marginBottom: '0.5rem'
            }}>
              {isLogin ? 'Welcome Back' : 'Join Lectra'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {isLogin ? 'Sign in to continue learning' : 'Create your account to get started'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleAuth}>
            <div className="space-y-5">
              <div>
                <label 
                  htmlFor="email" 
                  style={{ 
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem'
                  }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label 
                  htmlFor="password" 
                  style={{ 
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem'
                  }}
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={{ paddingTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isLogin ? 'Sign In to Lectra' : 'Create Account'}
              </button>
            </div>

            <div className="text-center" style={{ paddingTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--lectra-blue)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--electric-cyan)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--lectra-blue)'}
              >
                {isLogin ? 'New to Lectra? Create account' : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center" style={{ 
          marginTop: '2rem',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)'
        }}>
          Learn Smarter with AI • Powered by Lectra
        </div>
      </div>
    </div>
  )
}
