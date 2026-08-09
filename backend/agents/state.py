from typing import List, Dict, Any, Optional, TypedDict
from models.candidate import CandidateProfile
from models.interview import QuestionTurn, QuestionDetail
from models.feedback import FeedbackReport

class InterviewState(TypedDict):
    session_id: str
    candidate: CandidateProfile
    target_question_count: int
    min_curriculum_days: int
    current_turn: int
    turns: List[QuestionTurn]
    days_covered: List[int]
    status: str  # in_progress, completed
    current_question: Optional[QuestionDetail]
    last_evaluation: Optional[Dict[str, Any]]
    final_report: Optional[FeedbackReport]
