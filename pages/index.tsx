import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'
import FileUpload from '../components/FileUpload'
import FileList from '../components/FileList'
import { Toaster } from 'react-hot-toast'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
      } else {
        setUser(user)
      }
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.push('/auth')
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center fade-in">
          <div className="relative">
            <div className="spinner mx-auto mb-6"></div>
            <div className="absolute inset-0 blur-xl opacity-50">
              <div className="spinner mx-auto"></div>
            </div>
          </div>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontWeight: 600,
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '1.1rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}>
            Initializing LECTRA System...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', position: 'relative', width: '100%' }}>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--neon-cyan)',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'Rajdhani, sans-serif',
          fontWeight: 600
        }
      }} />
      <Navbar />

      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-20 float" 
          style={{ 
            background: 'radial-gradient(circle, var(--neon-cyan) 0%, transparent 70%)',
            animationDelay: '0s'
          }}></div>
        <div className="absolute top-1/2 right-10 w-[500px] h-[500px] rounded-full blur-3xl opacity-15 float" 
          style={{ 
            background: 'radial-gradient(circle, var(--neon-blue) 0%, transparent 70%)',
            animationDelay: '1s'
          }}></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-20 float" 
          style={{ 
            background: 'radial-gradient(circle, var(--neon-purple) 0%, transparent 70%)',
            animationDelay: '2s'
          }}></div>
      </div>

      {/* Hero Section */}
      <div className="relative" style={{ 
        zIndex: 1,
        paddingTop: '3rem',
        paddingBottom: '3rem'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <div style={{
            textAlign: 'center'
          }} className="fade-in">
            {/* Main Title */}
            <h1 className="gradient-text" style={{ 
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              lineHeight: '1.1',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 900,
              letterSpacing: '0.05em',
              marginBottom: '1.5rem'
            }}>
              LECTRA
            </h1>
            
            {/* Subtitle */}
            <p style={{ 
              color: 'var(--text-primary)', 
              fontWeight: 700,
              lineHeight: '1.4',
              fontFamily: 'Rajdhani, sans-serif',
              letterSpacing: '0.03em',
              fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
              marginBottom: '1rem',
              maxWidth: '900px',
              margin: '0 auto 1rem auto'
            }}>
              INTELLIGENT LEARNING ASSISTANT
            </p>
            
            <p style={{ 
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(1rem, 2vw, 1.125rem)',
              marginBottom: '2.5rem',
              maxWidth: '700px',
              margin: '0 auto 2.5rem auto'
            }}>
              Upload your knowledge. Query with intelligence. Evolve instantly.
            </p>
            
            {/* Feature Pills */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '2.5rem',
              width: '100%',
              maxWidth: '900px',
              margin: '0 auto 2.5rem auto'
            }}>
              <div className="glassmorphism flex items-center px-5 py-3 rounded-xl neon-border slide-in-left" style={{ animationDelay: '0.1s' }}>
                <svg className="w-5 h-5 mr-3" style={{ color: 'var(--neon-cyan)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em' }}>QUANTUM ENCRYPTED</span>
              </div>
              
              <div className="glassmorphism flex items-center px-5 py-3 rounded-xl neon-border-blue slide-in-left" style={{ animationDelay: '0.2s' }}>
                <svg className="w-5 h-5 mr-3" style={{ color: 'var(--neon-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em' }}>AI CORE</span>
              </div>
              
              <div className="glassmorphism flex items-center px-5 py-3 rounded-xl neon-border slide-in-left" style={{ animationDelay: '0.3s' }}>
                <svg className="w-5 h-5 mr-3" style={{ color: 'var(--neon-teal)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em' }}>DYNAMIC LEARNING</span>
              </div>
            </div>
            
            {/* CTA Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%'
            }}>
              <button
                onClick={() => router.push('/chat')}
                className="btn-primary inline-flex items-center px-10 py-4 text-base"
                style={{ fontSize: '1.1rem' }}
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                INITIATE AI INTERFACE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - HARD-CODED CENTERING */}
      <div style={{ 
        position: 'relative', 
        zIndex: 1,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: '5rem',
        paddingTop: '1rem'
      }}>
        {/* Centered container with hard-coded max-width and centering */}
        <div style={{
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          {/* Two-column grid - hard-coded equal widths */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2rem',
            width: '100%'
          }}
          className="lg:grid-cols-2">
            
            {/* Upload Section - Left Column */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              width: '100%'
            }} className="slide-in-left">
              <div className="mb-6 text-center lg:text-left">
                <h2 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: 800, 
                  color: 'var(--text-primary)',
                  marginBottom: '0.75rem',
                  lineHeight: '1.2',
                  fontFamily: 'Orbitron, sans-serif',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  <span style={{ color: 'var(--neon-cyan)' }}>⬆</span> Upload Modules
                </h2>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 500
                }}>
                  Initialize knowledge base with documents and resources
                </p>
              </div>
              <FileUpload onUploadSuccess={handleUploadSuccess} />
            </div>

            {/* Files Section - Right Column */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              width: '100%'
            }} className="slide-in-right">
              <div className="mb-6 text-center lg:text-left">
                <h2 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: 800, 
                  color: 'var(--text-primary)',
                  marginBottom: '0.75rem',
                  lineHeight: '1.2',
                  fontFamily: 'Orbitron, sans-serif',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  <span style={{ color: 'var(--neon-blue)' }}>📁</span> Data Archive
                </h2>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 500
                }}>
                  Access and manage your indexed learning materials
                </p>
              </div>
              <FileList key={refreshKey} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
