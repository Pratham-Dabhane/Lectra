# 🧠 Lectra - Personalized Learning Bot with RAG

**AI-powered study assistant that learns from your documents**

Upload PDFs, ask questions, get instant answers with source citations. Built with RAG (Retrieval-Augmented Generation) for accurate, context-aware responses.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat&logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green?style=flat&logo=supabase)

---

## ✨ Features

### 🎯 Core Capabilities
- **💬 Intelligent Chat** - Ask questions about your uploaded documents
- **📚 Context Memory** - Remembers previous conversations for smarter answers
- **📄 Multi-format Support** - PDF, TXT, and more
- **🔍 Source Citations** - Every answer shows where it came from
- **⚡ Fast Responses** - Powered by Groq API (< 2 seconds)
- **🔐 Secure** - User authentication and data privacy with Supabase

### 🧠 Advanced AI Features
- **Vector Search** - Pinecone-powered semantic document retrieval
- **Chat History** - Auto-saves conversations across sessions
- **Context-Aware** - Uses last 3 chats for better follow-up answers
- **Source Ranking** - Shows relevance scores (65-95% match)

### 🎓 Phase 6: Advanced Study Features (NEW!)
- **📄 Export to PDF** - Save conversations as formatted PDFs
- **🔗 Cross-Referencing** - Link related concepts across documents
- **📊 Study Analytics** - Track progress, streaks, and topic trends
- **🎴 Smart Flashcards** - AI-generated cards with spaced repetition

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 + TypeScript | Modern React framework |
| **Backend** | FastAPI + Python 3.11 | High-performance API |
| **LLM** | Llama 3.3 70B (Groq) | Answer generation |
| **Embeddings** | all-mpnet-base-v2 | Text → 768-dim vectors |
| **Vector DB** | Pinecone | Semantic search |
| **Database** | Supabase Postgres | User data & chat history |
| **Storage** | Supabase Storage | Document files |
| **Auth** | Supabase Auth | User authentication |

**All services have FREE tiers! 🎉**

---

## 🚀 Quick Start

### 1️⃣ Prerequisites
- Node.js 18+ 
- Python 3.11+
- Accounts: [Supabase](https://supabase.com), [Pinecone](https://pinecone.io), [Groq](https://console.groq.com)

### 2️⃣ Clone & Install
```bash
git clone https://github.com/Pratham-Dabhane/lectra.git
cd lectra

# Frontend
npm install

# Backend
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt
```

### 3️⃣ Configure Environment

**Frontend (`.env.local`):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Backend (`backend/.env`):**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=lectra-embeddings
GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama-3.3-70b-versatile
```

### 4️⃣ Setup Database

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to SQL Editor → New Query
3. Copy & run: `backend/database/migration_phase5.sql`

### 5️⃣ Run Application
```bash
# Terminal 1 - Frontend
npm run dev
# → http://localhost:3000

# Terminal 2 - Backend
cd backend
..\.venv\Scripts\python.exe -m uvicorn main:app --reload
# → http://localhost:8000
```

### 6️⃣ Test It!
1. Sign up at http://localhost:3000/auth
2. Upload a PDF document
3. Click "Chat" in navbar
4. Ask questions about your document!

📖 **Full setup guide:** [SETUP.md](SETUP.md)

---

## 📁 Project Structure

```
lectra/
├── pages/
│   ├── auth.tsx           # Login/signup
│   ├── index.tsx          # Upload & file list
│   └── chat.tsx           # Q&A interface
├── components/
│   ├── FileUpload.tsx     # Drag & drop upload
│   ├── FileList.tsx       # Uploaded files display
│   └── Navbar.tsx         # Navigation
├── backend/
│   ├── main.py            # FastAPI app
│   ├── routes/
│   │   ├── ingest.py      # Document processing
│   │   ├── ask.py         # Q&A endpoint
│   │   └── history.py     # Chat history
│   ├── services/
│   │   ├── rag_pipeline.py       # RAG orchestration
│   │   ├── chat_history.py       # Conversation memory
│   │   ├── embeddings.py         # Text embeddings
│   │   └── vector_store.py       # Pinecone operations
│   └── database/
│       └── migration_phase5.sql  # DB schema
└── documentation/
    ├── PHASE_3_SETUP.md
    ├── PHASE_4_CHAT_INTEGRATION.md
    ├── PHASE_5_MEMORY.md
    ├── PHASE_5_IMPLEMENTATION.md
    └── ARCHITECTURE.md
```

---

## 🎯 How It Works

### Document Upload → Ingestion
```
1. User uploads PDF → Supabase Storage
2. Backend extracts text → Chunks (1000 chars each)
3. Generate embeddings → 768-dim vectors
4. Store in Pinecone with metadata (user_id, file_name, chunk_index)
```

### Question Answering (RAG)
```
1. User asks question → Generate query embedding
2. Search Pinecone → Top 3 most relevant chunks
3. Load last 3 chat messages → Build context
4. Send to Groq LLM → Generate answer
5. Save Q&A to Supabase → Return with sources
```

### Memory & Context
```
- Stores every Q&A in Supabase Postgres
- Retrieves last 3 conversations on new question
- Merges chat history + document chunks
- Enables follow-up questions without re-explaining
```

---

## 📚 Phase Documentation

| Phase | Feature | Documentation |
|-------|---------|--------------|
| **Phase 1-2** | Auth + Upload + Vector DB | `documentation/PHASE_3_SETUP.md` |
| **Phase 3** | Groq LLM Integration | `documentation/ARCHITECTURE.md` |
| **Phase 4** | Chat Interface | `documentation/PHASE_4_CHAT_INTEGRATION.md` |
| **Phase 5** | Memory & History | `documentation/PHASE_5_MEMORY.md` |

---

## 🧪 API Endpoints

### Backend (http://localhost:8000)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | API info |
| GET | `/docs` | Interactive API docs |
| POST | `/api/ingest` | Process uploaded document |
| POST | `/api/ask` | Ask question (returns answer + sources) |
| GET | `/api/history/{user_id}` | Get chat history |
| DELETE | `/api/history/{user_id}` | Clear chat history |

**Example Request:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/ask" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
    query = "What is cybercrime?"
    user_id = "your-user-id"
    top_k = 3
  } | ConvertTo-Json)
```

---

## 🎨 Features in Action

### Smart Follow-up Questions
```
Q1: "What is phishing?"
A1: "Phishing is a cyber attack..."

Q2: "How do I protect myself from it?"
A2: [Knows "it" = phishing without asking]
    "To protect yourself from phishing..."
```

### Persistent Chat History
- Logout → Login → Previous conversations restored
- Click "Clear History" to start fresh
- Conversations auto-saved after every answer

### Source Transparency
Every answer shows:
- 📄 Source file name
- 📊 Relevance score (e.g., 79% match)
- 📝 Text excerpt preview

---

## 🔧 Configuration

### Adjust Memory Settings
Edit `backend/.env`:
```env
CHAT_CONTEXT_WINDOW=3    # How many chats to remember (default: 3)
MAX_CHAT_HISTORY=50      # Max chats to store per user (default: 50)
```

### Change LLM Model
```env
GROQ_MODEL=llama-3.3-70b-versatile  # Current
# Alternatives:
# GROQ_MODEL=llama-3.1-70b-versatile
# GROQ_MODEL=llama-3.1-8b-instant (faster)
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Must be 3.11+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check .env file exists
ls backend/.env
```

### Frontend can't connect
1. Verify backend running on port 8000
2. Check CORS settings in `backend/main.py`
3. Verify `.env.local` has correct Supabase URL

### Chat history not loading
1. Run database migration: `backend/database/migration_phase5.sql`
2. Check Supabase RLS policies are enabled
3. Verify user is authenticated

📖 **More help:** [documentation/PHASE_5_MEMORY.md#troubleshooting](documentation/PHASE_5_MEMORY.md#troubleshooting)

---

## 🚀 Deployment

### Frontend → Vercel
```bash
vercel --prod
# Add environment variables in Vercel dashboard
```

### Backend → Render/Railway
1. Set build command: `pip install -r requirements.txt`
2. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Add all environment variables

---

## 🗺️ Roadmap

- [x] **Phase 1-2:** User auth + file upload + document ingestion
- [x] **Phase 3:** RAG pipeline with Groq API
- [x] **Phase 4:** Real-time chat interface with sources
- [x] **Phase 5:** Conversation memory & history persistence
- [ ] **Phase 6:** Advanced features
  - [ ] Voice input/output
  - [ ] Export conversations to PDF
  - [ ] Multi-document cross-referencing
  - [ ] Study session analytics
  - [ ] Smart summaries & flashcards

---

## 👤 Author

**Pratham Dabhane**
- GitHub: [@Pratham-Dabhane](https://github.com/Pratham-Dabhane)
- Repository: [Lectra](https://github.com/Pratham-Dabhane/lectra)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

- [Groq](https://groq.com) - Blazing-fast LLM inference
- [Pinecone](https://pinecone.io) - Vector database
- [Supabase](https://supabase.com) - Backend infrastructure
- [Next.js](https://nextjs.org) - React framework

---

**Built with ❤️ for learners everywhere**

⭐ Star this repo if you found it helpful!
