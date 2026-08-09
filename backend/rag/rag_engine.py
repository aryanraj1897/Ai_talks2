from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from vectordb.chroma_manager import ChromaManager
from parsers.curriculum_parser import CurriculumParser
from models.candidate import CandidateProfile

class StructuredRAGContext(BaseModel):
    """Structured RAG Context output containing relevant learning objectives, tools, concepts, 
    difficulty, and the top 5 retrieved vector chunks from ChromaDB.
    """
    target_day: int
    topic_title: str
    difficulty: str
    relevant_learning_objectives: List[str] = Field(default_factory=list)
    relevant_tools: List[str] = Field(default_factory=list)
    relevant_concepts: List[str] = Field(default_factory=list)
    retrieved_chunks: List[Dict[str, Any]] = Field(default_factory=list)

class RAGEngine:
    """RAG Retrieval Engine for ChromaDB coupling Curriculum Embeddings & Candidate Signals.
    Retrieves top 5 most relevant chunks before every interview question.
    """
    
    def __init__(self, chroma_manager: Optional[ChromaManager] = None):
        self.chroma = chroma_manager or ChromaManager()
        
    def retrieve_context_for_candidate(
        self,
        candidate: CandidateProfile,
        target_day: int,
        previous_answer: str = "",
        top_k: int = 5
    ) -> StructuredRAGContext:
        """Retrieves top 5 most relevant ChromaDB chunks before every interview question
        based on Curriculum and Candidate inputs.
        """
        # 1. Fetch exact curriculum day object
        day_info = CurriculumParser.get_day(target_day)
        
        # 2. Build multi-signal query coupling Curriculum & Candidate background
        candidate_signals = (
            f"Candidate Role: {candidate.target_role}. "
            f"Experience: {candidate.experience_level}. "
            f"Strongest Domains: {', '.join(candidate.learning_signals.strongest_domains)}. "
            f"Weakest Domains: {', '.join(candidate.learning_signals.weakest_domains)}. "
            f"Previous Answer: {previous_answer[:200]}"
        )
        
        search_query = (
            f"Module: {day_info.module}. Topic: {day_info.title}. "
            f"Summary: {day_info.summary}. Key Concepts: {', '.join(day_info.key_concepts)}. "
            f"{candidate_signals}"
        )
        
        # 3. Perform vector similarity search in ChromaDB for TOP 5 chunks
        rag_hits = self.chroma.search_curriculum(query=search_query, top_k=top_k)
        
        # 4. Fallback if vector index has not been seeded yet
        if not rag_hits:
            rag_hits = [{
                "id": f"day_{day_info.day}",
                "day": day_info.day,
                "title": day_info.title,
                "module": day_info.module,
                "content_chunk": f"Day {day_info.day}: {day_info.title}. {day_info.summary}",
                "similarity_score": 1.0
            }]
            
        # 5. Extract structured outputs: Learning Objectives, Tools, Concepts, Difficulty
        return StructuredRAGContext(
            target_day=day_info.day,
            topic_title=day_info.title,
            difficulty=day_info.difficulty,
            relevant_learning_objectives=day_info.learning_objectives,
            relevant_tools=day_info.tools,
            relevant_concepts=day_info.key_concepts,
            retrieved_chunks=rag_hits
        )
