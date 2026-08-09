import pytest
from rag.rag_engine import RAGEngine
from parsers.candidate_parser import CandidateParser

def test_rag_retriever_top_k():
    rag = RAGEngine()
    cand = CandidateParser.get_candidate("cand_anshu_01")
    assert cand is not None
    
    ctx = rag.retrieve_context_for_candidate(
        candidate=cand,
        target_day=6,
        previous_answer="HNSW uses hierarchical graph layers.",
        top_k=5
    )
    
    assert ctx.target_day == 6
    assert ctx.difficulty is not None
    assert isinstance(ctx.relevant_learning_objectives, list)
    assert isinstance(ctx.retrieved_chunks, list)
    assert len(ctx.retrieved_chunks) > 0
