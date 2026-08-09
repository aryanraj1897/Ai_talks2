import logging
from typing import Dict, Any, List
from models.interview import TurnEvaluation
from feedback.scoring_engine import ScoringEngine, SixDimensionScore

logger = logging.getLogger(__name__)

class ResponseEvaluatorNode:
    """LangGraph Node integrating ScoringEngine for 6-dimension scoring (0-100)."""

    def __init__(self):
        self.scoring_engine = ScoringEngine()

    def evaluate(
        self,
        question_dict: Dict[str, Any],
        candidate_answer: str,
        previous_scores: List[SixDimensionScore] = []
    ) -> TurnEvaluation:
        question_text = question_dict.get("question", "")
        topic = question_dict.get("topic", "")
        
        # 1. Run 6-Dimension Scoring Engine
        score_res: SixDimensionScore = self.scoring_engine.evaluate_turn(
            question_text=question_text,
            topic=topic,
            candidate_answer=candidate_answer,
            previous_turn_scores=previous_scores
        )
        
        # 2. Determine if follow-up probe is needed based on scores
        is_followup = score_res.accuracy < 70.0 or score_res.depth < 65.0
        
        probe = None
        if is_followup:
            probe = f"Can you explain the architectural trade-offs or underlying implementation details for {topic}?"
            
        return TurnEvaluation(
            technical_accuracy=score_res.accuracy,
            communication_score=score_res.communication,
            depth_score=score_res.depth,
            confidence_score=score_res.confidence,
            engineering_thinking_score=score_res.engineering_thinking,
            system_design_score=score_res.system_design,
            composite_score=score_res.composite_turn_score,
            is_followup_needed=is_followup,
            feedback_snippet=score_res.feedback_snippet,
            suggested_probe=probe,
            suggested_adaptation=score_res.suggested_adaptation
        )
