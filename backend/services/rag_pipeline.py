"""
RAG Pipeline Service for Question Answering
Integrates Pinecone vector retrieval with Groq API for answer generation
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
        self.model_name = os.getenv("GROQ_MODEL", "mixtral-8x7b-32768")
        self.client = None
        
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
        max_length: int = 512,
        temperature: float = 0.7
    ) -> str:
        """
        Generate answer using Groq API with retrieved context
        
        Args:
            query: User question
            context_chunks: Retrieved context from Pinecone
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
            
            # Build messages for chat completion
            messages = [
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant. Answer questions based on the provided context. If the context doesn't contain relevant information, say so clearly."
                },
                {
                    "role": "user",
                    "content": f"""Context:
{context_text}

Question: {query}

Provide a clear, concise answer based on the context above."""
                }
            ]
            
            # Call Groq API
            completion = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                max_tokens=max_length,
                temperature=temperature,
                top_p=0.95
            )
            
            # Extract answer
            answer = completion.choices[0].message.content.strip()
            
            logger.info(f"Generated answer: {answer[:100]}...")
            return answer
            
        except Exception as e:
            logger.error(f"Error generating answer: {str(e)}")
            return f"I encountered an error while generating the answer: {str(e)}"
    
    def ask(
        self, 
        query: str, 
        user_id: str,
        top_k: int = 3,
        max_length: int = 512,
        temperature: float = 0.7
    ) -> Dict:
        """
        Complete RAG pipeline: retrieve context + generate answer
        
        Args:
            query: User question
            user_id: User identifier
            top_k: Number of context chunks to retrieve
            max_length: Maximum tokens in response
            temperature: Sampling temperature
            
        Returns:
            Dictionary with answer and references
        """
        try:
            # Step 1: Retrieve context
            context_chunks = self.retrieve_context(query, user_id, top_k)
            
            if not context_chunks:
                return {
                    "answer": "I couldn't find any relevant information in your documents to answer this question.",
                    "references": []
                }
            
            # Step 2: Generate answer
            answer = self.generate_answer(
                query, 
                context_chunks, 
                max_length, 
                temperature
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
            
            return {
                "answer": answer,
                "references": references
            }
            
        except Exception as e:
            logger.error(f"Error in RAG pipeline: {str(e)}")
            return {
                "answer": f"An error occurred: {str(e)}",
                "references": []
            }


# Singleton instance
_rag_pipeline = None

def get_rag_pipeline() -> RAGPipeline:
    """Get or create RAG pipeline singleton"""
    global _rag_pipeline
    if _rag_pipeline is None:
        _rag_pipeline = RAGPipeline()
    return _rag_pipeline
