"""
API Routes for Phase 6 Features
- Analytics & Study Sessions
- Conversation Exports
- Flashcards
- Cross-References
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/phase6", tags=["phase6"])

# Pydantic models for request/response
class ExportRequest(BaseModel):
    chat_ids: List[str]
    format: str = "pdf"  # pdf, markdown, json
    include_sources: bool = True

class FlashcardGenerateRequest(BaseModel):
    conversations: List[Dict[str, str]] = []  # List of {question, answer} dicts
    chat_ids: List[str] = []  # Optional: for backward compatibility
    limit: int = 10

class FlashcardReviewRequest(BaseModel):
    quality: int  # 0-5

class CrossReferenceRequest(BaseModel):
    source_doc_id: str
    target_doc_id: str
    source_context: str
    target_context: str
    similarity_score: float
    reference_type: str = "related"

# Service instances (initialized in main.py)
analytics_service = None
export_service = None
flashcard_service = None
cross_reference_service = None

# =====================================================
# ANALYTICS ROUTES
# =====================================================

@router.get("/analytics/{user_id}/stats")
async def get_user_stats(user_id: str, days: int = 30):
    """Get user study statistics"""
    try:
        stats = await analytics_service.get_user_stats(user_id, days)
        return {"success": True, "data": stats}
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/{user_id}/weekly")
async def get_weekly_summary(user_id: str):
    """Get last 7 days summary"""
    try:
        summary = await analytics_service.get_weekly_summary(user_id)
        return {"success": True, "data": summary}
    except Exception as e:
        logger.error(f"Error getting weekly summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/{user_id}/monthly")
async def get_monthly_summary(user_id: str):
    """Get last 30 days summary"""
    try:
        summary = await analytics_service.get_monthly_summary(user_id)
        return {"success": True, "data": summary}
    except Exception as e:
        logger.error(f"Error getting monthly summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analytics/{user_id}/session/start")
async def start_study_session(user_id: str):
    """Start a new study session"""
    try:
        session = await analytics_service.start_session(user_id)
        return {"success": True, "session": session}
    except Exception as e:
        logger.error(f"Error starting session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analytics/session/{session_id}/end")
async def end_study_session(session_id: str):
    """End a study session"""
    try:
        session = await analytics_service.end_session(session_id)
        return {"success": True, "session": session}
    except Exception as e:
        logger.error(f"Error ending session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================
# EXPORT ROUTES
# =====================================================

@router.post("/export/{user_id}")
async def export_conversations(user_id: str, request: ExportRequest):
    """Export conversations to specified format"""
    try:
        if request.format not in ['pdf', 'markdown', 'json']:
            raise HTTPException(status_code=400, detail="Invalid export format")
        
        export_data = await export_service.export_conversations(
            user_id=user_id,
            chat_ids=request.chat_ids,
            export_format=request.format,
            include_sources=request.include_sources
        )
        
        return {"success": True, "export": export_data}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error exporting conversations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export/{user_id}/history")
async def get_export_history(user_id: str, limit: int = 20):
    """Get user's export history"""
    try:
        exports = await export_service.get_user_exports(user_id, limit)
        return {"success": True, "exports": exports}
    except Exception as e:
        logger.error(f"Error fetching export history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/export/{user_id}/{export_id}")
async def delete_export(user_id: str, export_id: str):
    """Delete an export record"""
    try:
        success = await export_service.delete_export(export_id, user_id)
        return {"success": success}
    except Exception as e:
        logger.error(f"Error deleting export: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================
# FLASHCARD ROUTES
# =====================================================

@router.post("/flashcards/{user_id}/generate")
async def generate_flashcards(user_id: str, request: FlashcardGenerateRequest):
    """Generate flashcards from chat conversations"""
    try:
        flashcards = await flashcard_service.generate_from_chat(
            user_id=user_id,
            chat_ids=request.chat_ids,
            conversations=request.conversations,
            limit=request.limit
        )
        
        return {
            "success": True,
            "flashcards": flashcards,
            "total_generated": len(flashcards)
        }
    except Exception as e:
        logger.error(f"Error generating flashcards: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/flashcards/{user_id}")
async def get_flashcards(
    user_id: str,
    topic: Optional[str] = None,
    include_archived: bool = False
):
    """Get user's flashcards"""
    try:
        flashcards = await flashcard_service.get_user_flashcards(
            user_id=user_id,
            topic=topic,
            include_archived=include_archived
        )
        
        return {"success": True, "flashcards": flashcards, "total": len(flashcards)}
    except Exception as e:
        logger.error(f"Error fetching flashcards: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/flashcards/{user_id}/due")
async def get_due_flashcards(user_id: str):
    """Get flashcards due for review"""
    try:
        flashcards = await flashcard_service.get_due_flashcards(user_id)
        return {"success": True, "flashcards": flashcards, "total_due": len(flashcards)}
    except Exception as e:
        logger.error(f"Error fetching due flashcards: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/flashcards/{user_id}/{flashcard_id}/review")
async def review_flashcard(user_id: str, flashcard_id: str, request: FlashcardReviewRequest):
    """Review a flashcard (updates spaced repetition)"""
    try:
        if not 0 <= request.quality <= 5:
            raise HTTPException(status_code=400, detail="Quality must be between 0 and 5")
        
        updated_card = await flashcard_service.review_flashcard(
            flashcard_id=flashcard_id,
            quality=request.quality,
            user_id=user_id
        )
        
        return {"success": True, "flashcard": updated_card}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error reviewing flashcard: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/flashcards/{user_id}/{flashcard_id}/archive")
async def archive_flashcard(user_id: str, flashcard_id: str):
    """Archive a flashcard"""
    try:
        success = await flashcard_service.archive_flashcard(flashcard_id, user_id)
        return {"success": success}
    except Exception as e:
        logger.error(f"Error archiving flashcard: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/flashcards/{user_id}/{flashcard_id}")
async def delete_flashcard(user_id: str, flashcard_id: str):
    """Delete a flashcard"""
    try:
        success = await flashcard_service.delete_flashcard(flashcard_id, user_id)
        return {"success": success}
    except Exception as e:
        logger.error(f"Error deleting flashcard: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================
# CROSS-REFERENCE ROUTES
# =====================================================

@router.get("/cross-reference/{user_id}/find")
async def find_related_documents(
    user_id: str,
    query: str,
    source_doc_id: Optional[str] = None,
    top_k: int = 5
):
    """Find documents related to query or source document"""
    try:
        references = await cross_reference_service.find_related_documents(
            query=query,
            user_id=user_id,
            source_doc_id=source_doc_id,
            top_k=top_k
        )
        
        return {"success": True, "references": references, "total": len(references)}
    except Exception as e:
        logger.error(f"Error finding related documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cross-reference/{user_id}/create")
async def create_cross_reference(user_id: str, request: CrossReferenceRequest):
    """Create a cross-reference between documents"""
    try:
        reference = await cross_reference_service.create_reference(
            user_id=user_id,
            source_doc_id=request.source_doc_id,
            target_doc_id=request.target_doc_id,
            source_context=request.source_context,
            target_context=request.target_context,
            similarity_score=request.similarity_score,
            reference_type=request.reference_type
        )
        
        return {"success": True, "reference": reference}
    except Exception as e:
        logger.error(f"Error creating cross-reference: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cross-reference/{user_id}/document/{doc_id}")
async def get_document_references(
    user_id: str,
    doc_id: str,
    direction: str = "both"
):
    """Get all references for a specific document"""
    try:
        if direction not in ['source', 'target', 'both']:
            raise HTTPException(status_code=400, detail="Invalid direction")
        
        references = await cross_reference_service.get_document_references(
            user_id=user_id,
            doc_id=doc_id,
            direction=direction
        )
        
        return {"success": True, "references": references}
    except Exception as e:
        logger.error(f"Error getting document references: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cross-reference/{user_id}/network")
async def analyze_document_network(user_id: str):
    """Analyze user's document network"""
    try:
        network_stats = await cross_reference_service.analyze_document_network(user_id)
        return {"success": True, "network": network_stats}
    except Exception as e:
        logger.error(f"Error analyzing network: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cross-reference/{user_id}/suggest/{doc_id}")
async def suggest_connections(user_id: str, doc_id: str, threshold: float = 0.7):
    """Suggest potential cross-references for a document"""
    try:
        suggestions = await cross_reference_service.suggest_connections(
            user_id=user_id,
            doc_id=doc_id,
            threshold=threshold
        )
        
        return {"success": True, "suggestions": suggestions, "total": len(suggestions)}
    except Exception as e:
        logger.error(f"Error suggesting connections: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/cross-reference/{user_id}/{reference_id}")
async def delete_cross_reference(user_id: str, reference_id: str):
    """Delete a cross-reference"""
    try:
        success = await cross_reference_service.delete_reference(reference_id, user_id)
        return {"success": success}
    except Exception as e:
        logger.error(f"Error deleting cross-reference: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
