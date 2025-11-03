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
        <div className="flex items-center justify-center py-12">
          <div 
            className="animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: 'var(--lectra-blue)' }}
          ></div>
          <span 
            className="ml-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            Loading your documents...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 600, 
            color: 'var(--text-primary)'
          }}>
            Your Documents
          </h3>
          <p style={{ 
            fontSize: '0.875rem', 
            color: 'var(--text-secondary)',
            marginTop: '0.25rem'
          }}>
            {uploads.length} document{uploads.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>
        <div 
          className="flex items-center px-3 py-1.5 rounded-full"
          style={{ 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.15))',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}
        >
          <svg 
            className="w-4 h-4 mr-1" 
            style={{ color: 'var(--success)' }}
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span style={{ 
            fontSize: '0.8125rem', 
            fontWeight: 600,
            color: 'var(--success)'
          }}>
            Secure
          </span>
        </div>
      </div>

      {uploads.length === 0 ? (
        <div className="text-center" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ 
              background: 'linear-gradient(135deg, rgba(30, 78, 140, 0.1), rgba(59, 227, 244, 0.1))'
            }}
          >
            <svg 
              className="w-8 h-8" 
              style={{ color: 'var(--lectra-blue)' }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 style={{ 
            fontSize: '1.125rem', 
            fontWeight: 600, 
            color: 'var(--text-primary)',
            marginBottom: '0.5rem'
          }}>
            No documents yet
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Upload your first document to get started with Lectra
          </p>
        </div>
      ) : (
        <div className="space-y-3" style={{ flex: 1, overflowY: 'auto', maxHeight: '500px' }}>
          {uploads.map((upload) => (
            <div 
              key={upload.id} 
              className="flex items-center justify-between p-4 rounded-lg transition-all duration-200"
              style={{ 
                border: '1px solid rgba(203, 213, 225, 0.3)',
                borderRadius: 'var(--radius-md)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.borderColor = 'rgba(59, 227, 244, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(203, 213, 225, 0.3)';
              }}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center gradient-bg"
                    style={{ boxShadow: '0 2px 8px rgba(59, 227, 244, 0.3)' }}
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="truncate"
                    style={{ 
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '0.125rem'
                    }}
                  >
                    {upload.filename}
                  </p>
                  <p style={{ 
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)'
                  }}>
                    Uploaded {new Date(upload.uploaded_at).toLocaleDateString()} at {new Date(upload.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={upload.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 rounded-md transition-all duration-200"
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--lectra-blue)',
                    background: 'linear-gradient(135deg, rgba(30, 78, 140, 0.1), rgba(59, 227, 244, 0.1))',
                    border: '1px solid rgba(30, 78, 140, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(30, 78, 140, 0.15), rgba(59, 227, 244, 0.15))';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(30, 78, 140, 0.1), rgba(59, 227, 244, 0.1))';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
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
