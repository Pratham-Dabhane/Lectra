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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center fade-in">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: 'var(--lectra-blue)' }}
          ></div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            Loading Lectra...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Toaster position="top-center" />
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center fade-in">
            <h1 className="gradient-text mb-3" style={{ 
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              lineHeight: '1.2'
            }}>
              Learn Smarter with Lectra
            </h1>
            <p className="text-lg md:text-xl mb-2 max-w-2xl mx-auto" style={{ 
              color: 'var(--text-primary)', 
              fontWeight: 500,
              lineHeight: '1.5'
            }}>
              Your notes. Your questions. Your AI tutor.
            </p>
            <p className="text-base mb-6 max-w-xl mx-auto" style={{ 
              color: 'var(--text-secondary)',
              lineHeight: '1.6'
            }}>
              Upload documents and get personalized learning insights powered by advanced AI.
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 justify-center items-center mb-4">
              <div className="flex items-center px-4 py-2 rounded-full" style={{ 
                background: 'linear-gradient(135deg, rgba(30, 78, 140, 0.1), rgba(59, 227, 244, 0.1))',
                border: '1px solid rgba(59, 227, 244, 0.3)'
              }}>
                <svg className="w-5 h-5 mr-2" style={{ color: 'var(--electric-cyan)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>Secure & Private</span>
              </div>
              <div className="flex items-center px-4 py-2 rounded-full" style={{ 
                background: 'linear-gradient(135deg, rgba(30, 78, 140, 0.1), rgba(59, 227, 244, 0.1))',
                border: '1px solid rgba(59, 227, 244, 0.3)'
              }}>
                <svg className="w-5 h-5 mr-2" style={{ color: 'var(--electric-cyan)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>AI-Powered</span>
              </div>
              <div className="flex items-center px-4 py-2 rounded-full" style={{ 
                background: 'linear-gradient(135deg, rgba(30, 78, 140, 0.1), rgba(59, 227, 244, 0.1))',
                border: '1px solid rgba(59, 227, 244, 0.3)'
              }}>
                <svg className="w-5 h-5 mr-2" style={{ color: 'var(--electric-cyan)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>Personalized</span>
              </div>
            </div>
          </div>
        </div>

        {/* Soft gradient mesh background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-30 blur-3xl" style={{ 
            background: 'radial-gradient(circle, var(--electric-cyan) 0%, transparent 70%)' 
          }}></div>
          <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ 
            background: 'radial-gradient(circle, var(--soft-lavender) 0%, transparent 70%)' 
          }}></div>
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full opacity-25 blur-3xl" style={{ 
            background: 'radial-gradient(circle, var(--lectra-blue) 0%, transparent 70%)' 
          }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-16 pt-2">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {/* Upload Section */}
            <div className="flex flex-col fade-in" style={{ height: '100%' }}>
              <div className="mb-4 text-center">
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 600, 
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                  lineHeight: '1.3'
                }}>
                  Upload Documents
                </h2>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: '0.9375rem',
                  lineHeight: '1.5'
                }}>
                  Add your notes, textbooks, or study materials to get started
                </p>
              </div>
              <FileUpload onUploadSuccess={handleUploadSuccess} />
            </div>

            {/* Files Section */}
            <div className="flex flex-col fade-in" style={{ animationDelay: '0.1s', height: '100%' }}>
              <div className="mb-4 text-center">
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 600, 
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                  lineHeight: '1.3'
                }}>
                  Your Documents
                </h2>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: '0.9375rem',
                  lineHeight: '1.5'
                }}>
                  Manage and access your uploaded learning materials
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
