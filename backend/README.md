# Lectra Backend - RAG Document Ingestion Service

FastAPI backend for the Personalized Learning Bot with Retrieval-Augmented Generation (RAG).

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Run server:**
   ```bash
   python main.py
   ```

4. **Test API:**
   - Swagger UI: http://localhost:8000/docs
   - Health Check: http://localhost:8000/api/health

## Documentation

See [PHASE_2.md](PHASE_2.md) for complete setup, testing, and troubleshooting guide.

## Features

✅ PDF & TXT document ingestion  
✅ Automatic text extraction and chunking  
✅ OpenAI & Mistral embedding support  
✅ Pinecone vector storage  
✅ User-scoped document management  
✅ Comprehensive error handling  

## Tech Stack

- **Framework**: FastAPI
- **Text Extraction**: PyMuPDF (fitz)
- **Embeddings**: LangChain + OpenAI/HuggingFace
- **Vector DB**: Pinecone
- **Storage**: Supabase

## API Endpoints

- `POST /api/ingest` - Ingest document
- `GET /api/health` - Health check
- `DELETE /api/vectors/{user_id}/{file_name}` - Delete vectors

---

**For detailed documentation, see [PHASE_2.md](PHASE_2.md)**
