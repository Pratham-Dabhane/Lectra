"""
Ask Route - Question Answering with RAG
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from services.rag_pipeline import get_rag_pipeline
from utils.logger import logger

router = APIRouter()


class AskRequest(BaseModel):
    """Request model for asking questions"""
    query: str = Field(..., description="User question", min_length=1)
    user_id: str = Field(..., description="User identifier")
    top_k: Optional[int] = Field(3, description="Number of context chunks to retrieve", ge=1, le=10)
    max_length: Optional[int] = Field(512, description="Maximum response length in tokens", ge=50, le=1024)
    temperature: Optional[float] = Field(0.7, description="Sampling temperature", ge=0.0, le=1.0)


class Reference(BaseModel):
    """Reference to source document"""
    file_name: str
    chunk_index: int
    relevance_score: float
    excerpt: str


class AskResponse(BaseModel):
    """Response model for question answering"""
    answer: str
    references: List[Reference]


@router.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest):
    """
    Answer questions using RAG pipeline
    
    Process:
    1. Retrieve relevant context from Pinecone
    2. Generate answer using Mistral 7B
    3. Return answer with source references
    """
    try:
        logger.info(f"Processing question from user {request.user_id}: {request.query[:100]}...")
        
        # Get RAG pipeline instance
        rag = get_rag_pipeline()
        
        # Generate answer with context (await the async method)
        result = await rag.ask(
            query=request.query,
            user_id=request.user_id,
            top_k=request.top_k,
            max_length=request.max_length,
            temperature=request.temperature
        )
        
        return AskResponse(**result)
        
    except Exception as e:
        logger.error(f"Error in ask endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process question: {str(e)}"
        )


@router.get("/ask/health")
async def health_check():
    """Check if RAG pipeline is ready"""
    try:
        rag = get_rag_pipeline()
        
        return {
            "status": "healthy",
            "groq_connected": rag.client is not None,
            "model_name": rag.model_name,
            "api_key_configured": bool(rag.groq_api_key)
        }
        
    except Exception as e:
        logger.error(f"RAG pipeline health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }
