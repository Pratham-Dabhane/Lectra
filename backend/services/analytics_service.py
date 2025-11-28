"""
Study Session Analytics Service
Tracks user study sessions, calculates statistics, and provides insights
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from supabase import Client
import logging

logger = logging.getLogger(__name__)

class AnalyticsService:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        
    async def start_session(self, user_id: str) -> Dict[str, Any]:
        """Start a new study session"""
        try:
            result = self.supabase.table('study_sessions').insert({
                'user_id': user_id,
                'session_start': datetime.utcnow().isoformat(),
                'questions_asked': 0,
                'documents_referenced': [],
                'topics_covered': []
            }).execute()
            
            logger.info(f"Started study session for user {user_id}")
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error starting session: {str(e)}")
            raise
    
    async def end_session(self, session_id: str) -> Dict[str, Any]:
        """End a study session and calculate duration"""
        try:
            # Get session start time
            session = self.supabase.table('study_sessions')\
                .select('session_start')\
                .eq('id', session_id)\
                .single()\
                .execute()
            
            if not session.data:
                raise ValueError(f"Session {session_id} not found")
            
            start_time = datetime.fromisoformat(session.data['session_start'].replace('Z', '+00:00'))
            end_time = datetime.utcnow()
            duration = int((end_time - start_time).total_seconds() / 60)  # Minutes
            
            # Update session
            result = self.supabase.table('study_sessions')\
                .update({
                    'session_end': end_time.isoformat(),
                    'duration_minutes': duration
                })\
                .eq('id', session_id)\
                .execute()
            
            logger.info(f"Ended session {session_id}, duration: {duration} minutes")
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error ending session: {str(e)}")
            raise
    
    async def track_question(self, user_id: str, question: str, documents: List[str], topics: List[str]):
        """Track a question asked during active session"""
        try:
            # Get or create active session
            active_session = await self.get_active_session(user_id)
            
            if not active_session:
                active_session = await self.start_session(user_id)
            
            session_id = active_session['id']
            
            # Update session metrics
            current_docs = active_session.get('documents_referenced', [])
            current_topics = active_session.get('topics_covered', [])
            
            # Add new documents and topics (avoid duplicates)
            updated_docs = list(set(current_docs + documents))
            updated_topics = list(set(current_topics + topics))
            
            self.supabase.table('study_sessions')\
                .update({
                    'questions_asked': active_session.get('questions_asked', 0) + 1,
                    'documents_referenced': updated_docs,
                    'topics_covered': updated_topics
                })\
                .eq('id', session_id)\
                .execute()
            
            logger.info(f"Tracked question for session {session_id}")
        except Exception as e:
            logger.error(f"Error tracking question: {str(e)}")
            # Don't raise - tracking shouldn't break main flow
    
    async def get_active_session(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's current active session (started within last 4 hours, not ended)"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=4)
            
            result = self.supabase.table('study_sessions')\
                .select('*')\
                .eq('user_id', user_id)\
                .is_('session_end', 'null')\
                .gte('session_start', cutoff_time.isoformat())\
                .order('session_start', desc=True)\
                .limit(1)\
                .execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting active session: {str(e)}")
            return None
    
    async def get_user_stats(self, user_id: str, days: int = 30) -> Dict[str, Any]:
        """Get comprehensive user study statistics"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            # Get sessions in date range
            sessions = self.supabase.table('study_sessions')\
                .select('*')\
                .eq('user_id', user_id)\
                .gte('session_start', cutoff_date.isoformat())\
                .execute()
            
            if not sessions.data:
                return {
                    'total_sessions': 0,
                    'total_questions': 0,
                    'total_study_time_minutes': 0,
                    'average_session_duration': 0,
                    'unique_documents': 0,
                    'unique_topics': 0,
                    'study_streak_days': 0,
                    'most_active_topics': [],
                    'daily_activity': []
                }
            
            # Calculate metrics
            total_sessions = len(sessions.data)
            total_questions = sum(s.get('questions_asked', 0) for s in sessions.data)
            total_time = sum(s.get('duration_minutes', 0) for s in sessions.data if s.get('duration_minutes'))
            avg_duration = total_time / total_sessions if total_sessions > 0 else 0
            
            # Unique documents and topics
            all_docs = set()
            all_topics = set()
            for session in sessions.data:
                all_docs.update(session.get('documents_referenced', []))
                all_topics.update(session.get('topics_covered', []))
            
            # Topic frequency
            topic_counts = {}
            for session in sessions.data:
                for topic in session.get('topics_covered', []):
                    topic_counts[topic] = topic_counts.get(topic, 0) + 1
            
            most_active_topics = sorted(
                [{'topic': k, 'count': v} for k, v in topic_counts.items()],
                key=lambda x: x['count'],
                reverse=True
            )[:10]
            
            # Daily activity
            daily_activity = self._calculate_daily_activity(sessions.data, days)
            
            # Study streak
            study_streak = await self._calculate_streak(user_id)
            
            return {
                'total_sessions': total_sessions,
                'total_questions': total_questions,
                'total_study_time_minutes': total_time,
                'average_session_duration': round(avg_duration, 1),
                'unique_documents': len(all_docs),
                'unique_topics': len(all_topics),
                'study_streak_days': study_streak,
                'most_active_topics': most_active_topics,
                'daily_activity': daily_activity
            }
        except Exception as e:
            logger.error(f"Error getting user stats: {str(e)}")
            raise
    
    def _calculate_daily_activity(self, sessions: List[Dict], days: int) -> List[Dict]:
        """Calculate daily question counts"""
        daily_counts = {}
        
        for session in sessions:
            date_str = session['session_start'][:10]  # YYYY-MM-DD
            questions = session.get('questions_asked', 0)
            daily_counts[date_str] = daily_counts.get(date_str, 0) + questions
        
        # Fill in missing days with 0
        result = []
        for i in range(days):
            date = (datetime.utcnow() - timedelta(days=i)).strftime('%Y-%m-%d')
            result.append({
                'date': date,
                'questions': daily_counts.get(date, 0)
            })
        
        return sorted(result, key=lambda x: x['date'])
    
    async def _calculate_streak(self, user_id: str) -> int:
        """Calculate consecutive days with study activity"""
        try:
            streak = 0
            current_date = datetime.utcnow().date()
            
            while True:
                # Check if user had sessions on current_date
                sessions = self.supabase.table('study_sessions')\
                    .select('id')\
                    .eq('user_id', user_id)\
                    .gte('session_start', current_date.isoformat())\
                    .lt('session_start', (current_date + timedelta(days=1)).isoformat())\
                    .execute()
                
                if not sessions.data:
                    break
                
                streak += 1
                current_date -= timedelta(days=1)
            
            return streak
        except Exception as e:
            logger.error(f"Error calculating streak: {str(e)}")
            return 0
    
    async def get_weekly_summary(self, user_id: str) -> Dict[str, Any]:
        """Get summary of last 7 days"""
        return await self.get_user_stats(user_id, days=7)
    
    async def get_monthly_summary(self, user_id: str) -> Dict[str, Any]:
        """Get summary of last 30 days"""
        return await self.get_user_stats(user_id, days=30)
