from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.ingest import router as ingest_router
from routes.ask import router as ask_router
from routes.history import router as history_router
from utils.logger import logger
from services.supabase_client import supabase_client
import os

# Create FastAPI app
app = FastAPI(
    title="Lectra Backend API",
    description="Backend service for Personalized Learning Bot with RAG",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ingest_router)
app.include_router(ask_router, prefix="/api")
app.include_router(history_router)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Lectra Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }

@app.on_event("startup")
async def startup_event():
    """Startup event handler"""
    logger.info("=" * 50)
    logger.info("Lectra Backend API is starting up...")
    logger.info(f"Environment: {os.getenv('EMBEDDING_MODEL', 'openai')}")
    logger.info("=" * 50)
    
    # Initialize chat history service
    try:
        from services.chat_history import ChatHistoryService
        import services.chat_history as chat_history_module
        
        # Use the singleton supabase client and get the actual Client object
        chat_history_module.chat_history_service = ChatHistoryService(supabase_client.client)
        logger.info("✓ Chat history service initialized")
    except Exception as e:
        logger.error(f"Failed to initialize chat history service: {str(e)}")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler"""
    logger.info("Lectra Backend API is shutting down...")

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
