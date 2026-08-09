from typing import List, Dict, Any
from models.feedback import FeedbackReport, TopicScore
from models.candidate import CandidateProfile
from models.interview import QuestionTurn

class FeedbackEvaluator:
    """Computes structured interview feedback, scores (0-100), and hiring recommendations."""

    @staticmethod
    def generate_report(
        session_id: str,
        candidate: CandidateProfile,
        turns: List[QuestionTurn]
    ) -> FeedbackReport:
        if not turns:
            return FeedbackReport(
                session_id=session_id,
                candidate_id=candidate.id,
                candidate_name=candidate.name,
                target_role=candidate.target_role,
                total_questions_asked=0,
                curriculum_days_covered=[],
                overall_score=0.0,
                hiring_recommendation="No Hire",
                detailed_feedback="No interview turns recorded."
            )
            
        topic_scores: List[TopicScore] = []
        days_covered = set()
        total_accuracy = 0.0
        total_depth = 0.0
        total_comm = 0.0
        evaluated_count = 0
        
        for turn in turns:
            days_covered.add(turn.question.day)
            if turn.evaluation:
                eval_obj = turn.evaluation
                avg_turn_score = round(
                    (eval_obj.technical_accuracy * 0.5) +
                    (eval_obj.depth_score * 0.3) +
                    (eval_obj.communication_score * 0.2), 1
                )
                total_accuracy += eval_obj.technical_accuracy
                total_depth += eval_obj.depth_score
                total_comm += eval_obj.communication_score
                evaluated_count += 1
                
                topic_scores.append(TopicScore(
                    day=turn.question.day,
                    topic=turn.question.topic,
                    score=avg_turn_score,
                    summary=eval_obj.feedback_snippet
                ))
                
        if evaluated_count > 0:
            avg_acc = total_accuracy / evaluated_count
            avg_dep = total_depth / evaluated_count
            avg_com = total_comm / evaluated_count
            overall_score = round((avg_acc * 0.5) + (avg_dep * 0.3) + (avg_com * 0.2), 1)
        else:
            overall_score = 50.0
            avg_acc, avg_dep, avg_com = 50.0, 50.0, 50.0
            
        # Determine Hiring Recommendation based on overall score & threshold rules
        if overall_score >= 88.0:
            hiring_rec = "Strong Hire"
        elif overall_score >= 75.0:
            hiring_rec = "Hire"
        elif overall_score >= 60.0:
            hiring_rec = "Weak Hire"
        else:
            hiring_rec = "No Hire"
            
        # Extract Strengths & Areas for Growth dynamically from evaluations
        strengths = []
        growth_areas = []
        
        if avg_acc >= 85:
            strengths.append("High technical precision and deep accuracy across curriculum concepts.")
        else:
            growth_areas.append("Technical accuracy had occasional gaps in deep architectural details.")
            
        if avg_dep >= 80:
            strengths.append("Demonstrated solid understanding of trade-offs and underlying systems math.")
        else:
            growth_areas.append("Responses tended to stay high-level; benefits from deeper trade-off analysis.")
            
        if len(days_covered) >= 4:
            strengths.append(f"Successfully covered broad curriculum surface across {len(days_covered)} distinct technical days.")
        else:
            growth_areas.append("Interview covered narrow domain scope; recommend broader curriculum probing.")

        detailed = (
            f"{candidate.name} completed a technical interview for the {candidate.target_role} position. "
            f"Over {len(turns)} technical questions covering {len(days_covered)} curriculum days, "
            f"they achieved an overall score of {overall_score}/100. "
            f"Technical Accuracy: {round(avg_acc, 1)}%, Depth: {round(avg_dep, 1)}%, Communication: {round(avg_com, 1)}%. "
            f"Recommendation: {hiring_rec}."
        )

        return FeedbackReport(
            session_id=session_id,
            candidate_id=candidate.id,
            candidate_name=candidate.name,
            target_role=candidate.target_role,
            total_questions_asked=len(turns),
            curriculum_days_covered=sorted(list(days_covered)),
            overall_score=overall_score,
            hiring_recommendation=hiring_rec,
            topic_breakdown=topic_scores,
            strengths=strengths,
            areas_for_growth=growth_areas,
            detailed_feedback=detailed
        )
