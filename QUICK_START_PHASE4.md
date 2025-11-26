# Phase 4 Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Terminal 1: Start Backend
```powershell
cd backend
.venv\Scripts\Activate.ps1
uvicorn main:app --reload
```
✅ Backend running at: http://localhost:8000

### Terminal 2: Start Frontend
```powershell
npm run dev
```
✅ Frontend running at: http://localhost:3000

---

## 🧪 Quick Test Flow

1. **Login:** http://localhost:3000/auth
2. **Upload:** Go to home page → Upload a PDF/TXT file
3. **Chat:** Click "Start Chatting with AI" button
4. **Ask:** Type "What is this document about?"
5. **Verify:** Check that AI responds with sources

---

## ⚡ API Quick Test

### Health Check
```powershell
curl http://localhost:8000/api/ask/health
```

Expected response:
```json
{
  "status": "healthy",
  "groq_connected": true,
  "model_name": "mixtral-8x7b-32768",
  "api_key_configured": true
}
```

### Ask Question
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/ask" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"query": "test question", "user_id": "test-user"}'
```

---

## 🎨 Features to Test

### Chat Interface
- [x] Send message with Enter key
- [x] Empty message validation
- [x] Loading animation
- [x] AI response with sources
- [x] Timestamps on messages
- [x] Auto-scroll to bottom
- [x] Logout button

### Error Handling
- [x] Backend offline error
- [x] Network error toast
- [x] Empty input disabled
- [x] Invalid response handling

### Responsive Design
- [x] Desktop layout
- [x] Mobile layout
- [x] Touch-friendly buttons
- [x] Readable on all screens

---

## 🔑 Required Environment Variables

### Backend (.env)
```bash
GROQ_API_KEY=gsk_...          # Get from console.groq.com
SUPABASE_URL=https://...      # From Supabase dashboard
SUPABASE_KEY=eyJ...           # From Supabase dashboard
PINECONE_API_KEY=pc...        # From Pinecone dashboard
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| CORS error | Check backend `main.py` allows `localhost:3000` |
| 404 on /api/ask | Backend not running on port 8000 |
| Empty response | Check Groq API key is valid |
| No sources found | Upload documents first, then ask |
| Auth redirect loop | Clear cookies and re-login |

---

## 📱 Mobile Testing

Open on mobile:
- Find your PC's local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Access from phone: `http://192.168.x.x:3000`
- Update CORS in backend to allow your IP

---

## ✅ Phase 4 Deliverables

- ✅ `/chat` page with full UI
- ✅ Real-time message sending/receiving
- ✅ Source references display
- ✅ Loading and error states
- ✅ Logout functionality
- ✅ Navigation (Home ↔ Chat)
- ✅ Mobile responsive design
- ✅ Complete documentation

**Status:** Ready for production! 🎉
