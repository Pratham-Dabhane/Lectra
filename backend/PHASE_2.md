# Phase 2: Personalized Learning Bot with RAG - Backend Implementation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Environment Setup](#environment-setup)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [API Endpoints](#api-endpoints)
7. [Testing](#testing)
8. [Error Handling](#error-handling)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Phase 2 implements a FastAPI backend service that:
- Ingests documents uploaded by users from Supabase Storage
- Extracts text from PDF and TXT files using PyMuPDF
- Splits text into semantic chunks (1000 tokens with 200 token overlap)
- Generates embeddings using OpenAI or Mistral models via LangChain
- Stores embeddings in Pinecone vector database with metadata
- Provides REST API endpoints for document ingestion and management

### Key Features
✅ PDF and TXT document support  
✅ Automatic text extraction and chunking  
✅ Dual embedding model support (OpenAI/Mistral)  
✅ Vector storage in Pinecone with rich metadata  
✅ User-scoped document management  
✅ Comprehensive error handling and logging  
✅ RESTful API with OpenAPI documentation  

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Next.js)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FastAPI        │
│  Backend        │
└────────┬────────┘
         │
    ┌────┴────┬────────────┬──────────────┐
    ▼         ▼            ▼              ▼
┌─────────┐ ┌──────┐  ┌──────────┐  ┌─────────┐
│Supabase │ │PyMuPDF│ │LangChain │  │Pinecone │
│Storage  │ │       │  │Embeddings│  │ Vector  │
└─────────┘ └───────┘ └──────────┘  └─────────┘
```

### Component Breakdown

#### 1. **Supabase Client** (`services/supabase_client.py`)
- Downloads files from Supabase Storage
- Handles authentication and file retrieval
- Validates file access and permissions

#### 2. **Text Extractor** (`services/text_extractor.py`)
- Extracts text from PDF using PyMuPDF (fitz)
- Handles TXT files with multiple encoding support
- Validates file size limits (default: 10MB)
- Page-by-page processing for large PDFs

#### 3. **Embedding Service** (`services/embeddings.py`)
- Splits text into chunks using RecursiveCharacterTextSplitter
- Generates embeddings using:
  - **OpenAI**: `text-embedding-ada-002` (1536 dimensions)
  - **Mistral**: `all-MiniLM-L6-v2` (384 dimensions)
- Automatic fallback if OpenAI key is missing

#### 4. **Vector Store** (`services/vector_store.py`)
- Manages Pinecone index lifecycle
- Upserts vectors with rich metadata
- Supports querying and deletion operations
- Batch processing for efficient uploads

---

## 🛠️ Environment Setup

### Prerequisites
- Python 3.9 or higher
- pip package manager
- Active Supabase project with Storage configured
- Pinecone account (free tier available)
- OpenAI API key (optional, for OpenAI embeddings)

### Folder Structure
```
/lectra
├── backend/
│   ├── main.py                    # FastAPI application entry point
│   ├── requirements.txt           # Python dependencies
│   ├── .env                       # Environment variables (create from .env.example)
│   ├── .env.example              # Environment template
│   ├── routes/
│   │   └── ingest.py             # API endpoints for ingestion
│   ├── services/
│   │   ├── supabase_client.py    # Supabase integration
│   │   ├── text_extractor.py     # Text extraction from documents
│   │   ├── embeddings.py         # Embedding generation
│   │   └── vector_store.py       # Pinecone vector operations
│   └── utils/
│       └── logger.py             # Logging configuration
```

---

## 📦 Installation

### Step 1: Create Virtual Environment
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Windows (CMD)
.\venv\Scripts\activate.bat

# macOS/Linux
source venv/bin/activate
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Download Additional Models (Optional)
If using Mistral embeddings, the model will be downloaded automatically on first use (~100MB).

---

## ⚙️ Configuration

### Step 1: Create `.env` File
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Step 2: Configure Environment Variables

#### **Supabase Configuration**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the following:
   - **SUPABASE_URL**: Your project URL (e.g., `https://xxxxx.supabase.co`)
   - **SUPABASE_KEY**: Your anon/public key

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

#### **Pinecone Configuration**
1. Sign up at [pinecone.io](https://www.pinecone.io/)
2. Create a new project
3. Get your API key from the console
4. Choose your environment (default: gcp-starter for free tier)

```env
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX_NAME=lectra-embeddings
```

#### **OpenAI Configuration (Optional)**
1. Get API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Add to `.env`:

```env
OPENAI_API_KEY=sk-your-openai-api-key
EMBEDDING_MODEL=openai
EMBEDDING_DIMENSION=1536
```

**Note**: If you skip OpenAI, the system will automatically use Mistral embeddings:
```env
EMBEDDING_MODEL=mistral
EMBEDDING_DIMENSION=384
```

#### **Application Configuration**
```env
CHUNK_SIZE=1000              # Characters per chunk
CHUNK_OVERLAP=200            # Overlap between chunks
MAX_FILE_SIZE_MB=10          # Maximum file size
```

---

## 🚀 Running the Server

### Start FastAPI Server
```bash
# Development mode with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 📡 API Endpoints

### 1. Root Endpoint
**GET** `/`

Returns API information and available endpoints.

**Response:**
```json
{
  "message": "Welcome to Lectra Backend API",
  "version": "1.0.0",
  "docs": "/docs",
  "health": "/api/health"
}
```

---

### 2. Health Check
**GET** `/api/health`

Checks service health and Pinecone connection.

**Response:**
```json
{
  "status": "healthy",
  "service": "Lectra Backend API",
  "pinecone_connected": true,
  "index_stats": {
    "total_vectors": 1234,
    "dimension": 1536,
    "index_fullness": 0.12
  }
}
```

---

### 3. Ingest Document (Main Endpoint)
**POST** `/api/ingest`

Ingests a document from Supabase Storage, processes it, and stores embeddings.

**Request Body:**
```json
{
  "file_url": "https://your-project.supabase.co/storage/v1/object/public/user-docs/file.pdf",
  "user_id": "uuid-of-user",
  "file_name": "optional-file-name.pdf"
}
```

**Parameters:**
- `file_url` (required): Full public URL of the file in Supabase Storage
- `user_id` (required): UUID of the user who uploaded the file
- `file_name` (optional): File name (auto-extracted from URL if not provided)

**Response (Success):**
```json
{
  "status": "success",
  "message": "Document ingested successfully. Stored 45 vectors.",
  "vectors_stored": 45,
  "chunks_created": 45,
  "file_name": "machine-learning-notes.pdf",
  "user_id": "uuid-of-user"
}
```

**Response (Error):**
```json
{
  "detail": "Failed to extract text from PDF: File is corrupted"
}
```

**Status Codes:**
- `200 OK`: Document ingested successfully
- `400 Bad Request`: Invalid input or file issues
- `500 Internal Server Error`: Processing failure

---

### 4. Delete Document Vectors
**DELETE** `/api/vectors/{user_id}/{file_name}`

Deletes all vectors for a specific document.

**Parameters:**
- `user_id`: User UUID
- `file_name`: Name of the file to delete

**Response:**
```json
{
  "status": "success",
  "message": "Vectors deleted for file: machine-learning-notes.pdf"
}
```

---

## 🧪 Testing

### Testing with Postman

#### Step 1: Upload a Document via Frontend
1. Open your Next.js frontend at http://localhost:3000
2. Upload a PDF or TXT file
3. After successful upload, copy the file URL from browser network tab or Supabase Storage dashboard

#### Step 2: Get File URL from Supabase
```
Format: https://[project].supabase.co/storage/v1/object/public/user-docs/[user-id]/[timestamp].[ext]
```

#### Step 3: Test Ingestion with Postman

**Request Configuration:**
- Method: `POST`
- URL: `http://localhost:8000/api/ingest`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "file_url": "https://xxxxx.supabase.co/storage/v1/object/public/user-docs/file.pdf",
  "user_id": "your-user-uuid-here"
}
```

#### Step 4: Verify in Pinecone Dashboard
1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Select your index (`lectra-embeddings`)
3. Check the "Stats" tab for total vector count
4. Use "Query" tab to test retrieval

### Testing with cURL

```bash
# Health check
curl http://localhost:8000/api/health

# Ingest document
curl -X POST http://localhost:8000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "file_url": "https://xxxxx.supabase.co/storage/v1/object/public/user-docs/file.pdf",
    "user_id": "user-uuid"
  }'

# Delete vectors
curl -X DELETE http://localhost:8000/api/vectors/user-uuid/file.pdf
```

### Sample Test Cases

#### Test Case 1: Small PDF (< 5 pages)
- **Expected**: ~5-10 chunks, quick processing (<10s)
- **Verify**: All text extracted correctly

#### Test Case 2: Large PDF (> 50 pages)
- **Expected**: ~50-100 chunks, longer processing (30-60s)
- **Verify**: No timeout errors, batch processing works

#### Test Case 3: Text File
- **Expected**: Proper encoding detection, successful ingestion
- **Verify**: Special characters preserved

#### Test Case 4: Empty/Corrupted File
- **Expected**: 400 Bad Request error
- **Verify**: Clear error message

#### Test Case 5: Oversized File (> 10MB)
- **Expected**: 400 Bad Request error
- **Verify**: File size limit enforced

---

## 🛡️ Error Handling

### Common Errors and Solutions

#### 1. Supabase Connection Error
```
Error downloading file: Connection refused
```
**Solution:**
- Check SUPABASE_URL and SUPABASE_KEY in `.env`
- Verify file URL is publicly accessible
- Check Supabase Storage bucket permissions

#### 2. Pinecone Index Not Found
```
Failed to initialize Pinecone index: Index not found
```
**Solution:**
- Verify PINECONE_API_KEY is correct
- Check index name matches PINECONE_INDEX_NAME
- Index will be auto-created on first run

#### 3. OpenAI API Error
```
Failed to initialize OpenAI embeddings: Invalid API key
```
**Solution:**
- Verify OPENAI_API_KEY is valid
- System will automatically fall back to Mistral
- Or set `EMBEDDING_MODEL=mistral` to skip OpenAI

#### 4. Text Extraction Failed
```
No text could be extracted from the PDF
```
**Solution:**
- PDF might be image-based (requires OCR - future enhancement)
- Try a different PDF with text content
- Check if file is corrupted

#### 5. File Size Exceeded
```
File size (15.2MB) exceeds maximum allowed size (10MB)
```
**Solution:**
- Increase MAX_FILE_SIZE_MB in `.env`
- Or compress the PDF before upload

---

## 🐛 Troubleshooting

### Issue: Module not found errors
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Issue: Sentence transformers downloading slowly
```bash
# Pre-download model
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"
```

### Issue: Pinecone dimension mismatch
```
Vector dimension mismatch: expected 1536, got 384
```
**Solution:**
- Delete existing Pinecone index
- Update EMBEDDING_DIMENSION in `.env`
- Restart server (index will be recreated)

### Issue: CORS errors from frontend
```bash
# Add your frontend URL to main.py
allow_origins=["http://localhost:3000", "your-frontend-url"]
```

### Viewing Logs
All operations are logged to console. For debugging:
```bash
# Run with verbose logging
uvicorn main:app --reload --log-level debug
```

---

## 📊 Monitoring

### Key Metrics to Track
1. **Ingestion Time**: Should be < 30s for typical documents
2. **Vector Count**: Check Pinecone dashboard regularly
3. **Error Rate**: Monitor 4xx/5xx responses
4. **Embedding Quality**: Test with sample queries

### Performance Optimization
- **Batch Size**: Adjust vector upsert batch size (default: 100)
- **Chunk Size**: Tune CHUNK_SIZE based on document type
- **Overlap**: Increase CHUNK_OVERLAP for better context

---

## 🔐 Security Considerations

1. **API Keys**: Never commit `.env` file to version control
2. **File Validation**: Server validates file size and type
3. **User Isolation**: Vectors are scoped by user_id
4. **Rate Limiting**: Consider adding rate limits in production
5. **HTTPS**: Use HTTPS in production environment

---

## 🚀 Next Steps (Phase 3)

- [ ] Implement query endpoint for RAG retrieval
- [ ] Add LLM integration for question answering
- [ ] Implement conversation history
- [ ] Add OCR support for image-based PDFs
- [ ] Create batch processing for multiple files
- [ ] Add user analytics and usage tracking

---

## 📞 Support

For issues or questions:
1. Check logs in console output
2. Verify all environment variables
3. Test with `/api/health` endpoint
4. Review Pinecone and Supabase dashboards

---

## ✅ Testing Checklist

Before deployment:
- [ ] All environment variables configured
- [ ] Health check endpoint returns healthy status
- [ ] Successfully ingest a test PDF
- [ ] Verify vectors in Pinecone dashboard
- [ ] Test delete endpoint
- [ ] Frontend can successfully call backend
- [ ] Error handling works for invalid files
- [ ] CORS configured for your frontend domain

---

**Phase 2 Implementation Complete! 🎉**

The backend is now ready to ingest documents and prepare them for RAG-based question answering in Phase 3.
