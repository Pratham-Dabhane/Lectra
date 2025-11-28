"""
RAG Pipeline Service for Question Answering
Integrates Pinecone vector retrieval with Groq API for answer generation
Enhanced with chat history for context-aware responses
"""

import os
from typing import List, Dict, Optional
from groq import Groq
from .vector_store import VectorStoreService
from .embeddings import EmbeddingService
from utils.logger import logger
from dotenv import load_dotenv

load_dotenv()


class RAGPipeline:
    def __init__(self):
        self.vector_store = VectorStoreService()
        self.embedding_service = EmbeddingService()
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.model_name = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.client = None
        self.chat_history_service = None  # Lazy loaded
        
        # Initialize Groq client
        self._initialize_groq()
    
    def _initialize_groq(self):
        """Initialize Groq API client"""
        try:
            if not self.groq_api_key:
                raise ValueError("GROQ_API_KEY not found in environment variables")
            
            self.client = Groq(api_key=self.groq_api_key)
            logger.info(f"✓ Groq API client initialized with model: {self.model_name}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {str(e)}")
            raise
    
    def retrieve_context(
        self, 
        query: str, 
        user_id: str, 
        top_k: int = 3
    ) -> List[Dict]:
        """
        Retrieve relevant context from Pinecone
        
        Args:
            query: User question
            user_id: User identifier for filtering
            top_k: Number of chunks to retrieve
            
        Returns:
            List of dictionaries with text and metadata
        """
        try:
            # Generate query embedding
            query_embedding = self.embedding_service.create_embeddings([query])[0]
            
            # Query Pinecone with user_id filter
            results = self.vector_store.query_vectors(
                query_embedding=query_embedding,
                user_id=user_id,
                top_k=top_k
            )
            
            # Format results
            context_chunks = []
            for match in results:
                context_chunks.append({
                    "text": match.get("metadata", {}).get("chunk_text", ""),
                    "file_name": match.get("metadata", {}).get("file_name", "Unknown"),
                    "chunk_index": match.get("metadata", {}).get("chunk_index", 0),
                    "score": match.get("score", 0.0)
                })
            
            logger.info(f"Retrieved {len(context_chunks)} context chunks for query")
            return context_chunks
            
        except Exception as e:
            logger.error(f"Error retrieving context: {str(e)}")
            return []
    
    def generate_answer(
        self, 
        query: str, 
        context_chunks: List[Dict],
        chat_history: Optional[List[Dict]] = None,
        max_length: int = 512,
        temperature: float = 0.7
    ) -> str:
        """
        Generate answer using Groq API with retrieved context and chat history
        
        Args:
            query: User question
            context_chunks: Retrieved context from Pinecone
            chat_history: Previous chat messages for context
            max_length: Maximum tokens in response
            temperature: Sampling temperature (0.0 to 1.0)
            
        Returns:
            Generated answer string
        """
        try:
            # Build context from chunks
            context_text = "\n\n".join([
                f"[Source: {chunk['file_name']} - Chunk {chunk['chunk_index']}]\n{chunk['text']}"
                for chunk in context_chunks
            ])
            
            # Build conversation history context
            history_context = ""
            if chat_history:
                history_parts = ["Previous conversation:"]
                for chat in chat_history[-3:]:  # Last 3 messages
                    history_parts.append(f"User: {chat.get('question', '')}")
                    # Truncate long answers
                    answer = chat.get('answer', '')
                    if len(answer) > 150:
                        answer = answer[:150] + "..."
                    history_parts.append(f"Assistant: {answer}")
                history_context = "\n".join(history_parts) + "\n\n"
            
            # Build messages for chat completion
            system_prompt = """You are a helpful study assistant. Answer questions based on the provided context from the user's uploaded documents.

Rules:
1. Use ONLY the information from the provided context
2. If context is insufficient, say "I don't have enough information"
3. Be concise but thorough
4. Consider previous conversation for context
5. Cite sources when possible"""
            
            user_message = f"""{history_context}Context from documents:
{context_text}

Current question: {query}

Provide a clear, accurate answer based on the context above."""
            
            messages = [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ]
            
            # Call Groq API
            completion = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                max_tokens=max_length,
                temperature=temperature,
                top_p=0.9
            )
            
            # Extract answer
            answer = completion.choices[0].message.content.strip()
            
            logger.info(f"Generated answer ({len(answer)} chars) with {len(chat_history) if chat_history else 0} history messages")
            return answer
            
        except Exception as e:
            logger.error(f"Error generating answer: {str(e)}")
            return f"I encountered an error while generating the answer: {str(e)}"
    
    async def ask(
        self, 
        query: str, 
        user_id: str,
        top_k: int = 3,
        max_length: int = 512,
        temperature: float = 0.7,
        use_memory: bool = True
    ) -> Dict:
        """
        Complete RAG pipeline: retrieve context + generate answer with chat history
        
        Args:
            query: User question
            user_id: User identifier
            top_k: Number of context chunks to retrieve
            max_length: Maximum tokens in response
            temperature: Sampling temperature
            use_memory: Whether to use chat history for context
            
        Returns:
            Dictionary with answer and references
        """
        try:
            logger.info(f"Processing question from user {user_id[:8]}...")
            
            # Lazy load chat history service
            if self.chat_history_service is None:
                try:
                    from .chat_history import get_chat_history_service
                    self.chat_history_service = get_chat_history_service()
                except Exception as e:
                    logger.warning(f"Chat history service not available: {str(e)}")
                    use_memory = False
            
            # Lazy load analytics service
            analytics_service = None
            try:
                from .analytics_service import AnalyticsService
                from .supabase_client import supabase_client
                analytics_service = AnalyticsService(supabase_client.client)
            except Exception as e:
                logger.warning(f"Analytics service not available: {str(e)}")
            
            # Get recent chat history if enabled
            recent_chats = []
            if use_memory and self.chat_history_service:
                try:
                    preferences = await self.chat_history_service.get_user_preferences(user_id)
                    if preferences.get("chat_memory_enabled", True):
                        recent_chats = await self.chat_history_service.get_recent_chats(
                            user_id,
                            limit=preferences.get("max_context_messages", 3)
                        )
                except Exception as e:
                    logger.warning(f"Could not load chat history: {str(e)}")
            
            # Step 1: Retrieve context
            context_chunks = self.retrieve_context(query, user_id, top_k)
            
            if not context_chunks:
                no_docs_answer = "I couldn't find any relevant information in your documents to answer this question. Please make sure you've uploaded relevant study materials."
                
                # Still save the interaction
                if self.chat_history_service:
                    try:
                        await self.chat_history_service.save_chat(
                            user_id=user_id,
                            question=query,
                            answer=no_docs_answer,
                            sources=[]
                        )
                    except Exception as e:
                        logger.warning(f"Could not save chat: {str(e)}")
                
                return {
                    "answer": no_docs_answer,
                    "references": [],
                    "used_memory": False
                }
            
            # Step 2: Generate answer with history context
            answer = self.generate_answer(
                query, 
                context_chunks,
                chat_history=recent_chats,
                max_length=max_length, 
                temperature=temperature
            )
            
            # Step 3: Format references
            references = [
                {
                    "file_name": chunk["file_name"],
                    "chunk_index": chunk["chunk_index"],
                    "relevance_score": round(chunk["score"], 3),
                    "excerpt": chunk["text"][:200] + "..." if len(chunk["text"]) > 200 else chunk["text"]
                }
                for chunk in context_chunks
            ]
            
            # Step 4: Save chat to history
            if self.chat_history_service:
                try:
                    await self.chat_history_service.save_chat(
                        user_id=user_id,
                        question=query,
                        answer=answer,
                        sources=references
                    )
                except Exception as e:
                    logger.warning(f"Could not save chat: {str(e)}")
            
            # Step 5: Track analytics (async, non-blocking)
            if analytics_service:
                try:
                    # Extract document names and topics from context
                    documents = list(set(chunk["file_name"] for chunk in context_chunks))
                    topics = [chunk.get("topic", "General") for chunk in context_chunks[:2]]  # Top 2 topics
                    
                    await analytics_service.track_question(
                        user_id=user_id,
                        question=query,
                        documents=documents,
                        topics=topics
                    )
                except Exception as e:
                    logger.warning(f"Could not track analytics: {str(e)}")
            
            logger.info(f"Successfully processed question with {len(references)} references and {len(recent_chats)} history messages")
            
            return {
                "answer": answer,
                "references": references,
                "used_memory": len(recent_chats) > 0
            }
            
        except Exception as e:
            logger.error(f"Error in RAG pipeline: {str(e)}")
            return {
                "answer": f"An error occurred: {str(e)}",
                "references": [],
                "used_memory": False
            }


# Singleton instance
_rag_pipeline = None

def get_rag_pipeline() -> RAGPipeline:
    """Get or create RAG pipeline singleton"""
    global _rag_pipeline
    if _rag_pipeline is None:
        _rag_pipeline = RAGPipeline()
    return _rag_pipeline
