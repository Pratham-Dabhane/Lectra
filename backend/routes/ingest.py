from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, validator
from typing import Optional
from services.supabase_client import supabase_client
from services.text_extractor import text_extractor
from services.embeddings import embedding_service
from services.vector_store import vector_store
from utils.logger import logger
import re

router = APIRouter(prefix="/api", tags=["ingest"])

class IngestRequest(BaseModel):
    """Request model for document ingestion"""
    file_url: str
    user_id: str
    file_name: Optional[str] = None
    
    @validator('file_url')
    def validate_file_url(cls, v):
        if not v or not v.startswith('http'):
            raise ValueError('file_url must be a valid HTTP/HTTPS URL')
        return v
    
    @validator('user_id')
    def validate_user_id(cls, v):
        if not v or len(v) < 10:
            raise ValueError('user_id must be a valid UUID')
        return v

class IngestResponse(BaseModel):
    """Response model for document ingestion"""
    status: str
    message: str
    vectors_stored: int
    chunks_created: int
    file_name: str
    user_id: str

@router.post("/ingest", response_model=IngestResponse, status_code=status.HTTP_200_OK)
async def ingest_document(request: IngestRequest):
    """
    Ingest a document from Supabase Storage
    
    Process:
    1. Download file from Supabase Storage
    2. Extract text from PDF/TXT
    3. Split text into chunks
    4. Generate embeddings
    5. Store in Pinecone with metadata
    
    Args:
        request: IngestRequest with file_url and user_id
        
    Returns:
        IngestResponse with status and number of vectors stored
    """
    try:
        logger.info(f"Starting document ingestion for user: {request.user_id}")
        logger.info(f"File URL: {request.file_url}")
        
        # Extract file name from URL if not provided
        if not request.file_name:
            request.file_name = request.file_url.split('/')[-1].split('?')[0]
        
        # Step 1: Download file from Supabase Storage
        logger.info("Step 1: Downloading file from Supabase Storage...")
        file_content = supabase_client.download_file(request.file_url)
        
        if not file_content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Downloaded file is empty"
            )
        
        # Step 2: Extract text from PDF/TXT
        logger.info("Step 2: Extracting text from document...")
        extracted_text = text_extractor.extract_text(file_content, request.file_name)
        
        if not extracted_text or len(extracted_text.strip()) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No meaningful text could be extracted from the document"
            )
        
        logger.info(f"Extracted {len(extracted_text)} characters of text")
        
        # Step 3: Split text into chunks
        logger.info("Step 3: Splitting text into chunks...")
        text_chunks = embedding_service.split_text(extracted_text)
        
        if not text_chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to split text into chunks"
            )
        
        logger.info(f"Created {len(text_chunks)} chunks")
        
        # Step 4: Generate embeddings
        logger.info("Step 4: Generating embeddings...")
        embeddings = embedding_service.create_embeddings(text_chunks)
        
        if not embeddings or len(embeddings) != len(text_chunks):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate embeddings for all chunks"
            )
        
        logger.info(f"Generated {len(embeddings)} embeddings")
        
        # Step 5: Store in Pinecone
        logger.info("Step 5: Storing vectors in Pinecone...")
        vectors_stored = vector_store.upsert_vectors(
            embeddings=embeddings,
            chunks=text_chunks,
            user_id=request.user_id,
            file_name=request.file_name,
            file_url=request.file_url
        )
        
        logger.info(f"Successfully stored {vectors_stored} vectors in Pinecone")
        
        # Return success response
        return IngestResponse(
            status="success",
            message=f"Document ingested successfully. Stored {vectors_stored} vectors.",
            vectors_stored=vectors_stored,
            chunks_created=len(text_chunks),
            file_name=request.file_name,
            user_id=request.user_id
        )
        
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.error(f"Error during document ingestion: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document ingestion failed: {str(e)}"
        )

@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """
    Health check endpoint
    
    Returns:
        Status and service information
    """
    try:
        # Check Pinecone connection
        stats = vector_store.get_index_stats()
        
        return {
            "status": "healthy",
            "service": "Lectra Backend API",
            "pinecone_connected": True,
            "index_stats": stats
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "service": "Lectra Backend API",
            "pinecone_connected": False,
            "error": str(e)
        }

@router.delete("/vectors/{user_id}/{file_name}", status_code=status.HTTP_200_OK)
async def delete_document_vectors(user_id: str, file_name: str):
    """
    Delete vectors for a specific document
    
    Args:
        user_id: User ID
        file_name: File name
        
    Returns:
        Success message
    """
    try:
        logger.info(f"Deleting vectors for user: {user_id}, file: {file_name}")
        
        vector_store.delete_user_vectors(user_id, file_name)
        
        return {
            "status": "success",
            "message": f"Vectors deleted for file: {file_name}"
        }
        
    except Exception as e:
        logger.error(f"Error deleting vectors: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete vectors: {str(e)}"
        )
