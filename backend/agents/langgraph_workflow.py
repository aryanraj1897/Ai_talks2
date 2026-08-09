import logging
from typing import Dict, Any, List, TypedDict, Optional
from langgraph.graph import StateGraph, END
from parsers.curriculum_parser import CurriculumParser
from parsers.candidate_parser import CandidateParser
from parsers.spec_parser import SpecParser
from rag.rag_engine import RAGEngine
from agents.nodes.question_generator import QuestionGeneratorNode
from agents.nodes.response_evaluator import ResponseEvaluatorNode
from agents.nodes.feedback_generator import FeedbackGeneratorNode
from memory.memory_agent import MemoryAgent
from models.candidate import CandidateProfile
from models.interview import QuestionTurn, QuestionDetail, TurnEvaluation
from config import settings

logger = logging.getLogger(__name__)

class InterviewState(TypedDict):
    session_id: str
    candidate_id: str
    candidate: Dict[str, Any]
    curriculum_days: List[Dict[str, Any]]
    specs: Dict[str, Any]
    current_turn: int
    target_question_count: int
    min_curriculum_days: int
    turns: List[Dict[str, Any]]
    days_covered: List[int]
    current_question: Optional[Dict[str, Any]]
    last_answer: str
    last_evaluation: Optional[Dict[str, Any]]
    memory_summary: Optional[Dict[str, Any]]
    final_report: Optional[Dict[str, Any]]
    status: str  # initialized, interviewing, evaluating, completed

# ----------------------------------------------------
# 1. PARSER NODE
# ----------------------------------------------------
def parser_node(state: InterviewState) -> InterviewState:
    """Node 1: Dynamically parses curriculum, candidate, and spec datasets."""
    logger.info("LangGraph Node [Parser]: Parsing datasets...")
    cand_id = state.get("candidate_id", "cand_anshu_01")
    cand_profile = CandidateParser.get_candidate(cand_id)
    curriculum_days = CurriculumParser.parse_curriculum()
    spec = SpecParser.parse_specs()
    
    state["candidate"] = cand_profile.model_dump() if cand_profile else {}
    state["curriculum_days"] = [d.model_dump() for d in curriculum_days]
    state["specs"] = spec.model_dump()
    state["status"] = "parsed"
    return state

# ----------------------------------------------------
# 2. RETRIEVER NODE (RAG Top 5 Chunks)
# ----------------------------------------------------
def retriever_node(state: InterviewState) -> InterviewState:
    """Node 2: Queries ChromaDB vector store for top 5 curriculum chunks before generating questions."""
    logger.info("LangGraph Node [Retriever]: Performing ChromaDB vector retrieval (top_k=5)...")
    rag = RAGEngine()
    cand_obj = CandidateProfile(**state["candidate"])
    turns = state.get("turns", [])
    days_covered = state.get("days_covered", [])
    turn_num = len(turns) + 1
    
    # Select next day
    question_gen = QuestionGeneratorNode()
    target_day = question_gen._select_next_day(state["candidate"], days_covered, turn_num)
    
    last_ans = turns[-1].get("candidate_answer", "") if turns else ""
    rag_struct = rag.retrieve_context_for_candidate(
        candidate=cand_obj,
        target_day=target_day,
        previous_answer=last_ans,
        top_k=5
    )
    
    state["retrieved_rag_context"] = rag_struct.model_dump()
    return state

# ----------------------------------------------------
# 3. INTERVIEWER NODE (Senior Staff Persona Question Generator)
# ----------------------------------------------------
def interviewer_node(state: InterviewState) -> InterviewState:
    """Node 3: Generates Senior Software Engineering technical question grounded in RAG context."""
    logger.info("LangGraph Node [Interviewer]: Generating question...")
    question_gen = QuestionGeneratorNode()
    turns = state.get("turns", [])
    days_covered = state.get("days_covered", [])
    
    last_eval_dict = state.get("last_evaluation", {})
    needs_followup = False
    probe_reason = ""
    if last_eval_dict:
        eval_obj = TurnEvaluation(**last_eval_dict)
        needs_followup = eval_obj.is_followup_needed
        probe_reason = eval_obj.suggested_probe or ""
        
    next_q = question_gen.generate(
        candidate_dict=state["candidate"],
        turns=turns,
        days_covered=days_covered,
        is_followup=needs_followup,
        probe_reason=probe_reason
    )
    
    state["current_question"] = next_q.model_dump()
    state["current_turn"] = len(turns) + 1
    
    # Update days covered
    days_set = set(days_covered)
    days_set.add(next_q.day)
    state["days_covered"] = sorted(list(days_set))
    state["status"] = "interviewing"
    return state

# ----------------------------------------------------
# 4. SCORER NODE (6-Dimension 0-100 Evaluation)
# ----------------------------------------------------
def scorer_node(state: InterviewState) -> InterviewState:
    """Node 4: Evaluates candidate answer across 6 dimensions on a 0-100 scale."""
    logger.info("LangGraph Node [Scorer]: Scoring candidate response across 6 dimensions...")
    response_eval = ResponseEvaluatorNode()
    curr_q = state.get("current_question", {})
    last_ans = state.get("last_answer", "")
    
    evaluation = response_eval.evaluate(
        question_dict=curr_q,
        candidate_answer=last_ans
    )
    
    turn_index = state.get("current_turn", len(state.get("turns", [])) + 1)
    turn_obj = QuestionTurn(
        turn_index=turn_index,
        question=QuestionDetail(**curr_q),
        candidate_answer=last_ans,
        evaluation=evaluation
    )
    
    state["turns"].append(turn_obj.model_dump())
    state["last_evaluation"] = evaluation.model_dump()
    state["status"] = "scored"
    return state

# ----------------------------------------------------
# 5. MEMORY NODE (Redis Session & 4-Turn Summarizer)
# ----------------------------------------------------
def memory_node(state: InterviewState) -> InterviewState:
    """Node 5: Updates Redis session store, tracks candidate mistakes, and synthesizes 4-turn summaries."""
    logger.info("LangGraph Node [Memory]: Updating Redis session store & 4-turn summaries...")
    memory_agent = MemoryAgent()
    session_id = state.get("session_id", "sess_demo")
    
    updated_state = memory_agent.update_memory(session_id, dict(state))
    return updated_state

# ----------------------------------------------------
# 6. FEEDBACK NODE (Structured Report Generator)
# ----------------------------------------------------
def feedback_node(state: InterviewState) -> InterviewState:
    """Node 6: Generates finalized structured JSON feedback report with chart data."""
    logger.info("LangGraph Node [Feedback]: Synthesizing final structured JSON report...")
    session_id = state.get("session_id", "sess_demo")
    cand_obj = CandidateProfile(**state["candidate"])
    turns_objs = [QuestionTurn(**t) for t in state.get("turns", [])]
    
    report = FeedbackGeneratorNode.generate(session_id, cand_obj, turns_objs)
    state["final_report"] = report.model_dump()
    state["status"] = "completed"
    return state

# ----------------------------------------------------
# CONDITIONAL ROUTING EDGE: evaluate_next_step()
# ----------------------------------------------------
def evaluate_next_step(state: InterviewState) -> str:
    """Conditional Router: Determines whether to loop for next question turn or finalize feedback."""
    turns_count = len(state.get("turns", []))
    days_count = len(state.get("days_covered", []))
    target_q = state.get("target_question_count", settings.MIN_QUESTIONS)
    min_days = state.get("min_curriculum_days", settings.MIN_CURRICULUM_DAYS)
    
    min_q_met = turns_count >= target_q
    min_days_met = days_count >= min_days
    
    if min_q_met and min_days_met:
        logger.info(f"LangGraph Routing: Constraints satisfied ({turns_count} turns, {days_count} days). Routing to [Feedback Node].")
        return "feedback"
    else:
        logger.info(f"LangGraph Routing: Progress ({turns_count}/{target_q} turns, {days_count}/{min_days} days). Routing to [Retriever Node].")
        return "retriever"

# ----------------------------------------------------
# CONSTRUCT LANGGRAPH STATEGRAPH WORKFLOW
# ----------------------------------------------------
def build_interview_graph():
    """Constructs and compiles the full LangGraph StateGraph workflow."""
    workflow = StateGraph(InterviewState)
    
    # Add Nodes
    workflow.add_node("parser", parser_node)
    workflow.add_node("retriever", retriever_node)
    workflow.add_node("interviewer", interviewer_node)
    workflow.add_node("scorer", scorer_node)
    workflow.add_node("memory", memory_node)
    workflow.add_node("feedback", feedback_node)
    
    # Set Entry Point
    workflow.set_entry_point("parser")
    
    # Static Edges
    workflow.add_edge("parser", "retriever")
    workflow.add_edge("retriever", "interviewer")
    workflow.add_edge("interviewer", "scorer")
    workflow.add_edge("scorer", "memory")
    
    # Conditional Edge from Memory Node
    workflow.add_conditional_edges(
        "memory",
        evaluate_next_step,
        {
            "retriever": "retriever",
            "feedback": "feedback"
        }
    )
    
    # Terminal Edge from Feedback Node to END
    workflow.add_edge("feedback", END)
    
    app = workflow.compile()
    return app
