import os
from typing import List
from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings
from utils.logger import logger

load_dotenv()

class EmbeddingService:
    """
    Service for creating text embeddings using OpenAI or Mistral models
    """
    
    def __init__(self):
        self.chunk_size = int(os.getenv("CHUNK_SIZE", 1000))
        self.chunk_overlap = int(os.getenv("CHUNK_OVERLAP", 200))
        self.embedding_model_type = os.getenv("EMBEDDING_MODEL", "openai").lower()
        
        # Initialize text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        
        # Initialize embedding model
        self.embeddings = self._initialize_embeddings()
        
        logger.info(f"EmbeddingService initialized with {self.embedding_model_type} model")
    
    def _initialize_embeddings(self):
        """
        Initialize the embedding model based on configuration
        
        Returns:
            Embedding model instance
        """
        if self.embedding_model_type == "openai":
            openai_api_key = os.getenv("OPENAI_API_KEY")
            
            if not openai_api_key:
                logger.warning("OPENAI_API_KEY not found, falling back to Mistral embeddings")
                return self._initialize_mistral_embeddings()
            
            try:
                logger.info("Initializing OpenAI embeddings...")
                return OpenAIEmbeddings(
                    openai_api_key=openai_api_key,
                    model="text-embedding-ada-002"
                )
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI embeddings: {str(e)}")
                logger.info("Falling back to Mistral embeddings")
                return self._initialize_mistral_embeddings()
        else:
            return self._initialize_mistral_embeddings()
    
    def _initialize_mistral_embeddings(self):
        """
        Initialize Mistral embeddings using Hugging Face Sentence Transformers
        Uses all-mpnet-base-v2 for better quality (768 dimensions)
        
        Returns:
            HuggingFaceEmbeddings instance
        """
        logger.info("Initializing Mistral embeddings (all-mpnet-base-v2 - 768 dimensions)...")
        
        return HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-mpnet-base-v2",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
    
    def split_text(self, text: str) -> List[str]:
        """
        Split text into chunks
        
        Args:
            text: Input text to split
            
        Returns:
            List of text chunks
        """
        try:
            logger.info(f"Splitting text of length {len(text)} into chunks...")
            
            chunks = self.text_splitter.split_text(text)
            
            logger.info(f"Created {len(chunks)} chunks")
            
            return chunks
            
        except Exception as e:
            logger.error(f"Error splitting text: {str(e)}")
            raise Exception(f"Failed to split text: {str(e)}")
    
    def create_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Create embeddings for a list of texts
        
        Args:
            texts: List of text chunks
            
        Returns:
            List of embedding vectors
        """
        try:
            logger.info(f"Creating embeddings for {len(texts)} chunks...")
            
            embeddings = self.embeddings.embed_documents(texts)
            
            logger.info(f"Successfully created {len(embeddings)} embeddings")
            
            return embeddings
            
        except Exception as e:
            logger.error(f"Error creating embeddings: {str(e)}")
            raise Exception(f"Failed to create embeddings: {str(e)}")
    
    def get_embedding_dimension(self) -> int:
        """
        Get the dimension of embeddings based on model type
        
        Returns:
            Embedding dimension
        """
        if self.embedding_model_type == "openai":
            return 1536  # OpenAI ada-002 dimension
        else:
            return 768  # all-mpnet-base-v2 dimension

# Create singleton instance
embedding_service = EmbeddingService()
