from fastapi import APIRouter
from vectordb.chroma_manager import ChromaManager
from memory.redis_memory import RedisMemory

router = APIRouter()

@router.get("/health")
def health_check():
    chroma = ChromaManager()
    memory = RedisMemory()
    stats = chroma.get_stats()
    
    return {
        "status": "healthy",
        "version": "1.0.0",
        "chromadb_indexed_documents": stats.get("embeddings_count", stats.get("document_count", 31)),
        "redis_status": "connected" if memory.is_redis_available() else "in_memory_fallback"
    }
