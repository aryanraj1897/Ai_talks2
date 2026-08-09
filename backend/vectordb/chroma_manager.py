import os
import logging
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from config import settings

logger = logging.getLogger(__name__)

class ChromaManager:
    """ChromaDB Vector Store Manager providing persistent storage, collection management,
    document embeddings, metadata indexing, similarity search, and dynamic document updates.
    """
    
    COLLECTION_NAME = "abtalks_curriculum"
    
    def __init__(self, persist_dir: Optional[str] = None):
        self.persist_dir = persist_dir or settings.CHROMA_PERSIST_DIR
        os.makedirs(self.persist_dir, exist_ok=True)
        
        logger.info(f"Initializing ChromaDB PersistentClient at: {self.persist_dir}")
        self.client = chromadb.PersistentClient(
            path=self.persist_dir,
            settings=ChromaSettings(allow_reset=True, anonymized_telemetry=False)
        )
        
        # Get or Create persistent curriculum collection using Cosine Similarity
        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine", "description": "ABTalks 31-Day Enterprise AI Curriculum Embeddings"}
        )

    def add_documents(
        self,
        documents: List[str],
        metadatas: List[Dict[str, Any]],
        ids: List[str]
    ) -> bool:
        """Upserts documents into the ChromaDB curriculum collection."""
        if not documents or not ids:
            logger.warning("No documents or IDs provided for ChromaDB indexing.")
            return False
            
        try:
            logger.info(f"Upserting {len(documents)} curriculum documents into ChromaDB...")
            self.collection.upsert(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            logger.info(f"Successfully indexed {len(documents)} documents into ChromaDB.")
            return True
        except Exception as e:
            logger.error(f"Error upserting documents into ChromaDB: {e}", exc_info=True)
            return False

    def search_curriculum(
        self,
        query: str,
        top_k: int = 5,
        where_filter: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Performs vector HNSW similarity search returning top_k most relevant chunks."""
        if self.collection.count() == 0:
            logger.warning("ChromaDB curriculum collection is empty.")
            return []
            
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=min(top_k, self.collection.count()),
                where=where_filter
            )
            
            output_hits = []
            if results and results.get("documents") and len(results["documents"]) > 0:
                docs = results["documents"][0]
                metas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(docs)
                ids = results["ids"][0] if results.get("ids") else [""] * len(docs)
                distances = results["distances"][0] if results.get("distances") else [0.0] * len(docs)
                
                for i in range(len(docs)):
                    dist = distances[i]
                    sim_score = max(0.0, round(1.0 - dist, 4))
                    meta = metas[i] if i < len(metas) else {}
                    
                    output_hits.append({
                        "id": ids[i],
                        "day": meta.get("day", 1),
                        "module": meta.get("module", ""),
                        "title": meta.get("title", ""),
                        "difficulty": meta.get("difficulty", "Intermediate"),
                        "tools": meta.get("tools", ""),
                        "content_chunk": docs[i],
                        "similarity_score": sim_score,
                        "distance": dist,
                        "metadata": meta
                    })
                    
            logger.info(f"ChromaDB search for query '{query[:40]}...' returned {len(output_hits)} hits.")
            return output_hits
        except Exception as e:
            logger.error(f"Error querying ChromaDB vector store: {e}", exc_info=True)
            return []

    def get_collection_count(self) -> int:
        """Returns total count of persistent vector embeddings."""
        return self.collection.count()

    def get_stats(self) -> Dict[str, Any]:
        """Returns statistics for ChromaDB healthcheck."""
        return {
            "collection_name": self.COLLECTION_NAME,
            "embeddings_count": self.collection.count(),
            "persist_dir": self.persist_dir
        }

    def reset_collection(self) -> bool:
        """Resets curriculum collection for clean re-indexing."""
        try:
            self.client.delete_collection(self.COLLECTION_NAME)
            self.collection = self.client.get_or_create_collection(
                name=self.COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"}
            )
            logger.info("ChromaDB collection reset successfully.")
            return True
        except Exception as e:
            logger.error(f"Error resetting ChromaDB collection: {e}")
            return False
