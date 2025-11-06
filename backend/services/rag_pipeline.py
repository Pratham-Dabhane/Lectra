"""
RAG Pipeline Service for Question Answering
Integrates Pinecone vector retrieval with Mistral 7B for answer generation
"""

import os
import torch
from typing import List, Dict, Optional
from transformers import AutoTokenizer, AutoModelForCausalLM
from .vector_store import VectorStoreService
from .embeddings import EmbeddingService
from utils.logger import logger


class RAGPipeline:
    def __init__(self):
        self.vector_store = VectorStoreService()
        self.embedding_service = EmbeddingService()
        self.model_name = "mistralai/Mistral-7B-Instruct-v0.2"
        self.tokenizer = None
        self.model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Load model on initialization
        self._load_model()
    
    def _load_model(self):
        """Load Mistral 7B model with optimizations"""
        try:
            logger.info(f"Loading Mistral 7B model on {self.device}...")
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                trust_remote_code=True
            )
            
            # Set padding token if not set
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            # Load model with optimizations
            if self.device == "cuda":
                # Use FP16 for GPU
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_name,
                    torch_dtype=torch.float16,
                    device_map="auto",
                    trust_remote_code=True,
                    low_cpu_mem_usage=True
                )
            else:
                # CPU mode
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_name,
                    torch_dtype=torch.float32,
                    trust_remote_code=True,
                    low_cpu_mem_usage=True
                )
                self.model.to(self.device)
            
            logger.info(f"✓ Mistral 7B loaded successfully on {self.device}")
            
        except Exception as e:
            logger.error(f"Failed to load Mistral model: {str(e)}")
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
            results = self.vector_store.query_similar(
                query_embedding=query_embedding,
                top_k=top_k,
                filter={"user_id": user_id}
            )
            
            # Format results
            context_chunks = []
            for match in results.get("matches", []):
                context_chunks.append({
                    "text": match.get("metadata", {}).get("text", ""),
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
        Generate answer using Mistral 7B with retrieved context
        
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
            
            # Build prompt with instruction format
            prompt = f"""<s>[INST] You are a helpful AI assistant. Answer the question based on the provided context. If the context doesn't contain relevant information, say so clearly.

Context:
{context_text}

Question: {query}

Provide a clear, concise answer based on the context above. [/INST]"""
            
            # Tokenize input
            inputs = self.tokenizer(
                prompt,
                return_tensors="pt",
                truncation=True,
                max_length=2048
            ).to(self.device)
            
            # Generate response
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=max_length,
                    temperature=temperature,
                    do_sample=True,
                    top_p=0.95,
                    top_k=50,
                    pad_token_id=self.tokenizer.eos_token_id
                )
            
            # Decode response
            full_response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Extract only the answer (after [/INST])
            if "[/INST]" in full_response:
                answer = full_response.split("[/INST]")[-1].strip()
            else:
                answer = full_response.strip()
            
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
