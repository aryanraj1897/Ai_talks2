from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from models.candidate import CandidateProfile

class QuestionDetail(BaseModel):
    question_id: str
    day: int
    module: str
    topic: str
    question: str
    rationale: str
    difficulty: str = "Intermediate"
    is_followup: bool = False
    rag_context: List[str] = Field(default_factory=list)

class TurnEvaluation(BaseModel):
    technical_accuracy: float = 0.0
    communication_score: float = 0.0
    depth_score: float = 0.0
    confidence_score: float = 0.0
    engineering_thinking_score: float = 0.0
    system_design_score: float = 0.0
    composite_score: float = 0.0
    is_followup_needed: bool = False
    feedback_snippet: str = ""
    suggested_probe: Optional[str] = None
    suggested_adaptation: Optional[str] = None

class QuestionTurn(BaseModel):
    turn_index: int
    question: QuestionDetail
    candidate_answer: Optional[str] = None
    evaluation: Optional[TurnEvaluation] = None
    timestamp: str = ""

class InterviewProgress(BaseModel):
    total_questions_asked: int = 0
    days_covered: List[int] = Field(default_factory=list)
    days_count: int = 0
    min_questions_met: bool = False
    min_days_met: bool = False

class StartInterviewRequest(BaseModel):
    candidate_id: str
    target_question_count: int = 8
    min_curriculum_days: int = 4

class SubmitTurnRequest(BaseModel):
    session_id: str
    question_id: str
    candidate_answer: str

class StartInterviewResponse(BaseModel):
    session_id: str
    candidate: CandidateProfile
    status: str = "in_progress"
    current_turn: int = 1
    first_question: QuestionDetail

class SubmitTurnResponse(BaseModel):
    session_id: str
    turn_index: int
    evaluation: TurnEvaluation
    progress: InterviewProgress
    is_interview_complete: bool = False
    next_question: Optional[QuestionDetail] = None
