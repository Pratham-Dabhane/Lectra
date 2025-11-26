# Lectra - Your Personal AI Learning Companion 🚀

Transform your learning experience with **Lectra**, the intelligent AI platform that makes studying smarter, faster, and more personalized. Upload your notes, ask questions in real-time, and get instant AI-powered insights with source references.

![Lectra](https://img.shields.io/badge/Lectra-AI%20Learning-1E4E8C?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-13-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge&logo=supabase)

## ✨ Features

### Core Functionality
- **🤖 AI Chat Interface**: Real-time question answering about your uploaded documents
- **📄 Smart Document Upload**: Upload PDF and TXT files securely
- **🔍 Source References**: Every AI answer includes clickable source citations
- **💾 Vector Search**: Powered by Pinecone for accurate document retrieval
- **⚡ Fast Responses**: Groq API delivers answers in under 2 seconds

### User Experience
- **🔐 Secure Authentication**: User authentication with Supabase Auth
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **🎨 Modern UI**: Beautiful Tailwind CSS design with smooth animations
- **🌙 Real-time Updates**: Instant feedback and live chat updates

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 13 with React 18
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom design system
- **State Management**: React Hooks
- **Notifications**: react-hot-toast

### Backend
- **API Framework**: FastAPI 0.104.1
- **Language**: Python 3.11+
- **LLM**: Groq API (Mixtral-8x7b-32768)
- **Embeddings**: sentence-transformers (all-mpnet-base-v2)
- **Vector Database**: Pinecone (768-dimensional index)

### Infrastructure
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Document Processing**: PyMuPDF
- **Orchestration**: LangChain

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.11+
- Supabase account ([free tier](https://supabase.com))
- Pinecone account ([free tier](https://pinecone.io))
- Groq API key ([free at console.groq.com](https://console.groq.com))

### Installation

#### 1. Clone and Install Frontend
```bash
# Install dependencies
npm install

# Create .env.local file
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Start frontend
npm run dev
```
Frontend runs on: http://localhost:3000

#### 2. Setup and Start Backend
```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.venv\Scripts\Activate.ps1  # Windows
# or
source .venv/bin/activate    # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file with required variables
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your-pinecone-env
PINECONE_INDEX_NAME=lectra-embeddings

# Start backend
uvicorn main:app --reload
```
Backend runs on: http://localhost:8000

### Usage Flow

1. **Sign Up/Login** → Go to http://localhost:3000/auth
2. **Upload Documents** → Home page → Upload PDF/TXT files
3. **Start Chatting** → Click "Start Chatting with AI" button
4. **Ask Questions** → Type questions about your documents
5. **View Sources** → Check AI responses with cited references

## 📚 Documentation

- **[PHASE_4_CHAT_INTEGRATION.md](PHASE_4_CHAT_INTEGRATION.md)** - Complete Phase 4 guide
- **[QUICK_START_PHASE4.md](QUICK_START_PHASE4.md)** - 5-minute quick start
- **[backend/GROQ_MIGRATION.md](backend/GROQ_MIGRATION.md)** - Groq API setup guide
- **[SETUP.md](SETUP.md)** - Detailed setup instructions

## 🏗️ Project Structure

```
lectra/
├── pages/
│   ├── auth.tsx              # Authentication page
│   ├── index.tsx             # Main dashboard (file upload)
│   └── chat.tsx              # AI chat interface ⭐ NEW
├── components/
│   ├── Navbar.tsx            # Navigation with chat link
│   ├── FileUpload.tsx        # Document upload component
│   └── FileList.tsx          # Uploaded files display
├── lib/
│   └── supabaseClient.ts     # Supabase configuration
├── styles/
│   └── globals.css           # Global styles and design system
├── backend/                   # FastAPI backend
│   ├── main.py               # API entry point
│   ├── routes/
│   │   ├── ingest.py         # Document ingestion
│   │   └── ask.py            # Chat Q&A endpoint ⭐ NEW
│   ├── services/
│   │   ├── rag_pipeline.py   # RAG orchestration ⭐ NEW
│   │   ├── embeddings.py     # Text embeddings
│   │   ├── vector_store.py   # Pinecone operations
│   │   └── supabase_client.py
│   └── .env                  # Backend environment vars
└── .env.local                # Frontend environment vars
```

## 🎨 Design System

### Color Palette
- **Lectra Blue**: `#1E4E8C` - Primary brand color
- **Electric Cyan**: `#3BE3F4` - Secondary accent  
- **Soft Lavender**: `#B7A4F6` - Creative accent
- **Message Bubbles**: Blue (user) / Gray (AI)

### Typography
- **Headings**: Poppins (SemiBold/Bold)
- **Body**: Inter (Regular/Medium)
- **Chat**: System font stack for readability

## 🛠️ Development

### Available Scripts

**Frontend:**
- `npm run dev` - Development server (port 3000)
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint checks

**Backend:**
- `uvicorn main:app --reload` - Development server (port 8000)
- `pytest` - Run tests (coming soon)

### API Endpoints

**Backend API (http://localhost:8000):**
- `GET /` - API info
- `GET /api/health` - Health check with Pinecone status
- `POST /api/ingest` - Ingest document into vector DB
- `POST /api/ask` - Ask questions (returns answer + sources) ⭐
- `GET /api/ask/health` - RAG pipeline health check ⭐
- `GET /docs` - Interactive API documentation

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login/Signup works
- [ ] File upload succeeds
- [ ] Files appear in list
- [ ] Chat page loads
- [ ] Message sending works
- [ ] AI responds with sources
- [ ] Loading states show
- [ ] Error handling works
- [ ] Logout functions
- [ ] Mobile responsive

### API Testing
```powershell
# Health check
curl http://localhost:8000/api/ask/health

# Ask question
Invoke-RestMethod -Uri "http://localhost:8000/api/ask" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"query": "test", "user_id": "your-user-id"}'
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Backend (Render/Railway/Fly.io)
1. Use `backend/` as root directory
2. Set Python 3.11+ runtime
3. Configure all .env variables
4. Deploy with `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Requirements
- Node.js 18+ for frontend
- Python 3.11+ for backend
- 512MB RAM minimum (works on free tiers!)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📸 Screenshots

### Dashboard
Upload your documents and manage your learning materials.

### Chat Interface
Ask questions and get AI-powered answers with source references.

## 🌟 Roadmap

- [x] Phase 1: Authentication & File Upload
- [x] Phase 2: Document Ingestion & RAG Backend
- [x] Phase 3: Groq API Integration
- [x] Phase 4: Chat Interface with Real-time Q&A
- [ ] Phase 5: Chat History Persistence
- [ ] Phase 6: Advanced Features (voice input, export, etc.)

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Pratham Dabhane**
- GitHub: [@Pratham-Dabhane](https://github.com/Pratham-Dabhane)
- Repository: [Lectra](https://github.com/Pratham-Dabhane/Lectra)

## 🙏 Acknowledgments

- Groq for blazing-fast LLM inference
- Pinecone for vector database
- Supabase for authentication and storage
- Next.js and FastAPI communities

---

**Built with ❤️ for learners everywhere**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

**Lectra** - Learn Smarter with AI
