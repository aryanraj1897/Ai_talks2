import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, Body, Path
from pydantic import BaseModel, Field
from models.interview import (
    StartInterviewRequest,
    StartInterviewResponse,
    SubmitTurnRequest,
    SubmitTurnResponse,
    QuestionDetail,
    TurnEvaluation,
    InterviewProgress,
)
from models.feedback import FeedbackReport
from models.candidate import CandidateProfile
from agents.interview_graph import InterviewGraphEngine
from memory.redis_memory import RedisMemory
from parsers.candidate_parser import CandidateParser
from config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/interview", tags=["Interview Session Agent"])

engine = InterviewGraphEngine()
redis_memory = RedisMemory()

class NextQuestionRequest(BaseModel):
    session_id: str

class NextQuestionResponse(BaseModel):
    session_id: str
    current_turn: int
    question: QuestionDetail

class SubmitAnswerRequest(BaseModel):
    session_id: str
    question_id: str
    candidate_answer: str

@router.post("/start", response_model=StartInterviewResponse, status_code=status.HTTP_201_CREATED)
async def start_interview(request: StartInterviewRequest):
    """POST /api/v1/interview/start
    Starts a new adaptive AI technical interview session.
    Retrieves candidate background, generates initial RAG-grounded question, and persists session.
    """
    logger.info(f"Starting interview session for candidate_id: {request.candidate_id}")
    try:
        cand_profile = CandidateParser.get_candidate(request.candidate_id)
        if not cand_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Candidate with ID '{request.candidate_id}' not found."
            )
            
        state = engine.start_interview(
            candidate=cand_profile,
            target_question_count=request.target_question_count,
            min_curriculum_days=request.min_curriculum_days
        )
        
        return StartInterviewResponse(
            session_id=state["session_id"],
            candidate=cand_profile,
            status=state["status"],
            current_turn=state["current_turn"],
            first_question=QuestionDetail(**state["current_question"])
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting interview: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start interview session: {str(e)}"
        )

@router.post("/next-question", response_model=NextQuestionResponse, status_code=status.HTTP_200_OK)
async def get_next_question(request: NextQuestionRequest):
    """POST /api/v1/interview/next-question
    Retrieves active or next question turn for the interview session.
    """
    logger.info(f"Fetching next question for session: {request.session_id}")
    session_state = redis_memory.get_session(request.session_id)
    if not session_state:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interview session '{request.session_id}' not found."
        )
        
    curr_q = session_state.get("current_question")
    if not curr_q:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session has no active question (interview may be completed)."
        )
        
    return NextQuestionResponse(
        session_id=request.session_id,
        current_turn=session_state.get("current_turn", 1),
        question=QuestionDetail(**curr_q)
    )

@router.post("/submit-turn", response_model=SubmitTurnResponse, status_code=status.HTTP_200_OK)
@router.post("/submit-answer", response_model=SubmitTurnResponse, status_code=status.HTTP_200_OK)
async def submit_turn(request: SubmitTurnRequest):
    """POST /api/v1/interview/submit-turn & POST /api/v1/interview/submit-answer
    Submits candidate technical answer, evaluates response across 6 dimensions,
    updates Redis memory, checks 8+ questions & 4+ days constraints, and returns evaluation or completion report.
    """
    logger.info(f"Submitting turn answer for session: {request.session_id}")
    session_state = redis_memory.get_session(request.session_id)
    if not session_state:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{request.session_id}' not found."
        )
        
    if session_state.get("status") == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview session is already completed."
        )
        
    try:
        updated_state = engine.process_turn(
            state=session_state,
            candidate_answer=request.candidate_answer
        )
        
        last_eval_dict = updated_state.get("last_evaluation", {})
        evaluation = TurnEvaluation(**last_eval_dict) if last_eval_dict else TurnEvaluation()
        
        turns_count = len(updated_state.get("turns", []))
        days_covered = updated_state.get("days_covered", [])
        
        progress = InterviewProgress(
            total_questions_asked=turns_count,
            days_covered=days_covered,
            days_count=len(days_covered),
            min_questions_met=turns_count >= settings.MIN_QUESTIONS,
            min_days_met=len(days_covered) >= settings.MIN_CURRICULUM_DAYS
        )
        
        is_complete = updated_state.get("status") == "completed"
        next_q = None
        if not is_complete and updated_state.get("current_question"):
            next_q = QuestionDetail(**updated_state["current_question"])
            
        return SubmitTurnResponse(
            session_id=request.session_id,
            turn_index=turns_count,
            evaluation=evaluation,
            progress=progress,
            is_interview_complete=is_complete,
            next_question=next_q
        )
    except Exception as e:
        logger.error(f"Error submitting turn: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit answer turn: {str(e)}"
        )

@router.get("/{session_id}/feedback", response_model=FeedbackReport, status_code=status.HTTP_200_OK)
async def get_session_feedback(session_id: str = Path(..., description="Interview Session ID")):
    """GET /api/v1/interview/{session_id}/feedback
    Retrieves current or final feedback report for the interview session.
    """
    logger.info(f"Fetching feedback report for session: {session_id}")
    session_state = redis_memory.get_session(session_id)
    if not session_state:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interview session '{session_id}' not found."
        )
        
    final_rep = session_state.get("final_report")
    if final_rep:
        return FeedbackReport(**final_rep)
        
    # Generate current intermediate report if in-progress
    cand_obj = CandidateProfile(**session_state["candidate"])
    turns_objs = [QuestionTurn(**t) for t in session_state.get("turns", [])]
    from agents.nodes.feedback_generator import FeedbackGeneratorNode
    report = FeedbackGeneratorNode.generate(session_id, cand_obj, turns_objs)
    return report

@router.post("/{session_id}/end", response_model=FeedbackReport, status_code=status.HTTP_200_OK)
@router.post("/{session_id}/complete", response_model=FeedbackReport, status_code=status.HTTP_200_OK)
async def end_interview(session_id: str = Path(..., description="Interview Session ID")):
    """POST /api/v1/interview/{session_id}/end & POST /api/v1/interview/{session_id}/complete
    Ends the interview session immediately and returns structured feedback report.
    """
    logger.info(f"Ending interview session: {session_id}")
    session_state = redis_memory.get_session(session_id)
    if not session_state:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )
        
    try:
        cand_obj = CandidateProfile(**session_state["candidate"])
        turns_objs = [QuestionTurn(**t) for t in session_state.get("turns", [])]
        from agents.nodes.feedback_generator import FeedbackGeneratorNode
        report = FeedbackGeneratorNode.generate(session_id, cand_obj, turns_objs)
        
        session_state["status"] = "completed"
        session_state["final_report"] = report.model_dump()
        redis_memory.set_session(session_id, session_state)
        
        return report
    except Exception as e:
        logger.error(f"Error ending interview: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to end interview session: {str(e)}"
        )
