"""
Chat History Service
Manages user chat history and conversation context in Supabase
"""

from typing import List, Dict, Optional
from datetime import datetime
from supabase import Client
import os
from utils.logger import logger


class ChatHistoryService:
    """Service for managing user chat history"""
    
    def __init__(self, supabase_client: Client):
        """Initialize chat history service"""
        self.supabase = supabase_client
        self.max_history = int(os.getenv("MAX_CHAT_HISTORY", "50"))
        self.context_window = int(os.getenv("CHAT_CONTEXT_WINDOW", "3"))
        logger.info("ChatHistoryService initialized")
        
    async def save_chat(
        self,
        user_id: str,
        question: str,
        answer: str,
        sources: List[Dict] = None
    ) -> Dict:
        """
        Save a chat interaction to database
        
        Args:
            user_id: User UUID
            question: User's question
            answer: Bot's answer
            sources: List of source documents used
            
        Returns:
            Saved chat record
        """
        try:
            chat_data = {
                "user_id": user_id,
                "question": question,
                "answer": answer,
                "sources": sources or [],
                "created_at": datetime.utcnow().isoformat()
            }
            
            result = self.supabase.table("chats").insert(chat_data).execute()
            
            if result.data:
                logger.info(f"Saved chat for user {user_id[:8]}...")
                return result.data[0]
            else:
                logger.error("Failed to save chat: No data returned")
                return None
                
        except Exception as e:
            logger.error(f"Error saving chat: {str(e)}")
            return None
    
    async def get_recent_chats(
        self,
        user_id: str,
        limit: Optional[int] = None
    ) -> List[Dict]:
        """
        Get recent chat history for a user
        
        Args:
            user_id: User UUID
            limit: Number of chats to retrieve (default: context_window)
            
        Returns:
            List of recent chat records
        """
        try:
            limit = limit or self.context_window
            
            result = self.supabase.table("chats")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            if result.data:
                # Reverse to get chronological order
                chats = list(reversed(result.data))
                logger.info(f"Retrieved {len(chats)} recent chats for user {user_id[:8]}...")
                return chats
            
            return []
            
        except Exception as e:
            logger.error(f"Error retrieving recent chats: {str(e)}")
            return []
    
    async def get_all_chats(
        self,
        user_id: str,
        limit: Optional[int] = None
    ) -> List[Dict]:
        """
        Get all chat history for a user
        
        Args:
            user_id: User UUID
            limit: Maximum number of chats (default: max_history)
            
        Returns:
            List of all chat records (newest first)
        """
        try:
            limit = limit or self.max_history
            
            result = self.supabase.table("chats")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            if result.data:
                logger.info(f"Retrieved {len(result.data)} total chats for user {user_id[:8]}...")
                return result.data
            
            return []
            
        except Exception as e:
            logger.error(f"Error retrieving all chats: {str(e)}")
            return []
    
    async def delete_user_history(self, user_id: str) -> bool:
        """
        Delete all chat history for a user
        
        Args:
            user_id: User UUID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            result = self.supabase.table("chats")\
                .delete()\
                .eq("user_id", user_id)\
                .execute()
            
            logger.info(f"Deleted chat history for user {user_id[:8]}...")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting chat history: {str(e)}")
            return False
    
    async def delete_chat(self, chat_id: str, user_id: str) -> bool:
        """
        Delete a specific chat
        
        Args:
            chat_id: Chat UUID
            user_id: User UUID (for verification)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            result = self.supabase.table("chats")\
                .delete()\
                .eq("id", chat_id)\
                .eq("user_id", user_id)\
                .execute()
            
            logger.info(f"Deleted chat {chat_id[:8]}... for user {user_id[:8]}...")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting chat: {str(e)}")
            return False
    
    def format_context_from_history(self, chats: List[Dict]) -> str:
        """
        Format chat history into context string for RAG
        
        Args:
            chats: List of chat records
            
        Returns:
            Formatted context string
        """
        if not chats:
            return ""
        
        context_parts = []
        context_parts.append("Previous conversation context:")
        
        for chat in chats:
            question = chat.get("question", "")
            answer = chat.get("answer", "")
            
            # Truncate long answers
            if len(answer) > 200:
                answer = answer[:200] + "..."
            
            context_parts.append(f"User asked: {question}")
            context_parts.append(f"Assistant answered: {answer}")
        
        return "\n".join(context_parts)
    
    async def get_user_preferences(self, user_id: str) -> Dict:
        """
        Get user preferences
        
        Args:
            user_id: User UUID
            
        Returns:
            User preferences dict
        """
        try:
            result = self.supabase.table("user_preferences")\
                .select("*")\
                .eq("user_id", user_id)\
                .execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            
            # Create default preferences if not exists
            default_prefs = {
                "user_id": user_id,
                "chat_memory_enabled": True,
                "max_context_messages": 3,
                "language": "en"
            }
            
            insert_result = self.supabase.table("user_preferences")\
                .insert(default_prefs)\
                .execute()
            
            return insert_result.data[0] if insert_result.data else default_prefs
            
        except Exception as e:
            logger.error(f"Error getting user preferences: {str(e)}")
            return {
                "chat_memory_enabled": True,
                "max_context_messages": 3,
                "language": "en"
            }
    
    async def update_user_preferences(
        self,
        user_id: str,
        preferences: Dict
    ) -> Dict:
        """
        Update user preferences
        
        Args:
            user_id: User UUID
            preferences: Preferences to update
            
        Returns:
            Updated preferences
        """
        try:
            result = self.supabase.table("user_preferences")\
                .update(preferences)\
                .eq("user_id", user_id)\
                .execute()
            
            if result.data:
                logger.info(f"Updated preferences for user {user_id[:8]}...")
                return result.data[0]
            
            return preferences
            
        except Exception as e:
            logger.error(f"Error updating preferences: {str(e)}")
            return preferences


# Global instance (initialized in main.py)
chat_history_service: Optional[ChatHistoryService] = None


def get_chat_history_service() -> ChatHistoryService:
    """Get the global chat history service instance"""
    if chat_history_service is None:
        raise RuntimeError("ChatHistoryService not initialized")
    return chat_history_service
