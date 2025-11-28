"""
Flashcard Service
Generates AI-powered flashcards from chat conversations
Implements spaced repetition algorithm (SM-2)
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from supabase import Client
import logging
import os
from groq import Groq

logger = logging.getLogger(__name__)

class FlashcardService:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        self.groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))
        
    async def generate_from_chat(self, user_id: str, chat_ids: List[str] = None, conversations: List[Dict[str, str]] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Generate flashcards from chat conversations using AI"""
        try:
            # Use provided conversations or fetch from database
            if conversations:
                chats_data = conversations
            elif chat_ids:
                chats = self.supabase.table('chats')\
                    .select('question, answer, sources')\
                    .eq('user_id', user_id)\
                    .in_('id', chat_ids)\
                    .execute()
                
                if not chats.data:
                    return []
                chats_data = chats.data
            else:
                return []
            
            # Prepare conversation context
            conversation_text = self._format_conversations(chats_data)
            
            # Generate flashcards using Groq
            flashcards_data = await self._ai_generate_flashcards(conversation_text, limit)
            
            # Save to database
            saved_flashcards = []
            for card in flashcards_data:
                result = self.supabase.table('flashcards').insert({
                    'user_id': user_id,
                    'question': card['question'],
                    'answer': card['answer'],
                    'topic': card.get('topic', 'General'),
                    'difficulty': card.get('difficulty', 'medium'),
                    'tags': card.get('tags', []),
                    'next_review_at': (datetime.utcnow() + timedelta(days=1)).isoformat()
                }).execute()
                
                if result.data:
                    saved_flashcards.append(result.data[0])
            
            logger.info(f"Generated {len(saved_flashcards)} flashcards for user {user_id}")
            return saved_flashcards
        except Exception as e:
            logger.error(f"Error generating flashcards: {str(e)}")
            raise
    
    def _format_conversations(self, chats: List[Dict]) -> str:
        """Format chat data for AI processing"""
        formatted = []
        for chat in chats:
            formatted.append(f"Q: {chat['question']}\nA: {chat['answer']}\n")
        return "\n".join(formatted)
    
    async def _ai_generate_flashcards(self, conversation_text: str, limit: int) -> List[Dict]:
        """Use Groq AI to extract key concepts and generate flashcards"""
        try:
            prompt = f"""Based on the following study conversation, generate {limit} educational flashcards.
Each flashcard should have:
- A clear, concise question
- A comprehensive answer
- A topic/category
- Difficulty level (easy/medium/hard)
- Relevant tags

Conversation:
{conversation_text}

Return ONLY a valid JSON array of flashcards in this exact format:
[
  {{
    "question": "What is...",
    "answer": "The answer is...",
    "topic": "Topic name",
    "difficulty": "medium",
    "tags": ["tag1", "tag2"]
  }}
]

Generate exactly {limit} flashcards. Return ONLY the JSON array, no other text."""

            response = self.groq_client.chat.completions.create(
                model=os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile'),
                messages=[
                    {"role": "system", "content": "You are an expert educational content creator. Generate high-quality flashcards in valid JSON format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            # Parse JSON response
            import json
            flashcards_json = response.choices[0].message.content.strip()
            
            # Clean up response if it has markdown code blocks
            if flashcards_json.startswith('```'):
                flashcards_json = flashcards_json.split('```')[1]
                if flashcards_json.startswith('json'):
                    flashcards_json = flashcards_json[4:]
            
            flashcards = json.loads(flashcards_json)
            return flashcards[:limit]  # Ensure we don't exceed limit
        except Exception as e:
            logger.error(f"Error in AI flashcard generation: {str(e)}")
            # Fallback: create basic flashcards from conversations
            return self._fallback_flashcards(conversation_text, limit)
    
    def _fallback_flashcards(self, text: str, limit: int) -> List[Dict]:
        """Fallback method if AI generation fails"""
        # Simple extraction of Q&A pairs
        lines = text.split('\n')
        flashcards = []
        current_q = None
        
        for line in lines:
            if line.startswith('Q: '):
                current_q = line[3:].strip()
            elif line.startswith('A: ') and current_q:
                flashcards.append({
                    'question': current_q,
                    'answer': line[3:].strip(),
                    'topic': 'General',
                    'difficulty': 'medium',
                    'tags': []
                })
                current_q = None
                
                if len(flashcards) >= limit:
                    break
        
        return flashcards
    
    async def get_user_flashcards(
        self, 
        user_id: str, 
        topic: Optional[str] = None,
        include_archived: bool = False
    ) -> List[Dict[str, Any]]:
        """Get user's flashcards with optional filtering"""
        try:
            query = self.supabase.table('flashcards')\
                .select('*')\
                .eq('user_id', user_id)
            
            if not include_archived:
                query = query.eq('is_archived', False)
            
            if topic:
                query = query.eq('topic', topic)
            
            result = query.order('created_at', desc=True).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error fetching flashcards: {str(e)}")
            raise
    
    async def get_due_flashcards(self, user_id: str) -> List[Dict[str, Any]]:
        """Get flashcards due for review"""
        try:
            now = datetime.utcnow().isoformat()
            
            result = self.supabase.table('flashcards')\
                .select('*')\
                .eq('user_id', user_id)\
                .eq('is_archived', False)\
                .lte('next_review_at', now)\
                .order('next_review_at')\
                .execute()
            
            return result.data or []
        except Exception as e:
            logger.error(f"Error fetching due flashcards: {str(e)}")
            raise
    
    async def review_flashcard(
        self, 
        flashcard_id: str, 
        quality: int,  # 0-5 scale (0=complete blackout, 5=perfect recall)
        user_id: str
    ) -> Dict[str, Any]:
        """
        Update flashcard using SM-2 spaced repetition algorithm
        quality: 0-5 (0=total fail, 3=correct with difficulty, 5=perfect)
        """
        try:
            # Get current flashcard
            card = self.supabase.table('flashcards')\
                .select('*')\
                .eq('id', flashcard_id)\
                .eq('user_id', user_id)\
                .single()\
                .execute()
            
            if not card.data:
                raise ValueError(f"Flashcard {flashcard_id} not found")
            
            # SM-2 Algorithm
            ease_factor = card.data.get('ease_factor', 2.5)
            interval = card.data.get('interval_days', 1)
            times_reviewed = card.data.get('times_reviewed', 0)
            times_correct = card.data.get('times_correct', 0)
            
            # Update ease factor
            ease_factor = max(1.3, ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
            
            # Calculate next interval
            if quality < 3:
                # Failed - reset interval
                interval = 1
            else:
                # Passed - increase interval
                times_correct += 1
                if times_reviewed == 0:
                    interval = 1
                elif times_reviewed == 1:
                    interval = 6
                else:
                    interval = int(interval * ease_factor)
            
            next_review = datetime.utcnow() + timedelta(days=interval)
            
            # Update flashcard
            result = self.supabase.table('flashcards')\
                .update({
                    'times_reviewed': times_reviewed + 1,
                    'times_correct': times_correct,
                    'last_reviewed_at': datetime.utcnow().isoformat(),
                    'next_review_at': next_review.isoformat(),
                    'ease_factor': round(ease_factor, 2),
                    'interval_days': interval
                })\
                .eq('id', flashcard_id)\
                .execute()
            
            logger.info(f"Reviewed flashcard {flashcard_id}, next review in {interval} days")
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error reviewing flashcard: {str(e)}")
            raise
    
    async def archive_flashcard(self, flashcard_id: str, user_id: str) -> bool:
        """Archive a flashcard"""
        try:
            self.supabase.table('flashcards')\
                .update({'is_archived': True})\
                .eq('id', flashcard_id)\
                .eq('user_id', user_id)\
                .execute()
            
            logger.info(f"Archived flashcard {flashcard_id}")
            return True
        except Exception as e:
            logger.error(f"Error archiving flashcard: {str(e)}")
            return False
    
    async def delete_flashcard(self, flashcard_id: str, user_id: str) -> bool:
        """Delete a flashcard"""
        try:
            self.supabase.table('flashcards')\
                .delete()\
                .eq('id', flashcard_id)\
                .eq('user_id', user_id)\
                .execute()
            
            logger.info(f"Deleted flashcard {flashcard_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting flashcard: {str(e)}")
            return False
