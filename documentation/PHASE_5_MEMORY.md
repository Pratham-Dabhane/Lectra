# 🧠 Phase 5: User Memory & Context Persistence

## Overview

Phase 5 adds **intelligent conversation memory** to your personalized learning bot. The system now:

- 📝 **Saves every Q&A** to Supabase Postgres
- 🔄 **Auto-loads chat history** when you log in
- 🧠 **Uses previous context** to give smarter answers
- 🗑️ **Allows clearing history** to start fresh
- ⚙️ **User preferences** for memory settings

---

## 🎯 What's New

### Backend Features
✅ **Chat History Service** - Manages conversation storage in Supabase  
✅ **Memory-Enhanced RAG** - RAG pipeline uses last 3 chats as context  
✅ **History API** - GET/DELETE endpoints for managing chat history  
✅ **User Preferences** - Configurable memory settings per user  
✅ **Automatic Saving** - Every Q&A automatically saved to database

### Frontend Features
✅ **History Loading** - Auto-loads previous conversations on page load  
✅ **Clear History Button** - Delete all chat history with confirmation  
✅ **Toast Notifications** - User feedback for history actions  
✅ **Loading States** - Shows loading indicator while fetching history

---

## 📊 Database Schema

### Tables Created

#### 1. `chats` Table
Stores all user Q&A interactions:

```sql
- id (UUID, primary key)
- user_id (UUID, references auth.users)
- question (TEXT)
- answer (TEXT)
- sources (JSONB) - Source documents with relevance scores
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 2. `user_preferences` Table
User-specific settings:

```sql
- user_id (UUID, primary key)
- language (VARCHAR)
- chat_memory_enabled (BOOLEAN) - Enable/disable memory
- max_context_messages (INTEGER) - How many previous chats to use (default: 3)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 3. `user_memory` Table
Future use for long-term memory summaries:

```sql
- id (UUID, primary key)
- user_id (UUID)
- topic (VARCHAR)
- summary (TEXT)
- relevance_score (FLOAT)
- last_accessed (TIMESTAMP)
- created_at (TIMESTAMP)
```

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

1. **Open Supabase Dashboard**:
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**:
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run Migration**:
   ```bash
   # Copy contents of backend/database/migration_phase5.sql
   # Paste into SQL Editor
   # Click "Run" or press Ctrl+Enter
   ```

4. **Verify Tables Created**:
   ```sql
   -- Run this query to verify
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('chats', 'user_preferences', 'user_memory');
   ```

   You should see all 3 tables listed.

### Step 2: Update Environment Variables

No new environment variables needed! The system uses existing Supabase credentials.

Optional: Add these to `backend/.env` to customize:

```env
# Chat History Configuration (Optional)
MAX_CHAT_HISTORY=50          # Maximum history items to store per user
CHAT_CONTEXT_WINDOW=3        # How many previous chats to use for context
```

### Step 3: Restart Backend Server

```powershell
# Stop current server (Ctrl+C)
cd backend
..\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Look for this log message:
```
✓ Chat history service initialized
```

### Step 4: Restart Frontend (if needed)

```powershell
# In frontend terminal
# Usually no restart needed, but if issues:
npm run dev
```

---

## 🧪 Testing Phase 5

### Test 1: Chat History Persistence

1. **Ask First Question**:
   - Go to http://localhost:3000/chat
   - Ask: "What is cybercrime?"
   - Note the answer

2. **Ask Follow-up (Tests Memory)**:
   - Ask: "Can you give me examples?"
   - The bot should understand "examples" refers to cybercrime
   - ✅ **Memory Working**: Answer relates to cybercrime without re-explaining

3. **Logout & Login**:
   - Click "Logout" button
   - Log back in
   - ✅ **Persistence Working**: Previous chat should reload automatically

4. **Check Toast Notification**:
   - Should see: "Loaded X previous conversations"

### Test 2: Context-Aware Responses

Ask this sequence of questions:

```
Q1: "What is phishing?"
Q2: "How can I protect myself from it?"  ← Should understand "it" = phishing
Q3: "What are the warning signs?"         ← Should understand this relates to phishing
```

✅ **Memory Enhanced RAG**: Each answer should consider previous questions without needing to re-explain.

### Test 3: Clear History

1. **Click "Clear History" Button**
2. **Confirm Deletion**
3. ✅ **History Cleared**: Chat resets to welcome message
4. **Verify in Supabase**:
   - Go to Table Editor → `chats`
   - Your user's chats should be deleted

### Test 4: API Endpoints

Test history endpoints directly:

```powershell
# Get your user ID first
$userId = "YOUR_USER_ID_HERE"

# Get chat history
Invoke-RestMethod -Uri "http://localhost:8000/api/history/$userId" -Method GET

# Get chat stats
Invoke-RestMethod -Uri "http://localhost:8000/api/history/$userId/stats" -Method GET

# Get preferences
Invoke-RestMethod -Uri "http://localhost:8000/api/history/$userId/preferences" -Method GET

# Clear history
Invoke-RestMethod -Uri "http://localhost:8000/api/history/$userId" -Method DELETE
```

---

## 📚 How Memory Improves Responses

### Without Memory (Phase 4)
```
User: "What is phishing?"
Bot: "Phishing is a type of cyber attack..."

User: "How do I protect myself?"
Bot: [Doesn't know what "myself" refers to - generic answer]
```

### With Memory (Phase 5)
```
User: "What is phishing?"
Bot: "Phishing is a type of cyber attack..."

User: "How do I protect myself?"
Bot: [Knows you're asking about phishing protection specifically]
     "To protect yourself from phishing attacks, you should..."
```

### Technical Implementation

When you ask a question, the RAG pipeline:

1. **Retrieves last 3 chats** from Supabase
2. **Formats them as context**:
   ```
   Previous conversation:
   User asked: What is phishing?
   Assistant answered: Phishing is...
   ```
3. **Includes in Groq prompt** along with retrieved documents
4. **Groq generates context-aware answer**
5. **Saves new Q&A to database**

---

## 🔧 Architecture

```
Frontend (Next.js)
    ↓
    ├─ Load History on Mount
    │  → GET /api/history/{user_id}
    │  → Renders previous messages
    │
    ├─ Send Question
    │  → POST /api/ask
    │  ↓
    │  Backend RAG Pipeline
    │      ├─ Load last 3 chats (Chat History Service)
    │      ├─ Retrieve docs (Pinecone)
    │      ├─ Generate answer (Groq + context)
    │      └─ Save new chat (Supabase)
    │  ↓
    │  ← Return answer + sources
    │
    └─ Clear History
       → DELETE /api/history/{user_id}
       → Deletes all user chats from Supabase
```

---

## 🎛️ Configuration Options

### Adjusting Context Window

Edit `backend/.env`:

```env
CHAT_CONTEXT_WINDOW=5  # Use last 5 chats instead of 3
```

More context = better continuity, but uses more tokens.

### Disabling Memory Per User

Use the preferences API:

```powershell
$userId = "YOUR_USER_ID"
$body = @{
    chat_memory_enabled = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/history/$userId/preferences" `
  -Method PUT `
  -ContentType "application/json" `
  -Body $body
```

### Changing Max History Storage

Edit `backend/.env`:

```env
MAX_CHAT_HISTORY=100  # Store up to 100 chats per user
```

Frontend loads most recent 20 by default (can be changed in `chat.tsx`).

---

## 🐛 Troubleshooting

### Issue: "ChatHistoryService not initialized"

**Cause**: Backend didn't initialize the service  
**Fix**:
```powershell
# Check backend logs for initialization errors
# Make sure migration ran successfully
# Restart backend server
```

### Issue: History not loading

**Cause**: RLS policies blocking access  
**Fix**:
```sql
-- Verify RLS policies in Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'chats';

-- Re-run migration if policies missing
```

### Issue: "Failed to save chat"

**Cause**: Invalid user_id or network issue  
**Fix**:
1. Check user is authenticated
2. Verify Supabase credentials in `.env`
3. Check backend logs for detailed error

### Issue: Memory not improving answers

**Cause**: Chat history not being retrieved  
**Check Backend Logs**:
```
# Look for these messages:
Retrieved X recent chats for user...
Generated answer with X history messages
```

If history count is 0, check:
- `chat_memory_enabled` preference is `true`
- Previous chats exist in database
- User ID matches between frontend and backend

---

## 🎯 API Reference

### GET `/api/history/{user_id}`
Get all chat history for user

**Query Parameters**:
- `limit` (optional): Max chats to return (default: 50)

**Response**:
```json
{
  "chats": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "question": "What is cybercrime?",
      "answer": "Cybercrime refers to...",
      "sources": [...],
      "created_at": "2025-11-27T00:00:00Z"
    }
  ],
  "total": 10
}
```

### DELETE `/api/history/{user_id}`
Clear all chat history

**Response**:
```json
{
  "message": "Chat history cleared successfully"
}
```

### GET `/api/history/{user_id}/stats`
Get chat statistics

**Response**:
```json
{
  "total_chats": 25,
  "total_questions": 25,
  "average_response_length": 450,
  "oldest_chat": {...},
  "newest_chat": {...}
}
```

### GET `/api/history/{user_id}/preferences`
Get user preferences

**Response**:
```json
{
  "user_id": "uuid",
  "chat_memory_enabled": true,
  "max_context_messages": 3,
  "language": "en"
}
```

### PUT `/api/history/{user_id}/preferences`
Update preferences

**Body**:
```json
{
  "chat_memory_enabled": false,
  "max_context_messages": 5
}
```

---

## ✅ Phase 5 Checklist

- [ ] Database migration executed successfully
- [ ] Backend starts without errors
- [ ] Chat history service initialized
- [ ] Frontend loads previous conversations
- [ ] "Clear History" button works
- [ ] Memory improves follow-up questions
- [ ] Logout/login preserves history
- [ ] Toast notifications appear
- [ ] All API endpoints respond correctly

---

## 🚀 What's Next?

**Future Enhancements**:

1. **Smart Summaries**: Auto-generate topic summaries in `user_memory` table
2. **Search History**: Search through past conversations
3. **Export Chats**: Download chat history as PDF/JSON
4. **Memory Analytics**: Dashboard showing learning patterns
5. **Multi-Session Context**: Use memory from previous days/weeks
6. **Conversation Threads**: Organize related questions into topics

---

## 📝 Testing Checklist

Run through this complete test:

```
✅ 1. Fresh Start
   - Clear any existing history
   - Ask: "What is cybercrime?"
   
✅ 2. Test Memory
   - Ask: "Give me examples of it"
   - Verify bot understands "it" = cybercrime
   
✅ 3. Test Persistence
   - Logout
   - Login again
   - Verify previous chats loaded
   
✅ 4. Test Clear
   - Click "Clear History"
   - Confirm deletion
   - Verify chat resets
   
✅ 5. Test Multi-turn
   - Ask 3-4 related questions
   - Verify each answer builds on previous context
```

---

## 🎉 Success!

Your RAG bot now has **persistent memory** across sessions! 

Key achievements:
- ✅ Conversations saved to Supabase Postgres
- ✅ History auto-loads on login
- ✅ Context-aware follow-up questions
- ✅ User control over history (clear button)
- ✅ Configurable memory preferences

**Phase 5 Complete! 🚀**
