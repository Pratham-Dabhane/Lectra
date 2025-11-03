import os
from typing import List, Dict
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
from utils.logger import logger
import time

load_dotenv()

class VectorStoreService:
    """
    Service for managing vector embeddings in Pinecone
    """
    
    def __init__(self):
        self.api_key = os.getenv("PINECONE_API_KEY")
        self.environment = os.getenv("PINECONE_ENVIRONMENT", "gcp-starter")
        self.index_name = os.getenv("PINECONE_INDEX_NAME", "lectra-embeddings")
        
        if not self.api_key:
            raise ValueError("PINECONE_API_KEY must be set in .env file")
        
        # Initialize Pinecone
        self.pc = Pinecone(api_key=self.api_key)
        
        # Get or create index
        self.index = self._get_or_create_index()
        
        logger.info(f"VectorStoreService initialized with index: {self.index_name}")
    
    def _get_or_create_index(self):
        """
        Get existing index or create a new one
        
        Returns:
            Pinecone index instance
        """
        try:
            # Check if index exists
            existing_indexes = [index.name for index in self.pc.list_indexes()]
            
            if self.index_name not in existing_indexes:
                logger.info(f"Creating new Pinecone index: {self.index_name}")
                
                # Determine dimension based on embedding model
                embedding_dim = int(os.getenv("EMBEDDING_DIMENSION", 1536))
                
                self.pc.create_index(
                    name=self.index_name,
                    dimension=embedding_dim,
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region="us-east-1"
                    )
                )
                
                # Wait for index to be ready
                logger.info("Waiting for index to be ready...")
                time.sleep(10)
            else:
                logger.info(f"Using existing Pinecone index: {self.index_name}")
            
            return self.pc.Index(self.index_name)
            
        except Exception as e:
            logger.error(f"Error getting/creating Pinecone index: {str(e)}")
            raise Exception(f"Failed to initialize Pinecone index: {str(e)}")
    
    def upsert_vectors(
        self,
        embeddings: List[List[float]],
        chunks: List[str],
        user_id: str,
        file_name: str,
        file_url: str
    ) -> int:
        """
        Upsert vectors to Pinecone with metadata
        
        Args:
            embeddings: List of embedding vectors
            chunks: List of text chunks
            user_id: User ID who uploaded the file
            file_name: Name of the uploaded file
            file_url: URL of the file in Supabase
            
        Returns:
            Number of vectors upserted
        """
        try:
            logger.info(f"Upserting {len(embeddings)} vectors to Pinecone...")
            
            # Prepare vectors for upsert
            vectors = []
            
            for idx, (embedding, chunk) in enumerate(zip(embeddings, chunks)):
                vector_id = f"{user_id}_{file_name}_{idx}_{int(time.time())}"
                
                metadata = {
                    "user_id": user_id,
                    "file_name": file_name,
                    "file_url": file_url,
                    "chunk_index": idx,
                    "chunk_text": chunk[:1000],  # Limit to 1000 chars for metadata
                    "total_chunks": len(chunks),
                    "timestamp": int(time.time())
                }
                
                vectors.append({
                    "id": vector_id,
                    "values": embedding,
                    "metadata": metadata
                })
            
            # Upsert in batches of 100
            batch_size = 100
            total_upserted = 0
            
            for i in range(0, len(vectors), batch_size):
                batch = vectors[i:i + batch_size]
                self.index.upsert(vectors=batch)
                total_upserted += len(batch)
                logger.info(f"Upserted batch {i // batch_size + 1}: {len(batch)} vectors")
            
            logger.info(f"Successfully upserted {total_upserted} vectors to Pinecone")
            
            return total_upserted
            
        except Exception as e:
            logger.error(f"Error upserting vectors to Pinecone: {str(e)}")
            raise Exception(f"Failed to upsert vectors: {str(e)}")
    
    def query_vectors(
        self,
        query_embedding: List[float],
        user_id: str,
        top_k: int = 5,
        filter_dict: Dict = None
    ) -> List[Dict]:
        """
        Query similar vectors from Pinecone
        
        Args:
            query_embedding: Query embedding vector
            user_id: User ID to filter results
            top_k: Number of top results to return
            filter_dict: Additional filters
            
        Returns:
            List of matching results with metadata
        """
        try:
            logger.info(f"Querying Pinecone for user: {user_id}")
            
            # Build filter
            query_filter = {"user_id": user_id}
            if filter_dict:
                query_filter.update(filter_dict)
            
            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                filter=query_filter,
                include_metadata=True
            )
            
            logger.info(f"Found {len(results.matches)} matches")
            
            return [
                {
                    "id": match.id,
                    "score": match.score,
                    "metadata": match.metadata
                }
                for match in results.matches
            ]
            
        except Exception as e:
            logger.error(f"Error querying Pinecone: {str(e)}")
            raise Exception(f"Failed to query vectors: {str(e)}")
    
    def delete_user_vectors(self, user_id: str, file_name: str = None):
        """
        Delete vectors for a user or specific file
        
        Args:
            user_id: User ID
            file_name: Optional file name to delete specific file's vectors
        """
        try:
            filter_dict = {"user_id": user_id}
            if file_name:
                filter_dict["file_name"] = file_name
            
            self.index.delete(filter=filter_dict)
            
            logger.info(f"Deleted vectors for user: {user_id}, file: {file_name}")
            
        except Exception as e:
            logger.error(f"Error deleting vectors: {str(e)}")
            raise Exception(f"Failed to delete vectors: {str(e)}")
    
    def get_index_stats(self) -> Dict:
        """
        Get statistics about the Pinecone index
        
        Returns:
            Dictionary with index statistics
        """
        try:
            stats = self.index.describe_index_stats()
            return {
                "total_vectors": stats.total_vector_count,
                "dimension": stats.dimension,
                "index_fullness": stats.index_fullness
            }
        except Exception as e:
            logger.error(f"Error getting index stats: {str(e)}")
            return {}

# Create singleton instance
vector_store = VectorStoreService()
