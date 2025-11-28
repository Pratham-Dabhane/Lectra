"""
Export Service
Handles exporting conversations to various formats (PDF, Markdown, JSON)
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from supabase import Client
import logging
import json

logger = logging.getLogger(__name__)

class ExportService:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        
    async def export_conversations(
        self,
        user_id: str,
        chat_ids: List[str],
        export_format: str = 'json',
        include_sources: bool = True
    ) -> Dict[str, Any]:
        """
        Export conversations to specified format
        Returns export metadata and content
        """
        try:
            # Fetch conversations
            chats = self.supabase.table('chats')\
                .select('*')\
                .eq('user_id', user_id)\
                .in_('id', chat_ids)\
                .order('created_at')\
                .execute()
            
            if not chats.data:
                raise ValueError("No chats found for export")
            
            # Generate export content based on format
            if export_format == 'json':
                content = self._export_json(chats.data, include_sources)
            elif export_format == 'markdown':
                content = self._export_markdown(chats.data, include_sources)
            elif export_format == 'pdf':
                content = self._export_pdf_data(chats.data, include_sources)
            else:
                raise ValueError(f"Unsupported export format: {export_format}")
            
            # Calculate metadata
            date_range_start = min(chat['created_at'] for chat in chats.data)
            date_range_end = max(chat['created_at'] for chat in chats.data)
            
            filename = f"lectra_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.{export_format}"
            
            # Save export record
            export_record = self.supabase.table('conversation_exports').insert({
                'user_id': user_id,
                'export_type': export_format,
                'chat_ids': chat_ids,
                'filename': filename,
                'total_messages': len(chats.data),
                'date_range_start': date_range_start,
                'date_range_end': date_range_end,
                'file_size_kb': len(str(content)) // 1024
            }).execute()
            
            logger.info(f"Exported {len(chats.data)} conversations for user {user_id}")
            
            return {
                'export_id': export_record.data[0]['id'] if export_record.data else None,
                'filename': filename,
                'content': content,
                'format': export_format,
                'total_messages': len(chats.data),
                'date_range': {
                    'start': date_range_start,
                    'end': date_range_end
                }
            }
        except Exception as e:
            logger.error(f"Error exporting conversations: {str(e)}")
            raise
    
    def _export_json(self, chats: List[Dict], include_sources: bool) -> str:
        """Export to JSON format"""
        export_data = {
            'exported_at': datetime.utcnow().isoformat(),
            'total_conversations': len(chats),
            'conversations': []
        }
        
        for chat in chats:
            conv = {
                'id': chat['id'],
                'question': chat['question'],
                'answer': chat['answer'],
                'timestamp': chat['created_at']
            }
            
            if include_sources and chat.get('sources'):
                conv['sources'] = chat['sources']
            
            export_data['conversations'].append(conv)
        
        return json.dumps(export_data, indent=2)
    
    def _export_markdown(self, chats: List[Dict], include_sources: bool) -> str:
        """Export to Markdown format"""
        md_content = [
            "# Lectra - Conversation Export",
            f"\n**Exported:** {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
            f"\n**Total Conversations:** {len(chats)}",
            "\n---\n"
        ]
        
        for i, chat in enumerate(chats, 1):
            timestamp = datetime.fromisoformat(chat['created_at'].replace('Z', '+00:00'))
            
            md_content.append(f"\n## Conversation {i}")
            md_content.append(f"\n**Time:** {timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
            md_content.append(f"\n### Question\n{chat['question']}")
            md_content.append(f"\n### Answer\n{chat['answer']}")
            
            if include_sources and chat.get('sources'):
                md_content.append("\n### Sources")
                for source in chat['sources']:
                    md_content.append(f"- {source.get('filename', 'Unknown')} (Score: {source.get('score', 'N/A')})")
            
            md_content.append("\n---\n")
        
        return "\n".join(md_content)
    
    def _export_pdf_data(self, chats: List[Dict], include_sources: bool) -> Dict:
        """
        Prepare data for PDF generation (done on frontend with jsPDF)
        Returns structured data that frontend can render to PDF
        """
        pdf_data = {
            'title': 'Lectra - Study Session Export',
            'export_date': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC'),
            'total_conversations': len(chats),
            'conversations': []
        }
        
        for chat in chats:
            timestamp = datetime.fromisoformat(chat['created_at'].replace('Z', '+00:00'))
            
            conv_data = {
                'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                'question': chat['question'],
                'answer': chat['answer'],
                'sources': []
            }
            
            if include_sources and chat.get('sources'):
                conv_data['sources'] = [
                    {
                        'filename': source.get('filename', 'Unknown'),
                        'score': round(source.get('score', 0), 3)
                    }
                    for source in chat['sources']
                ]
            
            pdf_data['conversations'].append(conv_data)
        
        return pdf_data
    
    async def get_user_exports(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get user's export history"""
        try:
            result = self.supabase.table('conversation_exports')\
                .select('*')\
                .eq('user_id', user_id)\
                .order('exported_at', desc=True)\
                .limit(limit)\
                .execute()
            
            return result.data or []
        except Exception as e:
            logger.error(f"Error fetching user exports: {str(e)}")
            raise
    
    async def delete_export(self, export_id: str, user_id: str) -> bool:
        """Delete an export record"""
        try:
            self.supabase.table('conversation_exports')\
                .delete()\
                .eq('id', export_id)\
                .eq('user_id', user_id)\
                .execute()
            
            logger.info(f"Deleted export {export_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting export: {str(e)}")
            return False
