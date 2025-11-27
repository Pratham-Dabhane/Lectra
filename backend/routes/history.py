"""
Chat History API Routes
Endpoints for managing user chat history
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from utils.logger import logger
from services.chat_history import get_chat_history_service

router = APIRouter(prefix="/api/history", tags=["history"])


class HistoryResponse(BaseModel):
    """Response model for chat history"""
    chats: List[Dict]
    total: int


class PreferencesUpdate(BaseModel):
    """Model for updating user preferences"""
    chat_memory_enabled: Optional[bool] = None
    max_context_messages: Optional[int] = None
    language: Optional[str] = None


@router.get("/{user_id}", response_model=HistoryResponse)
async def get_chat_history(
    user_id: str,
    limit: Optional[int] = 50
):
    """
    Get chat history for a user
    
    Args:
        user_id: User UUID
        limit: Maximum number of chats to return
        
    Returns:
        List of chat records
    """
    try:
        chat_service = get_chat_history_service()
        chats = await chat_service.get_all_chats(user_id, limit)
        
        return {
            "chats": chats,
            "total": len(chats)
        }
        
    except Exception as e:
        logger.error(f"Error fetching history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}")
async def clear_chat_history(user_id: str):
    """
    Clear all chat history for a user
    
    Args:
        user_id: User UUID
        
    Returns:
        Success message
    """
    try:
        chat_service = get_chat_history_service()
        success = await chat_service.delete_user_history(user_id)
        
        if success:
            return {"message": "Chat history cleared successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to clear history")
            
    except Exception as e:
        logger.error(f"Error clearing history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}/{chat_id}")
async def delete_single_chat(user_id: str, chat_id: str):
    """
    Delete a specific chat message
    
    Args:
        user_id: User UUID
        chat_id: Chat UUID
        
    Returns:
        Success message
    """
    try:
        chat_service = get_chat_history_service()
        success = await chat_service.delete_chat(chat_id, user_id)
        
        if success:
            return {"message": "Chat deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Chat not found")
            
    except Exception as e:
        logger.error(f"Error deleting chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/preferences")
async def get_user_preferences(user_id: str):
    """
    Get user preferences
    
    Args:
        user_id: User UUID
        
    Returns:
        User preferences
    """
    try:
        chat_service = get_chat_history_service()
        preferences = await chat_service.get_user_preferences(user_id)
        
        return preferences
        
    except Exception as e:
        logger.error(f"Error fetching preferences: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{user_id}/preferences")
async def update_user_preferences(
    user_id: str,
    preferences: PreferencesUpdate
):
    """
    Update user preferences
    
    Args:
        user_id: User UUID
        preferences: Preferences to update
        
    Returns:
        Updated preferences
    """
    try:
        chat_service = get_chat_history_service()
        
        # Filter out None values
        prefs_dict = {k: v for k, v in preferences.dict().items() if v is not None}
        
        updated = await chat_service.update_user_preferences(user_id, prefs_dict)
        
        return updated
        
    except Exception as e:
        logger.error(f"Error updating preferences: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/stats")
async def get_chat_stats(user_id: str):
    """
    Get chat statistics for a user
    
    Args:
        user_id: User UUID
        
    Returns:
        Chat statistics
    """
    try:
        chat_service = get_chat_history_service()
        chats = await chat_service.get_all_chats(user_id)
        
        total_chats = len(chats)
        total_questions = sum(1 for chat in chats if chat.get("question"))
        
        # Calculate average response length
        avg_response_length = 0
        if total_chats > 0:
            total_length = sum(len(chat.get("answer", "")) for chat in chats)
            avg_response_length = total_length // total_chats
        
        return {
            "total_chats": total_chats,
            "total_questions": total_questions,
            "average_response_length": avg_response_length,
            "oldest_chat": chats[-1] if chats else None,
            "newest_chat": chats[0] if chats else None
        }
        
    except Exception as e:
        logger.error(f"Error fetching stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
