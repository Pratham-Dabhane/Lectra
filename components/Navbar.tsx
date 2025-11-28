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

  return (
    <nav className="navbar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 
              className="gradient-text cursor-pointer" 
              onClick={() => router.push('/')}
              style={{ 
                fontSize: '1.75rem', 
                fontWeight: 700,
                letterSpacing: '0.05em'
              }}
            >
              LECTRA
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <button
              onClick={() => router.push('/')}
              className={`text-sm font-medium transition-colors ${
                router.pathname === '/' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => router.push('/chat')}
              className={`text-sm font-medium transition-colors ${
                router.pathname === '/chat' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => router.push('/flashcards')}
              className={`text-sm font-medium transition-colors ${
                router.pathname === '/flashcards' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              🎴 Flashcards
            </button>
            <button
              onClick={() => router.push('/analytics')}
              className={`text-sm font-medium transition-colors ${
                router.pathname === '/analytics' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              📊 Analytics
            </button>
            <span 
              className="hidden sm:block" 
              style={{ 
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                fontWeight: 500
              }}
            >
              Your AI Learning Companion
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
                color: 'white',
                padding: '0.625rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
