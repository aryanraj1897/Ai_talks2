import pytest
from memory.memory_agent import MemoryAgent
from memory.redis_memory import RedisMemory
from agents.nodes.followup_generator import FollowupGenerator
from agents.langgraph_workflow import build_interview_graph

def test_redis_memory_store():
    mem = RedisMemory()
    mem.set_session("sess_test_99", {"status": "testing", "candidate_id": "CAND-001"})
    retrieved = mem.get_session("sess_test_99")
    assert retrieved is not None
    assert retrieved["status"] == "testing"

def test_memory_agent_summarizer():
    agent = MemoryAgent()
    state = {
        "turns": [
            {
                "turn_index": 1,
                "question": {"day": 1, "topic": "Day 1 Topic", "question": "What is AI?", "difficulty": "Intermediate"},
                "candidate_answer": "Artificial intelligence is machine intelligence.",
                "evaluation": {"technical_accuracy": 80.0, "depth_score": 75.0}
            }
        ],
        "days_covered": [1]
    }
    updated = agent.update_memory("sess_test_99", state)
    assert "memory_signals" in updated
    assert not agent.is_duplicate_question("sess_test_99", "New Question Text")

def test_followup_generator():
    gen = FollowupGenerator()
    from models.interview import QuestionDetail, TurnEvaluation
    from models.candidate import CandidateProfile
    
    q = QuestionDetail(
        question_id="q1",
        day=6,
        module="Vector Search",
        topic="HNSW",
        question="What is HNSW?",
        rationale="Test"
    )
    eval_obj = TurnEvaluation(technical_accuracy=85.0, depth_score=80.0)
    cand = CandidateProfile(id="c1", name="Anshu", target_role="AI Engineer")
    
    followup = gen.generate_followup(q, "Sample answer", eval_obj, [], "Intermediate", cand)
    assert followup.followup_type is not None
    assert followup.question != ""

def test_langgraph_workflow_compilation():
    app = build_interview_graph()
    assert app is not None
    assert len(app.nodes) >= 6
