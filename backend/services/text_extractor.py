import fitz  # PyMuPDF
import os
from io import BytesIO
from utils.logger import logger

class TextExtractor:
    """
    Service for extracting text from various document formats
    """
    
    def __init__(self):
        self.max_file_size_mb = int(os.getenv("MAX_FILE_SIZE_MB", 10))
        self.max_file_size_bytes = self.max_file_size_mb * 1024 * 1024
    
    def extract_from_pdf(self, file_content: bytes, file_name: str = "document.pdf") -> str:
        """
        Extract text from PDF file using PyMuPDF
        
        Args:
            file_content: PDF file content as bytes
            file_name: Name of the file (for logging)
            
        Returns:
            Extracted text as string
            
        Raises:
            Exception: If extraction fails or file is too large
        """
        try:
            # Check file size
            file_size = len(file_content)
            if file_size > self.max_file_size_bytes:
                raise Exception(
                    f"File size ({file_size / 1024 / 1024:.2f}MB) exceeds maximum allowed size ({self.max_file_size_mb}MB)"
                )
            
            logger.info(f"Extracting text from PDF: {file_name} ({file_size / 1024:.2f}KB)")
            
            # Open PDF from bytes
            pdf_document = fitz.open(stream=file_content, filetype="pdf")
            
            text_content = []
            total_pages = pdf_document.page_count
            
            logger.info(f"Processing {total_pages} pages...")
            
            for page_num in range(total_pages):
                page = pdf_document[page_num]
                text = page.get_text()
                
                if text.strip():
                    text_content.append(text)
                
                if (page_num + 1) % 10 == 0:
                    logger.info(f"Processed {page_num + 1}/{total_pages} pages")
            
            pdf_document.close()
            
            extracted_text = "\n\n".join(text_content)
            
            if not extracted_text.strip():
                raise Exception("No text could be extracted from the PDF")
            
            logger.info(f"Successfully extracted {len(extracted_text)} characters from {total_pages} pages")
            
            return extracted_text
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise Exception(f"Failed to extract text from PDF: {str(e)}")
    
    def extract_from_txt(self, file_content: bytes, file_name: str = "document.txt") -> str:
        """
        Extract text from TXT file
        
        Args:
            file_content: TXT file content as bytes
            file_name: Name of the file (for logging)
            
        Returns:
            Extracted text as string
        """
        try:
            # Check file size
            file_size = len(file_content)
            if file_size > self.max_file_size_bytes:
                raise Exception(
                    f"File size ({file_size / 1024 / 1024:.2f}MB) exceeds maximum allowed size ({self.max_file_size_mb}MB)"
                )
            
            logger.info(f"Extracting text from TXT: {file_name} ({file_size / 1024:.2f}KB)")
            
            # Try different encodings
            encodings = ['utf-8', 'latin-1', 'cp1252']
            
            for encoding in encodings:
                try:
                    text = file_content.decode(encoding)
                    logger.info(f"Successfully decoded with {encoding} encoding")
                    return text
                except UnicodeDecodeError:
                    continue
            
            raise Exception("Could not decode text file with any supported encoding")
            
        except Exception as e:
            logger.error(f"Error extracting text from TXT: {str(e)}")
            raise Exception(f"Failed to extract text from TXT: {str(e)}")
    
    def extract_text(self, file_content: bytes, file_name: str) -> str:
        """
        Extract text from file based on extension
        
        Args:
            file_content: File content as bytes
            file_name: Name of the file
            
        Returns:
            Extracted text as string
        """
        file_extension = file_name.lower().split('.')[-1]
        
        if file_extension == 'pdf':
            return self.extract_from_pdf(file_content, file_name)
        elif file_extension == 'txt':
            return self.extract_from_txt(file_content, file_name)
        else:
            raise Exception(f"Unsupported file type: {file_extension}. Only PDF and TXT files are supported.")

# Create singleton instance
text_extractor = TextExtractor()
