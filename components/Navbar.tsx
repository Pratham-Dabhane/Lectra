import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

export default function Navbar() {
  const router = useRouter()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Error logging out')
    } else {
      toast.success('Logged out successfully')
      router.push('/auth')
    }
  }

  const isActive = (path: string) => router.pathname === path

  return (
    <nav className="navbar sticky top-0 z-50">
      <div style={{
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '4rem',
          gap: '2rem'
        }}>
          {/* Logo - Left Aligned */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              className="cursor-pointer flex items-center space-x-2"
              onClick={() => router.push('/')}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg"
                style={{ boxShadow: 'var(--glow-cyan)' }}>
                <span className="text-black font-black text-lg">L</span>
              </div>
              <h1 
                className="gradient-text" 
                style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 900,
                  fontFamily: 'Orbitron, sans-serif',
                  letterSpacing: '0.1em'
                }}
              >
                LECTRA
              </h1>
            </div>
          </div>

          {/* Navigation + Logout - Right Aligned */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {/* Navigation Links */}
            <div className="hidden md:flex items-center" style={{ gap: '0.25rem' }}>
            <button
              onClick={() => router.push('/')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                isActive('/') 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10'
              }`}
              style={{ 
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '0.95rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </span>
            </button>

            <button
              onClick={() => router.push('/chat')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                isActive('/chat') 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10'
              }`}
              style={{ 
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '0.95rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Chat</span>
              </span>
            </button>

            <button
              onClick={() => router.push('/flashcards')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                isActive('/flashcards') 
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' 
                  : 'text-gray-400 hover:text-purple-400 hover:bg-purple-500/10'
              }`}
              style={{ 
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '0.95rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Flashcards</span>
              </span>
            </button>

            <button
              onClick={() => router.push('/analytics')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                isActive('/analytics') 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' 
                  : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
              }`}
              style={{ 
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '0.95rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Analytics</span>
              </span>
            </button>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-lg font-bold transition-all duration-300 border"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
                borderColor: 'rgba(239, 68, 68, 0.5)',
                color: '#ef4444',
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.85rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginLeft: '1rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.4)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(220, 38, 38, 0.4))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))';
              }}
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Simple version */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-cyan-500/20 mt-2">
          <button onClick={() => router.push('/')} className={`text-xs ${isActive('/') ? 'text-cyan-400' : 'text-gray-500'}`}>Home</button>
          <button onClick={() => router.push('/chat')} className={`text-xs ${isActive('/chat') ? 'text-cyan-400' : 'text-gray-500'}`}>Chat</button>
          <button onClick={() => router.push('/flashcards')} className={`text-xs ${isActive('/flashcards') ? 'text-purple-400' : 'text-gray-500'}`}>Cards</button>
          <button onClick={() => router.push('/analytics')} className={`text-xs ${isActive('/analytics') ? 'text-blue-400' : 'text-gray-500'}`}>Analytics</button>
        </div>
      </div>
    </nav>
  )
}
