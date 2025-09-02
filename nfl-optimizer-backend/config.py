import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Simple configuration class for environment variables"""
    
    @staticmethod
    def get(key: str, default=None, required=False):
        """Get environment variable with optional default and required check"""
        value = os.getenv(key, default)
        if required and value is None:
            raise ValueError(f"Required environment variable '{key}' not found")
        return value