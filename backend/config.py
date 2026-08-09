import os
from dotenv import load_dotenv

# Load environment variables from .env file (root directory or backend directory)
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

try:
    from pydantic_settings import BaseSettings
except ImportError:
    BaseSettings = object

class Settings(BaseSettings):
    PROJECT_NAME: str = "ABTalks AI Technical Interview Agent"
    API_V1_STR: str = "/api/v1"
    
    # Absolute or relative data directory paths
    DATA_DIR: str = os.getenv("DATA_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data")))
    CURRICULUM_PATH: str = os.path.join(DATA_DIR, "curriculum.json")
    CANDIDATES_PATH: str = os.path.join(DATA_DIR, "candidates.json")
    TECHNICAL_SPECS_PATH: str = os.path.join(DATA_DIR, "technical-specs.md")
    
    # Vector DB (ChromaDB) Config
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "chroma_db_data")))
    CHROMA_COLLECTION_NAME: str = "abtalks_curriculum"
    
    # Redis Config
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    
    # LLM Settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o")
    LOG_LEVEL: str = "INFO"
    APP_NAME: str = "ABTalks AI Technical Interviewer"
    
    # Interview Rules & Constraints
    MIN_QUESTIONS: int = 8
    MIN_CURRICULUM_DAYS: int = 4

settings = Settings()
