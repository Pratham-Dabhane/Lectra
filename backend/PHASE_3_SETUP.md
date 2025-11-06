# Phase 3: RAG Query System - Setup Guide

## Overview
Phase 3 adds question-answering capabilities using RAG (Retrieval-Augmented Generation) with Mistral 7B.

---

## 🔧 Environment Changes Required

### 1. Update `.env` file

Add these new variables to your `.env` file:

```bash
# RAG / LLM Configuration
RAG_MODEL_NAME=mistralai/Mistral-7B-Instruct-v0.2
RAG_MAX_TOKENS=512
RAG_TEMPERATURE=0.7
RAG_TOP_K_RETRIEVAL=3
```

**All variables explained:**
- `RAG_MODEL_NAME`: Hugging Face model identifier (Mistral 7B Instruct v0.2)
- `RAG_MAX_TOKENS`: Maximum tokens in generated answers (512 = ~400 words)
- `RAG_TEMPERATURE`: Creativity level (0.7 = balanced, 0.0 = deterministic, 1.0 = creative)
- `RAG_TOP_K_RETRIEVAL`: Number of context chunks retrieved from Pinecone (3 recommended)

---

## 📦 Install New Dependencies

### Step 1: Activate virtual environment
```powershell
.venv\Scripts\Activate.ps1
```

### Step 2: Install packages
```powershell
pip install transformers>=4.35.0 accelerate>=0.25.0 bitsandbytes>=0.41.0
```

**Package purposes:**
- `transformers`: Load and run Mistral 7B model
- `accelerate`: Optimize model loading and GPU usage
- `bitsandbytes`: Enable quantization for memory efficiency

### Step 3: Verify installation
```powershell
python -c "from transformers import AutoModelForCausalLM; print('✓ OK')"
```

---

## 🚀 First Time Model Download

**Important:** Mistral 7B model is ~14GB. First run will download the model.

### Download time estimates:
- Fast internet (100 Mbps): ~20 minutes
- Medium internet (25 Mbps): ~1 hour
- Slow internet (10 Mbps): ~3 hours

### Pre-download (recommended):
```powershell
python -c "from transformers import AutoModelForCausalLM, AutoTokenizer; AutoTokenizer.from_pretrained('mistralai/Mistral-7B-Instruct-v0.2'); AutoModelForCausalLM.from_pretrained('mistralai/Mistral-7B-Instruct-v0.2', torch_dtype='auto')"
```

Model caches to: `C:\Users\<YourUser>\.cache\huggingface\hub\`

---

## 🖥️ Hardware Requirements

### Minimum (CPU mode):
- RAM: 16GB+ (Mistral 7B in FP32 uses ~28GB, but with optimizations ~14GB)
- Storage: 20GB free space
- Speed: 2-5 seconds per answer

### Recommended (GPU mode):
- GPU: NVIDIA with 8GB+ VRAM (RTX 3060, RTX 4060, etc.)
- RAM: 8GB system RAM
- CUDA: 11.8+ or 12.x
- Speed: 0.5-1 second per answer

### Check your setup:
```powershell
python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}'); print(f'Device: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"CPU\"}')"
```

---

## 🔄 No Code Changes Needed

The following files have been **automatically created/updated**:
- ✅ `backend/services/rag_pipeline.py` - RAG orchestration service
- ✅ `backend/routes/ask.py` - `/api/ask` endpoint
- ✅ `backend/main.py` - Updated with ask route
- ✅ `backend/requirements.txt` - Updated with new dependencies
- ✅ `backend/.env.example` - Updated with RAG config

**You only need to:**
1. Update `.env` with the 4 new variables above
2. Install the 3 new Python packages
3. Wait for model download on first run

---

## 🧪 Testing Phase 3

### Step 1: Start backend server
```powershell
cd backend
.venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

**First startup will:**
- Download Mistral 7B (~14GB) if not cached
- Load model into memory (~14-28GB RAM or 8GB+ VRAM)
- Take 5-15 minutes on first run

### Step 2: Check RAG health
```powershell
curl http://localhost:8000/api/ask/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cuda",  // or "cpu"
  "model_name": "mistralai/Mistral-7B-Instruct-v0.2"
}
```

### Step 3: Test question answering

**Using curl:**
```powershell
curl -X POST http://localhost:8000/api/ask `
  -H "Content-Type: application/json" `
  -d '{\"query\": \"What is this document about?\", \"user_id\": \"your-user-id\"}'
```

**Using Postman:**
- Method: `POST`
- URL: `http://localhost:8000/api/ask`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "query": "What is this document about?",
  "user_id": "your-user-id",
  "top_k": 3,
  "max_length": 512,
  "temperature": 0.7
}
```

**Expected response:**
```json
{
  "answer": "Based on the provided context, this document discusses...",
  "references": [
    {
      "file_name": "example.pdf",
      "chunk_index": 0,
      "relevance_score": 0.89,
      "excerpt": "This is the beginning of the document..."
    }
  ]
}
```

---

## 📝 API Endpoint Details

### POST `/api/ask`

**Request Body:**
```typescript
{
  query: string;           // Question to ask (required)
  user_id: string;         // User identifier (required)
  top_k?: number;          // Context chunks (1-10, default 3)
  max_length?: number;     // Max response tokens (50-1024, default 512)
  temperature?: number;    // Creativity (0.0-1.0, default 0.7)
}
```

**Response:**
```typescript
{
  answer: string;          // Generated answer
  references: Array<{      // Source documents
    file_name: string;
    chunk_index: number;
    relevance_score: number;
    excerpt: string;
  }>;
}
```

**Status Codes:**
- `200`: Success
- `422`: Validation error (missing query/user_id)
- `500`: Server error (model not loaded, Pinecone error, etc.)

---

## ⚡ Performance Optimization Tips

### For CPU users:
1. Reduce `RAG_MAX_TOKENS` to 256 for faster responses
2. Lower `RAG_TEMPERATURE` to 0.5 for less computation
3. Use `RAG_TOP_K_RETRIEVAL=2` to retrieve fewer chunks
4. Consider upgrading RAM to 32GB

### For GPU users:
1. Ensure CUDA drivers are up to date
2. Close other GPU-intensive apps (games, video editors)
3. Monitor VRAM: `nvidia-smi` (should have 2GB+ free)

### For slow internet:
1. Download model overnight using pre-download command
2. Or use smaller model: `TinyLlama/TinyLlama-1.1B-Chat-v1.0` (1GB)
   - Edit `services/rag_pipeline.py`, line 19: change `model_name`

---

## 🐛 Troubleshooting

### "CUDA out of memory"
**Solution:** Add to `.env`:
```bash
PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512
```
Or switch to CPU mode (automatic fallback).

### "Model download stuck"
**Solution:** Clear cache and retry:
```powershell
Remove-Item -Recurse -Force $env:USERPROFILE\.cache\huggingface\hub\models--mistralai*
```

### "Server takes 5+ minutes to start"
**Expected:** First run downloads ~14GB model. Subsequent runs load from cache (~30 seconds).

### "Empty references array"
**Cause:** No documents ingested for this `user_id`.
**Solution:** Use `/api/ingest` endpoint first to upload documents.

### "Answer quality is poor"
**Solutions:**
1. Increase `RAG_TOP_K_RETRIEVAL` to 5
2. Lower `RAG_TEMPERATURE` to 0.5 (more focused)
3. Check Pinecone has vectors: `http://localhost:8000/api/health`

---

## 📊 Next Steps

1. **Update `.env`** with 4 new RAG variables
2. **Install packages**: `pip install transformers accelerate bitsandbytes`
3. **Start server**: Wait for model download (~14GB)
4. **Test endpoint**: Use curl or Postman with sample query
5. **Integrate frontend**: Add Ask component to call `/api/ask`

---

## 🎯 Summary

**What you need to do:**
- ✏️ Add 4 lines to `.env` file
- 📥 Run 1 pip install command
- ⏱️ Wait for model download (first time only)

**What's already done:**
- ✅ All code files created
- ✅ Routes configured
- ✅ Pipeline implemented
- ✅ Error handling added
- ✅ Optimizations included

**Total setup time:** 5 minutes (+ model download time)
