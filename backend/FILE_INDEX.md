# 📁 Lectra Backend - Complete File Index

## 📂 Project Structure

```
backend/
│
├── 📄 main.py                              # FastAPI application entry point
├── 📄 requirements.txt                      # Python dependencies list
├── 📄 package.json                          # Project metadata
│
├── 🔧 Configuration Files
│   ├── .env.example                         # Environment variables template
│   └── .gitignore                           # Git ignore rules
│
├── 📚 Documentation (READ THESE!)
│   ├── README.md                            # Project overview
│   ├── SETUP_GUIDE.md                       # ⭐ START HERE - Quick setup
│   ├── PHASE_2.md                           # ⭐ Complete documentation (556 lines)
│   ├── PHASE_2_SUMMARY.md                   # Executive summary
│   ├── ARCHITECTURE.md                      # System architecture & diagrams
│   └── FILE_INDEX.md                        # This file
│
├── 🚀 Scripts
│   ├── setup.bat                            # Windows setup automation
│   ├── start.bat                            # Windows server start
│   └── test_setup.py                        # Setup validation script
│
├── 🧪 Testing
│   └── Lectra_API.postman_collection.json   # Postman API tests
│
├── 🛣️ routes/
│   └── ingest.py                            # API endpoints for ingestion
│       • POST /api/ingest
│       • GET /api/health
│       • DELETE /api/vectors/{user_id}/{file_name}
│
├── 🔧 services/
│   ├── supabase_client.py                   # Supabase Storage integration
│   ├── text_extractor.py                    # PDF/TXT text extraction
│   ├── embeddings.py                        # Embedding generation (OpenAI/Mistral)
│   └── vector_store.py                      # Pinecone vector operations
│
└── 🛠️ utils/
    └── logger.py                            # Logging configuration
```

---

## 📄 File Details

### Core Application

#### `main.py` (Main Entry Point)
- FastAPI application initialization
- CORS middleware configuration
- Router inclusion
- Startup/shutdown event handlers
- Uvicorn server configuration

**Key Functions:**
- `root()` - Root endpoint
- `startup_event()` - App initialization
- `shutdown_event()` - Cleanup

**Run:** `python main.py`  
**Access:** http://localhost:8000

---

### Configuration

#### `requirements.txt` (Dependencies)
Complete list of Python packages:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `supabase` - Supabase client
- `pinecone-client` - Vector database
- `langchain` - RAG framework
- `openai` - Embedding model
- `pymupdf` - PDF processing
- `sentence-transformers` - Mistral embeddings

**Install:** `pip install -r requirements.txt`

#### `.env.example` (Environment Template)
Template for environment variables:
```env
SUPABASE_URL=
SUPABASE_KEY=
PINECONE_API_KEY=
OPENAI_API_KEY=
EMBEDDING_MODEL=
CHUNK_SIZE=
MAX_FILE_SIZE_MB=
```

**Setup:** Copy to `.env` and fill in values

#### `.gitignore` (Git Ignore)
Excludes from version control:
- Virtual environments (`venv/`, `env/`)
- Environment files (`.env`)
- Python cache (`__pycache__/`)
- IDE files (`.vscode/`, `.idea/`)

---

### Documentation

#### 📖 `README.md` (Project Overview)
- Quick reference
- Feature highlights
- Tech stack summary
- Links to detailed docs

**Purpose:** First point of contact for new developers

#### ⭐ `SETUP_GUIDE.md` (Quick Start - START HERE!)
- 5-minute setup instructions
- Step-by-step configuration
- Testing procedures
- Common issues & solutions
- Verification checklist

**Purpose:** Get up and running quickly

#### ⭐ `PHASE_2.md` (Complete Documentation - 556 lines)
Comprehensive guide covering:
1. Overview & features
2. Architecture diagrams
3. Environment setup
4. Installation instructions
5. Configuration details
6. API endpoint documentation
7. Testing procedures
8. Error handling
9. Troubleshooting

**Purpose:** Complete technical reference

#### `PHASE_2_SUMMARY.md` (Executive Summary)
- High-level overview
- Key achievements
- Quick verification steps
- Next steps for Phase 3

**Purpose:** Project status and accomplishments

#### `ARCHITECTURE.md` (System Architecture)
Detailed technical documentation:
- System architecture diagrams
- Data flow visualizations
- Component responsibilities
- Technology stack details
- Security architecture
- Scalability considerations
- Design decisions

**Purpose:** Deep technical understanding

#### `FILE_INDEX.md` (This File)
- Complete file structure
- File descriptions
- Usage instructions
- Quick reference

**Purpose:** Navigate the project easily

---

### Scripts

#### `setup.bat` (Windows Setup Script)
Automated setup for Windows:
1. Checks Python installation
2. Creates virtual environment
3. Activates environment
4. Upgrades pip
5. Installs dependencies
6. Creates `.env` from template

**Run:** `.\setup.bat`

#### `start.bat` (Windows Start Script)
Starts the FastAPI server:
1. Checks virtual environment
2. Activates environment
3. Checks `.env` file
4. Starts server with uvicorn

**Run:** `.\start.bat`  
**Result:** Server at http://localhost:8000

#### `test_setup.py` (Setup Validation)
Validates backend setup:
- Tests environment variables
- Checks server connectivity
- Verifies Pinecone connection
- Tests API endpoints
- Validates input handling

**Run:** `python test_setup.py`

---

### API Routes

#### `routes/ingest.py` (API Endpoints)

**Endpoints:**

1. **POST `/api/ingest`**
   - Ingests document from Supabase
   - Processes and stores embeddings
   - Returns ingestion status

2. **GET `/api/health`**
   - Health check endpoint
   - Returns service status
   - Shows Pinecone statistics

3. **DELETE `/api/vectors/{user_id}/{file_name}`**
   - Deletes vectors for specific file
   - User-scoped deletion

**Models:**
- `IngestRequest` - Request validation
- `IngestResponse` - Response structure

---

### Services Layer

#### `services/supabase_client.py` (Supabase Integration)
Handles file operations with Supabase Storage.

**Class:** `SupabaseClient`

**Methods:**
- `__init__()` - Initializes client with credentials
- `download_file(file_url)` - Downloads file from URL
- `get_file_metadata(bucket, file_path)` - Gets file info

**Dependencies:** `supabase`, `httpx`

---

#### `services/text_extractor.py` (Text Extraction)
Extracts text from PDF and TXT files.

**Class:** `TextExtractor`

**Methods:**
- `extract_from_pdf(file_content, file_name)` - PDF extraction
- `extract_from_txt(file_content, file_name)` - TXT extraction
- `extract_text(file_content, file_name)` - Auto-detect format

**Features:**
- Page-by-page PDF processing
- Multiple encoding support for TXT
- File size validation
- Error handling for corrupted files

**Dependencies:** `PyMuPDF (fitz)`

---

#### `services/embeddings.py` (Embedding Generation)
Generates text embeddings using OpenAI or Mistral.

**Class:** `EmbeddingService`

**Methods:**
- `_initialize_embeddings()` - Sets up embedding model
- `_initialize_mistral_embeddings()` - Fallback to Mistral
- `split_text(text)` - Splits into chunks
- `create_embeddings(texts)` - Generates vectors
- `get_embedding_dimension()` - Returns dimension

**Features:**
- Dual model support (OpenAI/Mistral)
- Automatic fallback
- Configurable chunking
- Text splitting with overlap

**Dependencies:** `langchain`, `openai`, `sentence-transformers`

---

#### `services/vector_store.py` (Vector Database)
Manages vector storage in Pinecone.

**Class:** `VectorStoreService`

**Methods:**
- `_get_or_create_index()` - Manages index lifecycle
- `upsert_vectors(...)` - Stores vectors with metadata
- `query_vectors(...)` - Searches similar vectors
- `delete_user_vectors(...)` - Deletes user data
- `get_index_stats()` - Returns statistics

**Features:**
- Auto-creates index
- Batch processing (100 vectors/batch)
- User-scoped operations
- Rich metadata storage

**Dependencies:** `pinecone`

---

### Utils

#### `utils/logger.py` (Logging)
Configures application-wide logging.

**Function:** `setup_logger(name)`

**Features:**
- Console output with timestamps
- Formatted log messages
- Multiple log levels (INFO, ERROR, WARNING)
- Singleton pattern

**Usage:** `from utils.logger import logger`

---

### Testing

#### `Lectra_API.postman_collection.json` (Postman Collection)
Pre-configured API tests for Postman.

**Includes:**
1. Health Check request
2. Root Info request
3. Ingest Document request (with template)
4. Delete Vectors request

**Import:** Postman → Import → Select file

---

## 🚀 Quick Commands Reference

### Setup
```powershell
cd backend
.\setup.bat                    # Windows automated setup
# OR
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Configure
```powershell
cp .env.example .env
notepad .env                   # Edit with your credentials
```

### Run
```powershell
.\start.bat                    # Windows start script
# OR
python main.py                 # Direct start
# OR
uvicorn main:app --reload      # Development with hot reload
```

### Test
```powershell
python test_setup.py           # Validate setup
curl http://localhost:8000/api/health  # Health check
```

### Access
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 📊 File Dependencies

```
main.py
  ├── routes/ingest.py
  │   ├── services/supabase_client.py
  │   ├── services/text_extractor.py
  │   ├── services/embeddings.py
  │   └── services/vector_store.py
  └── utils/logger.py
      └── (used by all services)

.env
  └── (loaded by all services)

requirements.txt
  └── (defines all Python dependencies)
```

---

## 📖 Reading Order for New Developers

1. **README.md** - Overview (2 min)
2. **SETUP_GUIDE.md** - Quick setup (5 min)
3. **Run test_setup.py** - Validate (2 min)
4. **Try Postman collection** - Test API (5 min)
5. **ARCHITECTURE.md** - Understand design (15 min)
6. **PHASE_2.md** - Deep dive (30 min)
7. **Source code** - Implementation details

---

## 🔍 Finding Things Quickly

### "How do I set up the project?"
→ `SETUP_GUIDE.md`

### "How does the system work?"
→ `ARCHITECTURE.md`

### "What are all the API endpoints?"
→ `PHASE_2.md` Section 6 or `/docs` when running

### "I'm getting an error, how do I fix it?"
→ `PHASE_2.md` Section 9 (Troubleshooting)

### "How do I test the API?"
→ Import `Lectra_API.postman_collection.json` or use `/docs`

### "What are the environment variables?"
→ `.env.example` or `PHASE_2.md` Section 5

### "How do I contribute code?"
→ Read `ARCHITECTURE.md` then source files in `services/`

---

## 🎯 File Modification Guide

### Adding a New API Endpoint
1. Add route in `routes/ingest.py`
2. Add service method if needed
3. Update Postman collection
4. Document in `PHASE_2.md`

### Adding a New Service
1. Create file in `services/`
2. Import logger: `from utils.logger import logger`
3. Create class with methods
4. Add to `routes/ingest.py`
5. Update `FILE_INDEX.md` and `ARCHITECTURE.md`

### Changing Configuration
1. Update `.env.example`
2. Update `SETUP_GUIDE.md`
3. Update `PHASE_2.md` configuration section
4. Update service files that use the config

---

## ✅ File Checklist

All essential files created:
- [x] Core application (`main.py`)
- [x] Dependencies (`requirements.txt`)
- [x] Configuration (`.env.example`, `.gitignore`)
- [x] Routes (`routes/ingest.py`)
- [x] Services (4 files in `services/`)
- [x] Utils (`utils/logger.py`)
- [x] Documentation (6 markdown files)
- [x] Scripts (`setup.bat`, `start.bat`, `test_setup.py`)
- [x] Testing (`Lectra_API.postman_collection.json`)

**Total Files Created: 20+**

---

## 📞 Support

For questions about specific files:
- **Setup**: See `SETUP_GUIDE.md`
- **API Usage**: See `PHASE_2.md` or `/docs`
- **Architecture**: See `ARCHITECTURE.md`
- **Troubleshooting**: See `PHASE_2.md` Section 9

---

**Your backend is fully documented and ready to use!** 🎉

*Use this index to navigate the project efficiently.*
