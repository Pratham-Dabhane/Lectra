# 🚀 Lectra Backend - Phase 2 Complete Setup Guide

## 📦 What Was Created

A complete FastAPI backend service with the following structure:

```
backend/
├── main.py                      # FastAPI application entry point
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variable template
├── .gitignore                   # Git ignore rules
├── README.md                    # Quick start guide
├── PHASE_2.md                   # Complete documentation
├── setup.bat                    # Windows setup script
├── start.bat                    # Windows start script
├── test_setup.py               # Setup validation script
├── package.json                # Project metadata
│
├── routes/
│   └── ingest.py               # API endpoints for document ingestion
│
├── services/
│   ├── supabase_client.py      # Supabase Storage integration
│   ├── text_extractor.py       # PDF/TXT text extraction
│   ├── embeddings.py           # LangChain embedding generation
│   └── vector_store.py         # Pinecone vector operations
│
└── utils/
    └── logger.py               # Logging configuration
```

---

## 🎯 Quick Start (5 Minutes)

### Option 1: Using Setup Script (Recommended for Windows)

```powershell
# Navigate to backend folder
cd backend

# Run setup script
.\setup.bat

# Edit .env file with your credentials
notepad .env

# Start server
.\start.bat
```

### Option 2: Manual Setup

```powershell
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.example .env

# Edit .env with your credentials
notepad .env

# Start server
python main.py
```

---

## ⚙️ Configuration

### Required Environment Variables

Open `.env` and add:

```env
# Supabase (Get from: https://app.supabase.com/project/_/settings/api)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-anon-key

# Pinecone (Get from: https://app.pinecone.io/)
PINECONE_API_KEY=your-api-key
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX_NAME=lectra-embeddings

# OpenAI (Optional - Get from: https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-key
EMBEDDING_MODEL=openai
EMBEDDING_DIMENSION=1536
```

**Note:** If you don't have OpenAI API key, the system will automatically use free Mistral embeddings.

---

## 🧪 Testing Your Setup

### Step 1: Validate Setup

```powershell
# With server running in one terminal, open another and run:
python test_setup.py
```

This will test:
- ✅ Environment variables
- ✅ Server connectivity
- ✅ Pinecone connection
- ✅ API endpoints

### Step 2: Test Health Endpoint

Open browser: http://localhost:8000/api/health

Expected response:
```json
{
  "status": "healthy",
  "service": "Lectra Backend API",
  "pinecone_connected": true,
  "index_stats": {
    "total_vectors": 0,
    "dimension": 1536,
    "index_fullness": 0.0
  }
}
```

### Step 3: Test API Documentation

Open: http://localhost:8000/docs

You should see interactive Swagger UI with all endpoints.

---

## 📤 Testing Document Ingestion

### Using Postman:

1. **Upload a file via frontend** (http://localhost:3000)
2. **Copy the file URL** from Supabase Storage
3. **Create POST request** in Postman:
   - URL: `http://localhost:8000/api/ingest`
   - Method: POST
   - Headers: `Content-Type: application/json`
   - Body:
   ```json
   {
     "file_url": "https://xxxxx.supabase.co/storage/v1/object/public/user-docs/file.pdf",
     "user_id": "your-user-uuid"
   }
   ```

### Using cURL:

```bash
curl -X POST http://localhost:8000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "file_url": "YOUR_FILE_URL",
    "user_id": "YOUR_USER_ID"
  }'
```

### Expected Response:

```json
{
  "status": "success",
  "message": "Document ingested successfully. Stored 45 vectors.",
  "vectors_stored": 45,
  "chunks_created": 45,
  "file_name": "document.pdf",
  "user_id": "user-uuid"
}
```

---

## 🔍 Verifying Results

### 1. Check Server Logs

You should see:
```
INFO - Starting document ingestion for user: xxx
INFO - Step 1: Downloading file from Supabase Storage...
INFO - Step 2: Extracting text from document...
INFO - Step 3: Splitting text into chunks...
INFO - Step 4: Generating embeddings...
INFO - Step 5: Storing vectors in Pinecone...
INFO - Successfully stored 45 vectors in Pinecone
```

### 2. Check Pinecone Dashboard

1. Go to https://app.pinecone.io/
2. Select your index (`lectra-embeddings`)
3. Check "Stats" tab - vector count should increase
4. Click "Query" to test vector retrieval

### 3. Query Stored Vectors

Use the Pinecone console or API to verify metadata:
```json
{
  "user_id": "uuid",
  "file_name": "document.pdf",
  "chunk_index": 0,
  "chunk_text": "First 1000 chars of chunk...",
  "total_chunks": 45
}
```

---

## 🎓 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/api/health` | Health check & stats |
| POST | `/api/ingest` | Ingest document |
| DELETE | `/api/vectors/{user_id}/{file_name}` | Delete vectors |
| GET | `/docs` | Swagger UI |
| GET | `/redoc` | ReDoc documentation |

---

## 🐛 Common Issues & Solutions

### Issue: "Module not found" errors
```powershell
pip install -r requirements.txt --force-reinstall
```

### Issue: "Pinecone connection failed"
- Check `PINECONE_API_KEY` in `.env`
- Verify index name matches `PINECONE_INDEX_NAME`
- Index will be auto-created on first run

### Issue: "OpenAI API error"
- System will automatically fall back to Mistral (free)
- Or set `EMBEDDING_MODEL=mistral` in `.env`

### Issue: "No text extracted from PDF"
- PDF might be image-based (needs OCR)
- Try a different PDF with text content

### Issue: CORS errors from frontend
Edit `main.py` and add your frontend URL:
```python
allow_origins=["http://localhost:3000", "your-frontend-url"]
```

---

## 📊 Performance Expectations

| Document Size | Processing Time | Chunks | Vectors |
|--------------|----------------|--------|---------|
| 1-5 pages | 5-10 seconds | 5-10 | 5-10 |
| 10-50 pages | 15-30 seconds | 20-50 | 20-50 |
| 50-100 pages | 30-60 seconds | 50-100 | 50-100 |

*Times vary based on embedding model and internet speed*

---

## 🔐 Security Checklist

- [ ] `.env` file is NOT committed to git (check `.gitignore`)
- [ ] All API keys are kept secure
- [ ] File size limits are enforced (default: 10MB)
- [ ] CORS is configured for your frontend only
- [ ] Vectors are scoped by user_id
- [ ] Use HTTPS in production

---

## 📚 Documentation

- **Quick Start**: `README.md`
- **Complete Guide**: `PHASE_2.md` (comprehensive documentation)
- **API Docs**: http://localhost:8000/docs (when server is running)

---

## 🚀 Next Steps

### Immediate:
1. ✅ Complete Phase 2 setup
2. ✅ Test document ingestion
3. ✅ Verify vectors in Pinecone

### Phase 3 (Coming Next):
- [ ] Implement RAG query endpoint
- [ ] Add LLM integration (OpenAI/Mistral)
- [ ] Create conversation history
- [ ] Build chat interface in frontend
- [ ] Add streaming responses

---

## 💡 Tips for Success

1. **Start with small PDFs** (< 5 pages) for initial testing
2. **Monitor logs** to understand the ingestion flow
3. **Check Pinecone dashboard** regularly to verify storage
4. **Use Swagger UI** for interactive API testing
5. **Read PHASE_2.md** for detailed troubleshooting

---

## 📞 Getting Help

If you encounter issues:

1. **Check logs** in terminal
2. **Run test script**: `python test_setup.py`
3. **Verify environment**: Check all variables in `.env`
4. **Test endpoints**: Use `/api/health` to diagnose
5. **Review docs**: See `PHASE_2.md` for detailed guides

---

## ✅ Setup Verification Checklist

Before moving to Phase 3:

- [ ] Virtual environment created and activated
- [ ] All dependencies installed successfully
- [ ] `.env` file configured with valid credentials
- [ ] Server starts without errors
- [ ] Health check returns "healthy" status
- [ ] Successfully ingested a test PDF
- [ ] Vectors visible in Pinecone dashboard
- [ ] Delete endpoint works correctly
- [ ] Frontend can call backend (CORS configured)

---

## 🎉 Congratulations!

Your FastAPI backend is now fully operational! You can:
- ✅ Ingest PDF and TXT documents
- ✅ Extract and chunk text automatically
- ✅ Generate embeddings (OpenAI or Mistral)
- ✅ Store vectors in Pinecone with metadata
- ✅ Query and delete vectors by user/file

**Phase 2 Complete! Ready for Phase 3 (RAG Query & Chat)** 🚀

---

*For detailed documentation, troubleshooting, and advanced features, see `PHASE_2.md`*
