"""
Cross-Reference Service
Identifies and tracks relationships between multiple documents
"""

from typing import List, Dict, Any, Optional
from supabase import Client
import logging
import os
from groq import Groq

logger = logging.getLogger(__name__)

class CrossReferenceService:
    def __init__(self, supabase_client: Client, pinecone_index):
        self.supabase = supabase_client
        self.pinecone_index = pinecone_index
        self.groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))
        
    async def find_related_documents(
        self, 
        query: str, 
        user_id: str,
        source_doc_id: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Find documents related to the query across user's document collection
        If source_doc_id provided, finds relationships to that specific document
        """
        try:
            # This will be enhanced when we integrate with RAG pipeline
            # For now, we'll return stored cross-references
            
            query_builder = self.supabase.table('document_references')\
                .select('*')\
                .eq('user_id', user_id)
            
            if source_doc_id:
                query_builder = query_builder.eq('source_doc_id', source_doc_id)
            
            result = query_builder\
                .order('similarity_score', desc=True)\
                .limit(top_k)\
                .execute()
            
            return result.data or []
        except Exception as e:
            logger.error(f"Error finding related documents: {str(e)}")
            raise
    
    async def create_reference(
        self,
        user_id: str,
        source_doc_id: str,
        target_doc_id: str,
        source_context: str,
        target_context: str,
        similarity_score: float,
        reference_type: str = 'related'
    ) -> Dict[str, Any]:
        """Create a cross-reference between two documents"""
        try:
            # Generate AI explanation of relationship
            relationship_desc = await self._generate_relationship_description(
                source_context, target_context, reference_type
            )
            
            result = self.supabase.table('document_references').insert({
                'user_id': user_id,
                'source_doc_id': source_doc_id,
                'target_doc_id': target_doc_id,
                'source_context': source_context,
                'target_context': target_context,
                'similarity_score': similarity_score,
                'reference_type': reference_type,
                'relationship_description': relationship_desc
            }).execute()
            
            logger.info(f"Created cross-reference: {source_doc_id} -> {target_doc_id}")
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error creating reference: {str(e)}")
            raise
    
    async def _generate_relationship_description(
        self,
        source_text: str,
        target_text: str,
        ref_type: str
    ) -> str:
        """Use AI to explain the relationship between two text passages"""
        try:
            prompt = f"""Analyze the relationship between these two text passages and provide a brief explanation (1-2 sentences).

Passage 1:
{source_text[:500]}

Passage 2:
{target_text[:500]}

Relationship Type: {ref_type}

Provide a concise explanation of how these passages relate to each other:"""

            response = self.groq_client.chat.completions.create(
                model=os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile'),
                messages=[
                    {"role": "system", "content": "You are an expert at analyzing document relationships. Be concise and specific."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=200
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Error generating relationship description: {str(e)}")
            return f"These passages share {ref_type} content."
    
    async def get_document_references(
        self,
        user_id: str,
        doc_id: str,
        direction: str = 'both'  # 'source', 'target', or 'both'
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Get all references for a specific document"""
        try:
            result = {'outgoing': [], 'incoming': []}
            
            if direction in ['source', 'both']:
                # References FROM this document
                outgoing = self.supabase.table('document_references')\
                    .select('*')\
                    .eq('user_id', user_id)\
                    .eq('source_doc_id', doc_id)\
                    .execute()
                result['outgoing'] = outgoing.data or []
            
            if direction in ['target', 'both']:
                # References TO this document
                incoming = self.supabase.table('document_references')\
                    .select('*')\
                    .eq('user_id', user_id)\
                    .eq('target_doc_id', doc_id)\
                    .execute()
                result['incoming'] = incoming.data or []
            
            return result
        except Exception as e:
            logger.error(f"Error getting document references: {str(e)}")
            raise
    
    async def analyze_document_network(self, user_id: str) -> Dict[str, Any]:
        """
        Analyze the entire network of document relationships for a user
        Returns network statistics and key connection points
        """
        try:
            # Get all references
            refs = self.supabase.table('document_references')\
                .select('source_doc_id, target_doc_id, reference_type')\
                .eq('user_id', user_id)\
                .execute()
            
            if not refs.data:
                return {
                    'total_connections': 0,
                    'unique_documents': 0,
                    'connection_types': {},
                    'most_connected_docs': []
                }
            
            # Count connections per document
            doc_connections = {}
            connection_types = {}
            
            for ref in refs.data:
                source = ref['source_doc_id']
                target = ref['target_doc_id']
                ref_type = ref['reference_type']
                
                doc_connections[source] = doc_connections.get(source, 0) + 1
                doc_connections[target] = doc_connections.get(target, 0) + 1
                connection_types[ref_type] = connection_types.get(ref_type, 0) + 1
            
            # Find most connected documents
            most_connected = sorted(
                [{'doc_id': k, 'connections': v} for k, v in doc_connections.items()],
                key=lambda x: x['connections'],
                reverse=True
            )[:10]
            
            return {
                'total_connections': len(refs.data),
                'unique_documents': len(doc_connections),
                'connection_types': connection_types,
                'most_connected_docs': most_connected
            }
        except Exception as e:
            logger.error(f"Error analyzing document network: {str(e)}")
            raise
    
    async def suggest_connections(
        self,
        user_id: str,
        doc_id: str,
        threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """
        Suggest potential cross-references for a document
        Uses vector similarity to find related content
        """
        try:
            # This will be fully implemented when integrated with RAG pipeline
            # For now, return existing high-similarity references
            
            result = self.supabase.table('document_references')\
                .select('*')\
                .eq('user_id', user_id)\
                .eq('source_doc_id', doc_id)\
                .gte('similarity_score', threshold)\
                .order('similarity_score', desc=True)\
                .execute()
            
            return result.data or []
        except Exception as e:
            logger.error(f"Error suggesting connections: {str(e)}")
            raise
    
    async def delete_reference(self, reference_id: str, user_id: str) -> bool:
        """Delete a cross-reference"""
        try:
            self.supabase.table('document_references')\
                .delete()\
                .eq('id', reference_id)\
                .eq('user_id', user_id)\
                .execute()
            
            logger.info(f"Deleted reference {reference_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting reference: {str(e)}")
            return False
