# Lectra Backend Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                    (Next.js + React)                            │
│                   http://localhost:3000                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    FASTAPI BACKEND                              │
│                  http://localhost:8000                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Routes Layer                                │  │
│  │  • POST /api/ingest                                      │  │
│  │  • GET  /api/health                                      │  │
│  │  • DELETE /api/vectors/{user_id}/{file_name}            │  │
│  └────────────────────┬────────────────────────────────────┘  │
│                       │                                         │
│  ┌────────────────────▼────────────────────────────────────┐  │
│  │           Services Layer                                 │  │
│  │                                                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │  │
│  │  │  Supabase    │  │    Text      │  │  Embeddings  │ │  │
│  │  │   Client     │  │  Extractor   │  │   Service    │ │  │
│  │  │              │  │              │  │              │ │  │
│  │  │ • Download   │  │ • PDF Parse  │  │ • Text Split │ │  │
│  │  │   files      │  │   (PyMuPDF)  │  │ • OpenAI/    │ │  │
│  │  │ • Validate   │  │ • TXT Parse  │  │   Mistral    │ │  │
│  │  │   access     │  │ • Validate   │  │ • Generate   │ │  │
│  │  │              │  │   content    │  │   vectors    │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │          Vector Store Service                     │  │
│  │  │                                                   │  │
│  │  │  • Manage Pinecone index                         │  │
│  │  │  • Upsert vectors with metadata                  │  │
│  │  │  • Query similar documents                       │  │
│  │  │  • Delete user vectors                           │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Utils Layer                                 │  │
│  │  • Logger (structured logging)                          │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌────────────────┐  ┌────────────────┐
│   SUPABASE    │  │   LANGCHAIN    │  │   PINECONE     │
│   STORAGE     │  │   + MODELS     │  │  VECTOR DB     │
│               │  │                │  │                │
│ • File Store  │  │ • OpenAI API   │  │ • Index Store  │
│ • Public URLs │  │ • HuggingFace  │  │ • Query Engine │
│ • Auth        │  │ • Text Split   │  │ • Metadata     │
└───────────────┘  └────────────────┘  └────────────────┘
```

## Data Flow Diagram

```
Upload Document (User)
      │
      ▼
┌─────────────────┐
│ 1. UPLOAD       │  Frontend uploads to Supabase Storage
│    (Frontend)   │  → Gets public URL
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. INGEST       │  POST /api/ingest
│    (API Call)   │  { file_url, user_id }
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. DOWNLOAD     │  Supabase Client downloads file
│    (Backend)    │  → Validates size and access
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. EXTRACT      │  Text Extractor processes file
│    (Backend)    │  → PDF: PyMuPDF extracts text
└────────┬────────┘  → TXT: Decode with UTF-8
         │
         ▼
┌─────────────────┐
│ 5. CHUNK        │  Embedding Service splits text
│    (Backend)    │  → 1000 char chunks
└────────┬────────┘  → 200 char overlap
         │
         ▼
┌─────────────────┐
│ 6. EMBED        │  Generate vector embeddings
│    (LangChain)  │  → OpenAI: ada-002 (1536-dim)
└────────┬────────┘  → Mistral: MiniLM (384-dim)
         │
         ▼
┌─────────────────┐
│ 7. STORE        │  Vector Store upserts to Pinecone
│    (Pinecone)   │  → With metadata: user_id, chunk_text,
└────────┬────────┘     file_name, chunk_index, timestamp
         │
         ▼
┌─────────────────┐
│ 8. RESPONSE     │  Return success + stats
│    (API)        │  { status, vectors_stored, chunks_created }
└─────────────────┘
```

## Component Responsibilities

### 1. Routes Layer (`routes/ingest.py`)
**Responsibility**: HTTP endpoint handling and request/response management
- Validates incoming requests (Pydantic models)
- Orchestrates service calls
- Handles errors and returns appropriate HTTP responses
- Provides API documentation (OpenAPI/Swagger)

### 2. Supabase Client (`services/supabase_client.py`)
**Responsibility**: File retrieval from cloud storage
- Downloads files from Supabase Storage using public URLs
- Handles authentication with Supabase API key
- Manages file metadata retrieval
- Error handling for network issues

### 3. Text Extractor (`services/text_extractor.py`)
**Responsibility**: Document parsing and text extraction
- PDF processing using PyMuPDF (fitz library)
- TXT file parsing with multiple encoding support
- File size validation (default: 10MB limit)
- Page-by-page processing for large documents
- Error handling for corrupted/invalid files

### 4. Embedding Service (`services/embeddings.py`)
**Responsibility**: Text chunking and embedding generation
- Text splitting using RecursiveCharacterTextSplitter
- Dual model support:
  - OpenAI: `text-embedding-ada-002` (1536 dimensions)
  - Mistral: `all-MiniLM-L6-v2` (384 dimensions)
- Automatic fallback if OpenAI unavailable
- Configurable chunk size and overlap

### 5. Vector Store (`services/vector_store.py`)
**Responsibility**: Vector database management
- Pinecone index lifecycle management
- Vector upsert with rich metadata
- Batch processing (100 vectors per batch)
- Query similar vectors for retrieval
- User-scoped deletion
- Index statistics tracking

### 6. Logger (`utils/logger.py`)
**Responsibility**: Structured logging across application
- Console output with timestamps
- Different log levels (INFO, ERROR, WARNING)
- Consistent format across all services
- Debugging support

## Data Models

### IngestRequest
```python
{
  "file_url": str,      # Required: Supabase Storage URL
  "user_id": str,       # Required: User UUID
  "file_name": str      # Optional: File name (auto-extracted)
}
```

### IngestResponse
```python
{
  "status": str,           # "success" or "error"
  "message": str,          # Human-readable message
  "vectors_stored": int,   # Number of vectors in Pinecone
  "chunks_created": int,   # Number of text chunks
  "file_name": str,        # Name of processed file
  "user_id": str          # User who uploaded
}
```

### Vector Metadata (Pinecone)
```python
{
  "user_id": str,         # User UUID for filtering
  "file_name": str,       # Original file name
  "file_url": str,        # Source URL
  "chunk_index": int,     # Position in document
  "chunk_text": str,      # First 1000 chars of chunk
  "total_chunks": int,    # Total chunks in document
  "timestamp": int        # Unix timestamp
}
```

## Technology Stack

### Core Framework
- **FastAPI**: Modern Python web framework
  - Async support
  - Auto-generated OpenAPI docs
  - Pydantic validation
  - High performance

### Document Processing
- **PyMuPDF (fitz)**: PDF text extraction
  - Fast and reliable
  - Page-by-page processing
  - Maintains formatting

### AI/ML Libraries
- **LangChain**: RAG framework
  - Text splitting utilities
  - Embedding abstractions
  - Multiple model support

- **OpenAI**: High-quality embeddings
  - text-embedding-ada-002
  - 1536 dimensions
  - Best for semantic search

- **HuggingFace Sentence Transformers**: Free alternative
  - all-MiniLM-L6-v2
  - 384 dimensions
  - Good performance, no API costs

### Vector Database
- **Pinecone**: Managed vector database
  - Serverless deployment
  - Fast similarity search
  - Metadata filtering
  - Free tier available

### Cloud Services
- **Supabase Storage**: File storage
  - PostgreSQL-backed
  - Public/private buckets
  - CDN distribution

## Security Architecture

```
┌─────────────────────────────────────────┐
│           Security Layers               │
├─────────────────────────────────────────┤
│                                         │
│ 1. API Key Authentication               │
│    • Supabase: Service key              │
│    • Pinecone: API key                  │
│    • OpenAI: API key                    │
│                                         │
│ 2. Request Validation                   │
│    • Pydantic models                    │
│    • URL format validation              │
│    • User ID validation                 │
│                                         │
│ 3. File Size Limits                     │
│    • Max 10MB (configurable)            │
│    • Prevents DoS attacks               │
│                                         │
│ 4. User Isolation                       │
│    • Vectors scoped by user_id          │
│    • Metadata filtering in queries      │
│                                         │
│ 5. CORS Configuration                   │
│    • Whitelist frontend origins         │
│    • Credentials support                │
│                                         │
│ 6. Error Handling                       │
│    • No sensitive data in errors        │
│    • Sanitized error messages           │
│                                         │
└─────────────────────────────────────────┘
```

## Scalability Considerations

### Current Implementation
- Synchronous processing
- Single-threaded file handling
- In-memory text processing
- Suitable for: Small to medium deployments (< 100 concurrent users)

### Future Enhancements (Phase 3+)
- **Async Processing**: Background job queues (Celery/Redis)
- **Batch Upload**: Multiple files at once
- **Caching**: Redis for frequent queries
- **Load Balancing**: Multiple FastAPI instances
- **Database**: PostgreSQL for metadata/history
- **Monitoring**: Prometheus + Grafana
- **Rate Limiting**: Per-user request limits

## Environment Configuration

```
Development Environment:
├── Local FastAPI server (localhost:8000)
├── Local development with hot reload
├── Console logging
└── .env file for secrets

Production Environment:
├── Cloud deployment (AWS/GCP/Azure)
├── HTTPS required
├── Structured logging to cloud
├── Environment variables from secrets manager
└── Auto-scaling enabled
```

---

## Key Design Decisions

### Why FastAPI?
- ✅ Modern Python async framework
- ✅ Auto-generated API documentation
- ✅ Built-in validation with Pydantic
- ✅ High performance (similar to Node.js)
- ✅ Easy to test and maintain

### Why Pinecone?
- ✅ Managed service (no infrastructure)
- ✅ Fast similarity search
- ✅ Metadata filtering
- ✅ Free tier for development
- ✅ Scales automatically

### Why LangChain?
- ✅ Abstracts embedding complexity
- ✅ Multiple model support
- ✅ Text splitting utilities
- ✅ RAG-focused design
- ✅ Active community

### Why PyMuPDF?
- ✅ Fast PDF processing
- ✅ Good text extraction quality
- ✅ Handles large files well
- ✅ Active maintenance
- ✅ Permissive license

---

*This architecture is designed for Phase 2. Phase 3 will add query/chat capabilities.*
