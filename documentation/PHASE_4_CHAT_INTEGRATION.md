# Phase 4: Chat Interface Integration

## Overview
Phase 4 connects the FastAPI RAG backend with the Next.js frontend, providing users with a live chat interface to ask questions about their uploaded documents.

---

## 🎯 Features Implemented

### Frontend (`/chat` page)
✅ Real-time chat interface with user and AI message bubbles  
✅ Message history with timestamps  
✅ Loading states with animated indicators  
✅ Source references display (clickable file links with relevance scores)  
✅ Error handling with user-friendly messages  
✅ Auto-scroll to latest message  
✅ Input validation (no empty messages)  
✅ Logout functionality  
✅ Responsive design (mobile-friendly)  
✅ Tailwind CSS styling with modern UI

### Backend Updates
✅ CORS middleware configured for `localhost:3000` and `localhost:3001`  
✅ `/api/ask` endpoint operational with Groq API  
✅ Returns structured responses with answer and references  
✅ Environment variables loaded from `.env`

### Navigation
✅ Updated Navbar with Home and Chat links  
✅ "Start Chatting with AI" CTA button on home page  
✅ Authentication protection on chat page

---

## 🚀 Running the Application Locally

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.11+
- Supabase account (for authentication & storage)
- Pinecone account (for vector database)
- Groq API key (for LLM responses)

### Step 1: Start the Backend

```bash
# Navigate to backend folder
cd backend

# Activate virtual environment (if not already active)
.venv\Scripts\Activate.ps1    # Windows PowerShell
# or
source .venv/bin/activate      # macOS/Linux

# Ensure environment variables are set in .env
# Required:
# - SUPABASE_URL
# - SUPABASE_KEY
# - PINECONE_API_KEY
# - PINECONE_ENVIRONMENT
# - PINECONE_INDEX_NAME
# - GROQ_API_KEY
# - GROQ_MODEL

# Start FastAPI server
uvicorn main:app --reload
```

**Backend will run on:** `http://localhost:8000`

**Health checks:**
- Main API: `http://localhost:8000/`
- RAG health: `http://localhost:8000/api/ask/health`
- API docs: `http://localhost:8000/docs`

---

### Step 2: Start the Frontend

```bash
# Navigate to project root (if in backend folder)
cd ..

# Install dependencies (if not already done)
npm install

# Ensure .env.local has Supabase credentials
# Required:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY

# Start Next.js dev server
npm run dev
```

**Frontend will run on:** `http://localhost:3000`

---

## 📋 Testing Workflow

### End-to-End Test

1. **Login**
   - Navigate to `http://localhost:3000/auth`
   - Sign up or login with email/password
   - You'll be redirected to the dashboard

2. **Upload a Document**
   - On the home page (`/`), use the file upload component
   - Upload a PDF or TXT file (your notes, study materials, etc.)
   - Wait for successful upload confirmation
   - The file will be stored in Supabase and indexed in Pinecone

3. **Go to Chat**
   - Click "Start Chatting with AI" button on home page
   - OR click "💬 Chat" in the navbar
   - You'll see the chat interface

4. **Ask Questions**
   - Type a question about your uploaded document
   - Example: "What are the main topics covered in this document?"
   - Click "Send" or press Enter
   - Watch the loading animation
   - AI response appears with source references

5. **View References**
   - Each AI response shows source documents
   - File name, relevance score (%), and excerpt are displayed
   - Multiple sources may be cited for a single answer

6. **Test Error Handling**
   - Try sending an empty message (button should be disabled)
   - Stop the backend server and send a message (error message appears)
   - Check that proper error toast notifications appear

---

## 🔌 API Integration Details

### POST `/api/ask`

**Request:**
```json
{
  "query": "What is machine learning?",
  "user_id": "user-uuid-here",
  "top_k": 3,
  "max_length": 512,
  "temperature": 0.7
}
```

**Response:**
```json
{
  "answer": "Machine learning is a subset of artificial intelligence...",
  "references": [
    {
      "file_name": "notes.pdf",
      "chunk_index": 2,
      "relevance_score": 0.89,
      "excerpt": "Machine learning involves training algorithms..."
    }
  ]
}
```

**Error Response:**
```json
{
  "detail": "Failed to process question: <error details>"
}
```

---

## 🎨 UI/UX Features

### Chat Interface
- **User messages:** Blue bubbles aligned to the right
- **AI messages:** Gray bubbles aligned to the left
- **Timestamps:** Small gray text below each message
- **Loading state:** Three animated dots in a bubble
- **References:** Collapsible cards with file info and excerpts

### Responsive Design
- Desktop: Max width 1280px, centered layout
- Tablet: Adjusted padding and font sizes
- Mobile: Single column, stacked elements, touch-friendly buttons

### Accessibility
- Keyboard navigation (Enter to send)
- Focus states on interactive elements
- High contrast text for readability
- Loading indicators with visual feedback

---

## 🔐 Security & Environment Variables

### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Backend (`backend/.env`)
```bash
# Supabase
SUPABASE_URL=your-supabase-project-url
SUPABASE_KEY=your-supabase-anon-key

# Pinecone
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment
PINECONE_INDEX_NAME=lectra-embeddings

# Embedding Configuration
EMBEDDING_MODEL=sentence-transformers/all-mpnet-base-v2
EMBEDDING_DIMENSION=768

# Application
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
MAX_FILE_SIZE_MB=10

# Groq API
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=mixtral-8x7b-32768
RAG_MAX_TOKENS=512
RAG_TEMPERATURE=0.7
RAG_TOP_K_RETRIEVAL=3
```

**⚠️ Never commit `.env` or `.env.local` files to version control!**

---

## 🐛 Troubleshooting

### "Failed to get response" error
**Cause:** Backend server is not running  
**Solution:** Start the backend with `uvicorn main:app --reload` in the `backend/` directory

### "CORS error" in browser console
**Cause:** Frontend URL not in CORS allowed origins  
**Solution:** Check `backend/main.py` - ensure `http://localhost:3000` is in `allow_origins`

### "No relevant information found"
**Cause:** No documents uploaded for this user OR question not related to uploaded content  
**Solution:** Upload documents first, then ask questions about their content

### "401 Unauthorized" from Groq API
**Cause:** Invalid or missing `GROQ_API_KEY`  
**Solution:** Check `backend/.env` and ensure key is correct (starts with `gsk_`)

### Chat messages not appearing
**Cause:** JavaScript console errors  
**Solution:** Check browser console (F12) for errors, ensure React state is updating

### File upload works but chat doesn't find documents
**Cause:** Documents not ingested into vector database  
**Solution:** Check if `/api/ingest` endpoint was called after upload (currently manual step)

---

## 📦 Dependencies

### Frontend
- `next`: ^13.0.0
- `react`: ^18.0.0
- `react-hot-toast`: ^2.4.1
- `@supabase/supabase-js`: ^2.0.0

### Backend
- `fastapi`: 0.104.1
- `uvicorn[standard]`: 0.24.0
- `groq`: >=0.4.0
- `pinecone-client`: 3.0.0
- `supabase`: 2.0.3
- `sentence-transformers`: >=2.2.2

---

## 🔄 Future Enhancements

### Planned Features
- [ ] Automatic document ingestion after upload (webhook/queue)
- [ ] Chat history persistence (save to Supabase)
- [ ] Multi-session chat rooms
- [ ] Voice input/output
- [ ] Export chat transcripts
- [ ] Real-time typing indicators
- [ ] Message reactions/feedback
- [ ] Code syntax highlighting in messages
- [ ] File preview in references
- [ ] Dark mode toggle

### Performance Optimizations
- [ ] Message pagination (load older messages on scroll)
- [ ] Caching frequent queries
- [ ] WebSocket for real-time updates
- [ ] Lazy loading of reference excerpts
- [ ] Debounced input for search-as-you-type

---

## 📊 Architecture

```
┌─────────────────┐
│   Next.js       │
│   Frontend      │
│   (Port 3000)   │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│   FastAPI       │
│   Backend       │
│   (Port 8000)   │
└────┬────┬───┬───┘
     │    │   │
     │    │   └──────────┐
     │    │              │
┌────▼────▼────┐    ┌───▼──────┐
│   Supabase   │    │  Groq    │
│  (Storage +  │    │   API    │
│    Auth)     │    │  (LLM)   │
└──────────────┘    └──────────┘
     │
     │
┌────▼────────┐
│  Pinecone   │
│  (Vectors)  │
└─────────────┘
```

---

## ✅ Checklist for Deployment

### Frontend
- [ ] Update API endpoint URL (from `localhost:8000` to production URL)
- [ ] Set production Supabase credentials
- [ ] Enable error tracking (e.g., Sentry)
- [ ] Configure CDN for assets
- [ ] Enable HTTPS
- [ ] Add analytics

### Backend
- [ ] Update CORS origins for production domain
- [ ] Set production environment variables
- [ ] Enable rate limiting
- [ ] Add request logging
- [ ] Configure health checks for uptime monitoring
- [ ] Set up auto-scaling (if needed)

---

## 🎓 Usage Tips

1. **Upload diverse content:** PDFs, lecture notes, textbooks, articles
2. **Ask specific questions:** "What is the definition of X in Chapter 3?"
3. **Use context:** "According to the uploaded notes, how does Y work?"
4. **Check sources:** Always verify AI responses against the reference excerpts
5. **Iterate:** If answer is unclear, rephrase your question

---

## 📞 Support

- **Backend API Docs:** `http://localhost:8000/docs`
- **Backend Health:** `http://localhost:8000/api/ask/health`
- **GitHub Repository:** https://github.com/Pratham-Dabhane/Lectra

---

**Phase 4 Complete! 🎉**

Your personalized learning bot is now fully operational with a chat interface!
