import json
import logging
from typing import Dict, Any, List, Optional, Set
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field
from memory.redis_memory import RedisMemory
from models.interview import QuestionTurn
from config import settings

logger = logging.getLogger(__name__)

class MemorySummary(BaseModel):
    summary_index: int
    turns_covered: int
    key_strengths_observed: List[str] = Field(default_factory=list)
    previous_mistakes: List[str] = Field(default_factory=list)
    hints_and_probes_given: List[str] = Field(default_factory=list)
    current_difficulty_level: str = "Intermediate"
    last_topic: str = ""
    condensed_memory_text: str = ""

class MemoryAgent:
    """Dedicated Memory Agent utilizing Redis session store.
    
    Responsibilities:
    - Maintains candidate answers, previous mistakes, hints given, difficulty, active topic, and progress.
    - Summarizes memory every four turns (turns 4, 8, 12...).
    - Prevents duplicate questions by tracking asked questions history.
    """
    
    def __init__(self, redis_memory: Optional[RedisMemory] = None):
        self.redis_store = redis_memory or RedisMemory()
        self.llm = None
        if settings.OPENAI_API_KEY:
            try:
                self.llm = ChatOpenAI(
                    model=settings.OPENAI_MODEL,
                    api_key=settings.OPENAI_API_KEY,
                    temperature=0.3
                )
            except Exception as e:
                logger.warning(f"MemoryAgent LLM init fallback: {e}")

    def update_memory(
        self,
        session_id: str,
        current_state: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Updates session memory in Redis and checks if 4-turn summarization is needed."""
        turns = current_state.get("turns", [])
        turn_count = len(turns)
        
        # 1. Extract memory tracking signals
        mistakes = []
        hints_given = []
        asked_questions = set()
        asked_topics = set()
        
        for t in turns:
            q_dict = t.get("question", {})
            eval_dict = t.get("evaluation", {})
            
            if isinstance(q_dict, dict):
                if q_dict.get("question"):
                    asked_questions.add(q_dict.get("question"))
                if q_dict.get("topic"):
                    asked_topics.add(q_dict.get("topic"))
                    
            if isinstance(eval_dict, dict):
                # Identify mistakes (technical accuracy < 70% or depth < 65%)
                acc = eval_dict.get("technical_accuracy", 100)
                dep = eval_dict.get("depth_score", 100)
                snippet = eval_dict.get("feedback_snippet", "")
                
                if acc < 70 or dep < 65:
                    mistakes.append(f"Day {q_dict.get('day')}: {snippet}")
                    
                if eval_dict.get("suggested_probe"):
                    hints_given.append(eval_dict.get("suggested_probe"))
                    
        current_state["memory_signals"] = {
            "previous_mistakes": mistakes,
            "hints_given": hints_given,
            "asked_questions": list(asked_questions),
            "asked_topics": list(asked_topics),
            "total_turns": turn_count,
            "days_covered_count": len(current_state.get("days_covered", []))
        }
        
        # 2. Summarize memory every four turns (turns 4, 8, 12...)
        if turn_count > 0 and turn_count % 4 == 0:
            summary = self._summarize_memory_every_four_turns(session_id, current_state, turn_count)
            current_state["latest_memory_summary"] = summary.model_dump()
            
        # 3. Persist updated session state to Redis / Memory
        self.redis_store.set_session(session_id, current_state)
        return current_state

    def is_duplicate_question(self, session_id: str, question_text: str) -> bool:
        """Prevents duplicate questions using stored session memory."""
        session_state = self.redis_store.get_session(session_id)
        if not session_state:
            return False
            
        asked = session_state.get("memory_signals", {}).get("asked_questions", [])
        return question_text in asked

    def _summarize_memory_every_four_turns(
        self,
        session_id: str,
        state: Dict[str, Any],
        turn_count: int
    ) -> MemorySummary:
        turns = state.get("turns", [])
        cand_name = state.get("candidate", {}).get("name", "Candidate")
        
        recent_turns = turns[-4:]
        mistakes = state.get("memory_signals", {}).get("previous_mistakes", [])
        hints = state.get("memory_signals", {}).get("hints_given", [])
        
        if self.llm:
            try:
                sys_prompt = (
                    "You are a Memory Agent for an AI Technical Interviewer.\n"
                    "Synthesize a concise, 4-turn interview memory summary.\n"
                    "Respond strictly in JSON format:\n"
                    "{\n"
                    '  "key_strengths_observed": ["..."],\n'
                    '  "previous_mistakes": ["..."],\n'
                    '  "hints_and_probes_given": ["..."],\n'
                    '  "condensed_memory_text": "..."\n'
                    "}"
                )
                user_prompt = (
                    f"Candidate Name: {cand_name}\n"
                    f"Turn Count: {turn_count}\n"
                    f"Recent 4 Turns: {json.dumps(recent_turns)}\n"
                    f"Identified Mistakes: {mistakes}\n"
                    f"Hints Given: {hints}\n"
                )
                res = self.llm.invoke([SystemMessage(content=sys_prompt), HumanMessage(content=user_prompt)])
                parsed = json.loads(res.content.strip("`json\n "))
                
                return MemorySummary(
                    summary_index=turn_count // 4,
                    turns_covered=turn_count,
                    key_strengths_observed=parsed.get("key_strengths_observed", []),
                    previous_mistakes=parsed.get("previous_mistakes", mistakes),
                    hints_and_probes_given=parsed.get("hints_and_probes_given", hints),
                    current_difficulty_level=recent_turns[-1].get("question", {}).get("difficulty", "Intermediate"),
                    last_topic=recent_turns[-1].get("question", {}).get("topic", ""),
                    condensed_memory_text=parsed.get("condensed_memory_text", f"Memory checkpoint at turn {turn_count}.")
                )
            except Exception as e:
                logger.error(f"Memory summarization fallback: {e}")
                
        # Structured Fallback Summarizer
        last_turn = recent_turns[-1] if recent_turns else {}
        last_q = last_turn.get("question", {})
        
        return MemorySummary(
            summary_index=turn_count // 4,
            turns_covered=turn_count,
            key_strengths_observed=[f"Demonstrated solid concepts in Day {last_q.get('day')}"],
            previous_mistakes=mistakes,
            hints_and_probes_given=hints,
            current_difficulty_level=last_q.get("difficulty", "Intermediate"),
            last_topic=last_q.get("topic", ""),
            condensed_memory_text=f"{cand_name} completed turn {turn_count} covering Day {last_q.get('day')} ({last_q.get('topic')}). Recorded {len(mistakes)} mistakes and {len(hints)} hints."
        )
