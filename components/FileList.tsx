import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

interface Upload {
  id: number
  filename: string
  file_url: string
  uploaded_at: string
}

export default function FileList() {
  const [uploads, setUploads] = useState<Upload[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUploads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      setUploads(data || [])
    } catch (error: any) {
      console.error('Error fetching uploads:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUploads()
  }, [])

  if (loading) {
    return (
      <div className="card">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="spinner mb-4"></div>
          <span 
            style={{ 
              color: 'var(--text-secondary)',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '1.05rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            Accessing Data Archive...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            color: 'var(--text-primary)',
            fontFamily: 'Orbitron, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Your Documents
          </h3>
          <p style={{ 
            fontSize: '0.95rem', 
            color: 'var(--text-secondary)',
            marginTop: '0.5rem',
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 500
          }}>
            {uploads.length} document{uploads.length !== 1 ? 's' : ''} indexed
          </p>
        </div>
        <div 
          className="flex items-center px-4 py-2 rounded-xl glassmorphism pulse"
          style={{ 
            border: '1px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)'
          }}
        >
          <svg 
            className="w-4 h-4 mr-2" 
            style={{ color: 'var(--success)' }}
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span style={{ 
            fontSize: '0.85rem', 
            fontWeight: 700,
            color: 'var(--success)',
            fontFamily: 'Orbitron, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Secure
          </span>
        </div>
      </div>

      {uploads.length === 0 ? (
        <div className="text-center fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
          <div 
            className="w-24 h-24 rounded-xl flex items-center justify-center mx-auto mb-6 float"
            style={{ 
              background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-cyan))',
              border: '2px solid var(--neon-cyan)',
              boxShadow: 'var(--glow-cyan)'
            }}
          >
            <svg 
              className="w-12 h-12" 
              style={{ color: 'var(--bg-primary)' }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            color: 'var(--text-primary)',
            marginBottom: '0.75rem',
            fontFamily: 'Orbitron, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Data Archive Empty
          </h4>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1rem',
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 500
          }}>
            Upload your first document to initialize the system
          </p>
        </div>
      ) : (
        <div className="space-y-3" style={{ flex: 1, overflowY: 'auto', maxHeight: '500px', paddingRight: '0.5rem' }}>
          {uploads.map((upload, index) => (
            <div 
              key={upload.id} 
              className="flex items-center justify-between p-4 rounded-xl glassmorphism transition-all duration-300 fade-in"
              style={{ 
                border: '1px solid rgba(0, 255, 255, 0.2)',
                animationDelay: `${index * 0.1}s`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--glow-cyan)';
                e.currentTarget.style.borderColor = 'var(--neon-cyan)';
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.2)';
                e.currentTarget.style.background = 'rgba(20, 24, 41, 0.6)';
              }}
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-cyan))',
                      boxShadow: 'var(--glow-cyan)',
                      border: '2px solid var(--neon-cyan)'
                    }}
                  >
                    <svg className="w-6 h-6" style={{ color: 'var(--bg-primary)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="truncate"
                    style={{ 
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '0.25rem',
                      fontFamily: 'Rajdhani, sans-serif'
                    }}
                  >
                    {upload.filename}
                  </p>
                  <p style={{ 
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: 500
                  }}>
                    {new Date(upload.uploaded_at).toLocaleDateString()} • {new Date(upload.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={upload.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200"
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--neon-cyan)',
                    background: 'rgba(0, 255, 255, 0.1)',
                    border: '1px solid rgba(0, 255, 255, 0.3)',
                    fontFamily: 'Orbitron, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
