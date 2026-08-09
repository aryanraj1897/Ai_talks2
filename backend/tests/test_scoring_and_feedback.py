import pytest
from feedback.scoring_engine import ScoringEngine
from agents.nodes.feedback_generator import FeedbackGeneratorNode
from parsers.candidate_parser import CandidateParser

def test_scoring_engine_six_dimensions():
    engine = ScoringEngine()
    res = engine.evaluate_turn(
        question_text="How does HNSW construct hierarchical graph layers?",
        topic="Vector Indexing",
        candidate_answer="HNSW creates skip-list style graph structures where upper layers contain long-range links and lower layers contain fine-grained nearest neighbor connections."
    )
    
    assert 0.0 <= res.accuracy <= 100.0
    assert 0.0 <= res.communication <= 100.0
    assert 0.0 <= res.depth <= 100.0
    assert 0.0 <= res.confidence <= 100.0
    assert 0.0 <= res.engineering_thinking <= 100.0
    assert 0.0 <= res.system_design <= 100.0
    assert 0.0 <= res.composite_turn_score <= 100.0
    assert res.feedback_snippet != ""

def test_feedback_generator_structured_report():
    cand = CandidateParser.get_candidate("cand_anshu_01")
    report = FeedbackGeneratorNode.generate("sess_test_123", cand, [])
    
    assert report.session_id == "sess_test_123"
    assert report.overall_score > 0
    assert report.hiring_recommendation in ["Strong Hire", "Hire", "Weak Hire", "No Hire"]
    assert "radar_scores" in report.charts_data
