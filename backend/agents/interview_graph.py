import uuid
import datetime
from typing import Dict, Any, Optional
from models.candidate import CandidateProfile
from models.interview import QuestionTurn, QuestionDetail, TurnEvaluation, InterviewProgress
from agents.nodes.question_generator import QuestionGeneratorNode
from agents.nodes.response_evaluator import ResponseEvaluatorNode
from agents.nodes.feedback_generator import FeedbackGeneratorNode
from memory.memory_agent import MemoryAgent
from config import settings

class InterviewGraphEngine:
    """LangGraph State Machine Engine for AI Technical Interviews.
    
    Integrates MemoryAgent for Redis persistence, 4-turn summarizations, 
    duplicate question filtering, and business constraints:
    - Min 8 questions constraint
    - Min 4 curriculum days constraint
    - Adaptive follow-up probes
    - Memory management across turns using Redis
    - Dynamic Feedback, Score & Hiring Recommendation
    """
    
    def __init__(self):
        self.question_gen = QuestionGeneratorNode()
        self.response_eval = ResponseEvaluatorNode()
        self.memory_agent = MemoryAgent()
        
    def start_interview(
        self,
        candidate: CandidateProfile,
        target_question_count: int = settings.MIN_QUESTIONS,
        min_curriculum_days: int = settings.MIN_CURRICULUM_DAYS
    ) -> Dict[str, Any]:
        session_id = f"sess_{uuid.uuid4().hex[:8]}"
        
        # Generate initial question
        first_question = self.question_gen.generate(
            candidate_dict=candidate.model_dump(),
            turns=[],
            days_covered=[],
            is_followup=False
        )
        
        state: Dict[str, Any] = {
            "session_id": session_id,
            "candidate": candidate.model_dump(),
            "target_question_count": max(target_question_count, settings.MIN_QUESTIONS),
            "min_curriculum_days": max(min_curriculum_days, settings.MIN_CURRICULUM_DAYS),
            "current_turn": 1,
            "turns": [],
            "days_covered": [first_question.day],
            "status": "in_progress",
            "current_question": first_question.model_dump(),
            "last_evaluation": None,
            "final_report": None,
            "memory_signals": {
                "previous_mistakes": [],
                "hints_given": [],
                "asked_questions": [first_question.question],
                "asked_topics": [first_question.topic]
            }
        }
        
        # Save initial memory to Redis
        self.memory_agent.update_memory(session_id, state)
        return state

    def process_turn(
        self,
        state: Dict[str, Any],
        candidate_answer: str
    ) -> Dict[str, Any]:
        session_id = state["session_id"]
        current_q_dict = state["current_question"]
        current_q = QuestionDetail(**current_q_dict)
        
        # 1. Response Evaluator Node
        evaluation: TurnEvaluation = self.response_eval.evaluate(
            question_dict=current_q_dict,
            candidate_answer=candidate_answer
        )
        
        # Record Turn
        turn_obj = QuestionTurn(
            turn_index=state["current_turn"],
            question=current_q,
            candidate_answer=candidate_answer,
            evaluation=evaluation,
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
        )
        state["turns"].append(turn_obj.model_dump())
        state["last_evaluation"] = evaluation.model_dump()
        
        # Update Days Covered set
        days_set = set(state["days_covered"])
        days_set.add(current_q.day)
        state["days_covered"] = sorted(list(days_set))
        
        # Update Session Memory in Redis (Triggers 4-turn summarization at turn 4, 8, 12...)
        state = self.memory_agent.update_memory(session_id, state)
        
        # 2. Check Termination & Business Constraints
        turns_count = len(state["turns"])
        unique_days_count = len(state["days_covered"])
        
        min_q_met = turns_count >= state["target_question_count"]
        min_days_met = unique_days_count >= state["min_curriculum_days"]
        
        # Determine if interview is complete
        is_complete = min_q_met and min_days_met
        
        if is_complete:
            state["status"] = "completed"
            state["current_question"] = None
            
            # Generate Final Report
            cand_obj = CandidateProfile(**state["candidate"])
            turns_objs = [QuestionTurn(**t) for t in state["turns"]]
            report = FeedbackGeneratorNode.generate(
                session_id=state["session_id"],
                candidate=cand_obj,
                turns=turns_objs
            )
            state["final_report"] = report.model_dump()
            self.memory_agent.update_memory(session_id, state)
        else:
            # 3. Question Generator Node (Adaptive next question or follow-up)
            needs_followup = evaluation.is_followup_needed and not current_q.is_followup
            
            # Generate question ensuring no duplicate text
            attempts_gen = 0
            next_q = None
            while attempts_gen < 3:
                next_q = self.question_gen.generate(
                    candidate_dict=state["candidate"],
                    turns=state["turns"],
                    days_covered=state["days_covered"],
                    is_followup=needs_followup,
                    probe_reason=evaluation.suggested_probe or ""
                )
                if not self.memory_agent.is_duplicate_question(session_id, next_q.question):
                    break
                attempts_gen += 1
                
            state["current_turn"] += 1
            state["current_question"] = next_q.model_dump()
            
            # Add day to days covered
            days_set.add(next_q.day)
            state["days_covered"] = sorted(list(days_set))
            
            # Final memory checkpoint update
            self.memory_agent.update_memory(session_id, state)
            
        return state
