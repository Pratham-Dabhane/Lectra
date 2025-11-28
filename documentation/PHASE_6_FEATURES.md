# 🚀 Phase 6: Advanced Study Features

## Overview
Phase 6 adds four powerful features to enhance your learning experience:
1. **📄 Export Conversations to PDF** - Save your study sessions
2. **🔗 Multi-Document Cross-Referencing** - Connect related concepts across documents
3. **📊 Study Session Analytics** - Track your learning progress
4. **🎴 Smart Flashcards** - AI-generated flashcards with spaced repetition

---

## ✨ Features

### 1. Export Conversations to PDF
- Export chat conversations as formatted PDF documents
- Includes timestamps, questions, answers, and source citations
- One-click export from chat interface
- Automatic export history tracking

**Usage:**
```typescript
// In chat page - click "Export PDF" button
// PDF downloads automatically with formatted conversations
```

### 2. Multi-Document Cross-Referencing
- Automatically identifies relationships between different documents
- AI-powered relationship descriptions
- Network analysis of document connections
- Types: related, citation, contradiction, expansion, summary

**API Usage:**
```python
POST /api/phase6/cross-reference/{user_id}/create
{
  "source_doc_id": "doc_123",
  "target_doc_id": "doc_456",
  "source_context": "text from source",
  "target_context": "text from target",
  "similarity_score": 0.85,
  "reference_type": "related"
}
```

### 3. Study Session Analytics
- **Automatic tracking** of all study activities
- **Real-time metrics**: questions asked, study time, documents used
- **Study streak** tracking for motivation
- **Topic analysis** - see what you've been studying most
- **Daily/weekly/monthly** summaries

**Key Metrics:**
- Total questions asked
- Total study time (hours)
- Study streak (consecutive days)
- Documents referenced
- Topics covered
- Average session duration
- Daily activity chart
- Most active topics

**Access:**
Visit `/analytics` page or click "📊 Analytics" in navigation

### 4. Smart Flashcards & Spaced Repetition
- **AI-generated flashcards** from your conversations
- **SM-2 spaced repetition algorithm** for optimal learning
- **4-level quality rating**: Forgot (0) → Hard (3) → Good (4) → Easy (5)
- **Flip animation** for engaging review experience
- **Progress tracking**: times reviewed, accuracy percentage
- **Difficulty levels**: easy, medium, hard
- **Topic organization** and filtering

**Spaced Repetition Schedule:**
- **Forgot (0)**: Reset to 1 day
- **Hard (3)**: Short interval increase
- **Good (4)**: Moderate interval increase  
- **Easy (5)**: Long interval increase

---

## 🗄️ Database Schema

### Tables Created

#### `study_sessions`
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- session_start (timestamptz)
- session_end (timestamptz)
- duration_minutes (integer)
- questions_asked (integer)
- documents_referenced (text[])
- topics_covered (text[])
- avg_response_time_seconds (decimal)
- total_tokens_used (integer)
```

#### `conversation_exports`
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- export_type (varchar: pdf/markdown/json)
- chat_ids (UUID[])
- file_url (text)
- file_size_kb (integer)
- filename (varchar)
- total_messages (integer)
- date_range_start (timestamptz)
- date_range_end (timestamptz)
- exported_at (timestamptz)
```

#### `flashcards`
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- question (text)
- answer (text)
- source_chat_id (UUID)
- topic (varchar)
- difficulty (varchar: easy/medium/hard)
- tags (text[])
- times_reviewed (integer)
- times_correct (integer)
- last_reviewed_at (timestamptz)
- next_review_at (timestamptz)
- ease_factor (decimal) -- SM-2 algorithm
- interval_days (integer)
- is_archived (boolean)
```

#### `document_references`
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- source_doc_id (varchar)
- target_doc_id (varchar)
- reference_type (varchar: related/citation/contradiction/expansion/summary)
- source_context (text)
- target_context (text)
- similarity_score (decimal)
- relationship_description (text) -- AI-generated
- discovered_at (timestamptz)
```

---

## 🔧 Backend Services

### `AnalyticsService`
**File:** `backend/services/analytics_service.py`

**Methods:**
- `start_session(user_id)` - Start new study session
- `end_session(session_id)` - End session and calculate duration
- `track_question(user_id, question, documents, topics)` - Track activity
- `get_user_stats(user_id, days)` - Get comprehensive statistics
- `get_weekly_summary(user_id)` - Last 7 days
- `get_monthly_summary(user_id)` - Last 30 days

### `ExportService`
**File:** `backend/services/export_service.py`

**Methods:**
- `export_conversations(user_id, chat_ids, format, include_sources)` - Export chats
- `get_user_exports(user_id, limit)` - Get export history
- `delete_export(export_id, user_id)` - Delete export record

**Supported Formats:**
- `pdf` - PDF data for frontend rendering (uses jsPDF)
- `markdown` - Markdown format
- `json` - JSON format

### `FlashcardService`
**File:** `backend/services/flashcard_service.py`

**Methods:**
- `generate_from_chat(user_id, chat_ids, limit)` - AI-generate flashcards
- `get_user_flashcards(user_id, topic, include_archived)` - Get flashcards
- `get_due_flashcards(user_id)` - Get cards due for review
- `review_flashcard(flashcard_id, quality, user_id)` - Update spaced repetition
- `archive_flashcard(flashcard_id, user_id)` - Archive card
- `delete_flashcard(flashcard_id, user_id)` - Delete card

**SM-2 Algorithm:**
```python
ease_factor = max(1.3, ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))

if quality < 3:
    interval = 1  # Reset
else:
    if times_reviewed == 0:
        interval = 1
    elif times_reviewed == 1:
        interval = 6
    else:
        interval = int(interval * ease_factor)

next_review = datetime.utcnow() + timedelta(days=interval)
```

### `CrossReferenceService`
**File:** `backend/services/cross_reference_service.py`

**Methods:**
- `find_related_documents(query, user_id, source_doc_id, top_k)` - Find related docs
- `create_reference(user_id, source, target, contexts, score, type)` - Create reference
- `get_document_references(user_id, doc_id, direction)` - Get all references
- `analyze_document_network(user_id)` - Network statistics
- `suggest_connections(user_id, doc_id, threshold)` - Suggest potential links

---

## 🌐 API Routes

### Analytics Endpoints

```bash
# Get user statistics
GET /api/phase6/analytics/{user_id}/stats?days=30

# Get weekly summary
GET /api/phase6/analytics/{user_id}/weekly

# Get monthly summary
GET /api/phase6/analytics/{user_id}/monthly

# Start study session
POST /api/phase6/analytics/{user_id}/session/start

# End study session
POST /api/phase6/analytics/session/{session_id}/end
```

### Export Endpoints

```bash
# Export conversations
POST /api/phase6/export/{user_id}
{
  "chat_ids": ["uuid1", "uuid2"],
  "format": "pdf",
  "include_sources": true
}

# Get export history
GET /api/phase6/export/{user_id}/history?limit=20

# Delete export
DELETE /api/phase6/export/{user_id}/{export_id}
```

### Flashcard Endpoints

```bash
# Generate flashcards from chats
POST /api/phase6/flashcards/{user_id}/generate
{
  "chat_ids": ["uuid1", "uuid2"],
  "limit": 10
}

# Get all flashcards
GET /api/phase6/flashcards/{user_id}?topic=Physics&include_archived=false

# Get due flashcards
GET /api/phase6/flashcards/{user_id}/due

# Review flashcard
POST /api/phase6/flashcards/{user_id}/{flashcard_id}/review
{
  "quality": 4  // 0-5
}

# Archive flashcard
POST /api/phase6/flashcards/{user_id}/{flashcard_id}/archive

# Delete flashcard
DELETE /api/phase6/flashcards/{user_id}/{flashcard_id}
```

### Cross-Reference Endpoints

```bash
# Find related documents
GET /api/phase6/cross-reference/{user_id}/find?query=quantum&source_doc_id=doc123&top_k=5

# Create cross-reference
POST /api/phase6/cross-reference/{user_id}/create
{
  "source_doc_id": "doc_123",
  "target_doc_id": "doc_456",
  "source_context": "text snippet",
  "target_context": "related text",
  "similarity_score": 0.85,
  "reference_type": "related"
}

# Get document references
GET /api/phase6/cross-reference/{user_id}/document/{doc_id}?direction=both

# Analyze document network
GET /api/phase6/cross-reference/{user_id}/network

# Suggest connections
GET /api/phase6/cross-reference/{user_id}/suggest/{doc_id}?threshold=0.7

# Delete reference
DELETE /api/phase6/cross-reference/{user_id}/{reference_id}
```

---

## 💻 Frontend Components

### Chat Page Enhancements
**File:** `pages/chat.tsx`

**New Features:**
- **Export PDF** button - generates formatted PDF of conversations
- **Generate Flashcards** button - creates flashcards from recent chats
- Uses `jsPDF` for client-side PDF generation

**Functions:**
- `handleExportPDF()` - Export conversations to PDF
- `handleGenerateFlashcards()` - Generate flashcards via API

### Analytics Page
**File:** `pages/analytics.tsx`

**Features:**
- Key metrics cards (questions, study time, streak, documents)
- Most studied topics bar chart
- Daily activity chart
- Session statistics
- Timeframe selector (weekly/monthly)

### Flashcards Page
**File:** `pages/flashcards.tsx`

**Features:**
- **Review mode** - study due flashcards with spaced repetition
- **Browse mode** - view all flashcards
- Flip animation for engaging UX
- 4-level quality rating after review
- Progress tracking (times reviewed, accuracy %)
- Difficulty badges and topic labels

**Review Ratings:**
- 😞 **Forgot** (0) - Reset to 1 day
- 🤔 **Hard** (3) - Moderate difficulty
- 👍 **Good** (4) - Recalled correctly
- 🎯 **Easy** (5) - Perfect recall

### Navigation Bar
**File:** `components/Navbar.tsx`

**New Links:**
- 🎴 Flashcards → `/flashcards`
- 📊 Analytics → `/analytics`

---

## 🚀 Setup Instructions

### 1. Run Database Migration

```sql
-- Run this SQL in Supabase SQL Editor
-- File: backend/database/migration_phase6.sql

-- Creates 4 tables:
-- - study_sessions
-- - conversation_exports
-- - flashcards
-- - document_references

-- Also creates:
-- - RLS policies for all tables
-- - Indexes for performance
-- - Triggers for updated_at timestamps
-- - Helper functions (get_study_streak, get_top_topics)
```

**Verify Migration:**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('study_sessions', 'conversation_exports', 'flashcards', 'document_references');
```

### 2. Install Frontend Dependencies

```bash
cd C:\Pra_programming\Projects\lectra
npm install jspdf
```

### 3. Restart Backend

Backend automatically initializes Phase 6 services on startup:
```bash
# In backend terminal
# Services will auto-initialize:
# ✓ Chat history service initialized
# ✓ Phase 6 services initialized (Analytics, Export, Flashcards, Cross-Reference)
```

### 4. Restart Frontend

```bash
# In frontend terminal
npm run dev
```

### 5. Test Features

1. **Chat** → Ask questions → Check analytics page
2. **Export PDF** → Click button in chat → PDF downloads
3. **Generate Flashcards** → Click button → Redirects to flashcards page
4. **Review Flashcards** → Rate cards → Check spaced repetition
5. **Analytics** → View study stats and charts

---

## 📊 How Analytics Tracking Works

### Automatic Tracking
Analytics are tracked **automatically** during chat interactions:

```python
# In rag_pipeline.py - ask() method
await analytics_service.track_question(
    user_id=user_id,
    question=query,
    documents=["doc1.pdf", "doc2.pdf"],  # From context chunks
    topics=["Physics", "Quantum Mechanics"]  # Extracted from context
)
```

### Session Management
- **Auto-start**: Session starts on first question (if none active in last 4 hours)
- **Auto-update**: Each question updates session metrics
- **Manual end**: Sessions auto-expire after 4 hours of inactivity

### Metrics Calculated
- **Study streak**: Consecutive days with sessions
- **Topic frequency**: Count of questions per topic
- **Daily activity**: Questions per day over time period
- **Average duration**: Mean session length

---

## 🎴 Flashcard Generation Process

### 1. User Triggers Generation
```typescript
// In chat.tsx
const chatIds = messages
  .filter(m => m.id !== '0' && m.id.endsWith('-q'))
  .map(m => m.id.replace('-q', ''));

await fetch('/api/phase6/flashcards/{userId}/generate', {
  method: 'POST',
  body: JSON.stringify({
    chat_ids: chatIds.slice(0, 10),  // Last 10 conversations
    limit: 10  // Generate 10 flashcards
  })
});
```

### 2. Backend Fetches Conversations
```python
# FlashcardService.generate_from_chat()
chats = supabase.table('chats')\
    .select('question, answer, sources')\
    .eq('user_id', user_id)\
    .in_('id', chat_ids)\
    .execute()
```

### 3. AI Generates Flashcards
```python
# Uses Groq Llama 3.3 70B
prompt = f"""Based on these conversations, generate {limit} flashcards.
Each flashcard: question, answer, topic, difficulty, tags.
Return JSON array..."""

response = groq_client.chat.completions.create(
    model='llama-3.3-70b-versatile',
    messages=[...],
    temperature=0.7,
    max_tokens=2000
)

flashcards = json.loads(response.content)
```

### 4. Save to Database
```python
for card in flashcards:
    supabase.table('flashcards').insert({
        'user_id': user_id,
        'question': card['question'],
        'answer': card['answer'],
        'topic': card['topic'],
        'difficulty': card['difficulty'],
        'tags': card['tags'],
        'next_review_at': (datetime.utcnow() + timedelta(days=1)).isoformat()
    }).execute()
```

---

## 🔒 Security

### Row Level Security (RLS)
All Phase 6 tables have RLS policies ensuring users can only:
- **SELECT** their own data
- **INSERT** with their own user_id
- **UPDATE** their own records
- **DELETE** their own records

### Policy Examples
```sql
-- Users can only view their own study sessions
CREATE POLICY "Users can view their own study sessions"
    ON study_sessions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own flashcards
CREATE POLICY "Users can insert their own flashcards"
    ON flashcards FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

---

## 🐛 Troubleshooting

### Analytics Not Showing Data
```bash
# Check if sessions are being created
SELECT * FROM study_sessions WHERE user_id = 'your-user-id' ORDER BY session_start DESC LIMIT 5;

# Verify analytics service is initialized
# Backend logs should show: "✓ Phase 6 services initialized"
```

### Flashcards Not Generating
```bash
# Check Groq API key is set
echo $GROQ_API_KEY

# Check chat history exists
SELECT COUNT(*) FROM chats WHERE user_id = 'your-user-id';

# View backend logs for AI generation errors
```

### PDF Export Not Downloading
```bash
# Check jsPDF is installed
npm list jspdf

# Check browser console for errors
# Verify messages array has content (length > 1)
```

### Cross-References Not Working
```bash
# Check Pinecone index is initialized
# Verify documents are ingested with metadata
# Check backend logs for CrossReferenceService errors
```

---

## 📈 Performance Considerations

### Analytics Tracking
- **Non-blocking**: Analytics tracking doesn't slow down chat responses
- **Async**: Uses `asyncio` for parallel execution
- **Cached**: Active sessions are cached (4-hour window)

### Flashcard Generation
- **Batched**: Generates up to 10 cards at once
- **Limited context**: Uses only last 10 conversations
- **Fallback**: If AI fails, creates basic Q&A pairs

### PDF Export
- **Client-side**: PDF generation happens in browser (jsPDF)
- **No server load**: Doesn't use backend resources
- **Size limits**: Large conversations may take a few seconds

---

## 🎯 Future Enhancements

### Planned Features
- [ ] **Group flashcards by deck** - organize cards into study sets
- [ ] **Export flashcards to Anki** - export format compatible with Anki
- [ ] **Advanced cross-reference visualization** - network graph of document relationships
- [ ] **Study reminders** - push notifications for due flashcards
- [ ] **Collaborative study sessions** - share sessions with classmates
- [ ] **AI-powered study plans** - personalized learning schedules
- [ ] **Voice flashcard review** - hands-free studying

---

## 📝 Summary

Phase 6 adds:
- ✅ **4 new database tables** (study_sessions, conversation_exports, flashcards, document_references)
- ✅ **4 backend services** (Analytics, Export, Flashcard, CrossReference)
- ✅ **20+ API endpoints** for all Phase 6 features
- ✅ **3 new frontend pages** (analytics, flashcards, enhanced chat)
- ✅ **Automatic analytics tracking** in RAG pipeline
- ✅ **SM-2 spaced repetition** for flashcards
- ✅ **Client-side PDF export** with jsPDF
- ✅ **AI-powered flashcard generation** with Groq
- ✅ **Row-level security** on all tables

**Total Phase 6 Code:**
- Backend: ~1500 lines (services + routes + migration)
- Frontend: ~600 lines (pages + components)
- Documentation: ~800 lines (this file)

---

## 🎉 You're Ready!

Phase 6 is now fully integrated. Test all features:

1. 💬 **Chat** → Ask questions
2. 📊 **Analytics** → View your study stats
3. 🎴 **Flashcards** → Generate and review cards
4. 📄 **Export** → Download conversation PDFs

Enjoy your enhanced learning experience! 🚀
