import os
from supabase import create_client, Client
from dotenv import load_dotenv
from utils.logger import logger

load_dotenv()

class SupabaseClient:
    """
    Supabase client wrapper for handling storage operations
    """
    
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        # Use service_role_key if available (bypasses RLS), otherwise use anon key
        self.key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
        
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY (or SUPABASE_SERVICE_ROLE_KEY) must be set in .env file")
        
        self.client: Client = create_client(self.url, self.key)
        
        # Log which key type is being used
        key_type = "service_role (bypasses RLS)" if os.getenv("SUPABASE_SERVICE_ROLE_KEY") else "anon"
        logger.info(f"Supabase client initialized successfully with {key_type} key")
    
    def download_file(self, file_url: str) -> bytes:
        """
        Download file from Supabase Storage
        
        Args:
            file_url: Public URL of the file in Supabase Storage
            
        Returns:
            File content as bytes
            
        Raises:
            Exception: If download fails
        """
        try:
            import httpx
            
            logger.info(f"Downloading file from: {file_url}")
            
            response = httpx.get(file_url, timeout=30.0)
            response.raise_for_status()
            
            file_content = response.content
            logger.info(f"File downloaded successfully. Size: {len(file_content)} bytes")
            
            return file_content
            
        except Exception as e:
            logger.error(f"Error downloading file: {str(e)}")
            raise Exception(f"Failed to download file: {str(e)}")
    
    def get_file_metadata(self, bucket: str, file_path: str) -> dict:
        """
        Get metadata for a file in Supabase Storage
        
        Args:
            bucket: Storage bucket name
            file_path: Path to file in bucket
            
        Returns:
            File metadata dictionary
        """
        try:
            response = self.client.storage.from_(bucket).list(file_path)
            return response[0] if response else {}
        except Exception as e:
            logger.error(f"Error getting file metadata: {str(e)}")
            return {}

# Create singleton instance
supabase_client = SupabaseClient()
