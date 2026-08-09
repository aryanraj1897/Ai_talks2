from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from vectordb.chroma_manager import ChromaManager

router = APIRouter()
chroma = ChromaManager()

class RAGSearchRequest(BaseModel):
    query: str
    top_k: int = 3
    filter_day: Optional[int] = None

@router.post("/rag/ingest")
def ingest_curriculum():
    """Forces re-indexing of curriculum.json into ChromaDB vector store."""
    try:
        count = chroma.index_curriculum()
        return {
            "message": "Curriculum successfully indexed into ChromaDB",
            "collection": chroma.collection_name,
            "indexed_count": count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rag/search")
def search_rag(req: RAGSearchRequest):
    """Performs vector similarity search over curriculum collection."""
    try:
        results = chroma.search_curriculum(
            query=req.query,
            top_k=req.top_k,
            filter_day=req.filter_day
        )
        return {
            "query": req.query,
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rag/stats")
def rag_stats():
    return chroma.get_stats()
