import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

interface FileUploadProps {
  onUploadSuccess: () => void
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-docs')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-docs')
        .getPublicUrl(fileName)

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('uploads')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_url: publicUrl,
          uploaded_at: new Date().toISOString()
        })

      if (dbError) throw dbError

      toast.success('Document uploaded successfully!')
      
      // Auto-ingest document into vector database
      toast.loading('Processing document for AI chat...', { id: 'ingestion' })
      
      try {
        const ingestResponse = await fetch('http://localhost:8000/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_url: publicUrl,
            user_id: user.id
          })
        })

        if (ingestResponse.ok) {
          toast.success('Document processed! Ready for chat 🎉', { id: 'ingestion' })
        } else {
          const errorData = await ingestResponse.json()
          throw new Error(errorData.detail || 'Ingestion failed')
        }
      } catch (ingestError: any) {
        toast.error(`Upload successful but processing failed: ${ingestError.message}`, { id: 'ingestion' })
        console.error('Ingestion error:', ingestError)
      }
      
      setFile(null)
      onUploadSuccess()
    } catch (error: any) {
      toast.error('Error uploading file: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="text-center mb-5">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 gradient-bg"
          style={{ boxShadow: '0 4px 20px rgba(59, 227, 244, 0.3)' }}
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 600, 
          color: 'var(--text-primary)',
          marginBottom: '0.5rem'
        }}>
          Upload Your Documents
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Support for PDF and TXT files up to 10MB
        </p>
      </div>

      <div className="space-y-4" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div 
          className="border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300"
          style={{ 
            borderColor: 'rgba(203, 213, 225, 0.5)',
            borderRadius: 'var(--radius-md)',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '180px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--electric-cyan)';
            e.currentTarget.style.background = 'rgba(59, 227, 244, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(203, 213, 225, 0.5)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer" style={{ width: '100%' }}>
            <div className="space-y-3">
              <svg 
                className="w-12 h-12 mx-auto" 
                style={{ color: 'var(--text-secondary)' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                strokeWidth="1.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div style={{ fontSize: '0.95rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--lectra-blue)' }}>Click to upload</span>
                <span style={{ color: 'var(--text-secondary)' }}> or drag and drop</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                PDF, TXT up to 10MB
              </p>
            </div>
          </label>
        </div>

        {file && (
          <div 
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ 
              background: 'linear-gradient(135deg, rgba(30, 78, 140, 0.05), rgba(59, 227, 244, 0.05))',
              border: '1px solid rgba(59, 227, 244, 0.2)'
            }}
          >
            <div className="flex items-center space-x-3">
              <svg 
                className="w-5 h-5" 
                style={{ color: 'var(--lectra-blue)' }}
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <span 
                className="truncate"
                style={{ 
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}
              >
                {file.name}
              </span>
            </div>
            <button
              onClick={() => setFile(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            'Upload & Process Document'
          )}
        </button>
      </div>
    </div>
  )
}
