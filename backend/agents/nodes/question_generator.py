import json
import logging
from typing import Dict, Any, List, Set
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from parsers.curriculum_parser import CurriculumParser
from rag.rag_engine import RAGEngine, StructuredRAGContext
from models.candidate import CandidateProfile
from models.interview import QuestionDetail
from config import settings

logger = logging.getLogger(__name__)

class QuestionGeneratorNode:
    """LangGraph Node for the Senior AI Engineering Interviewer Persona (Google / OpenAI / Anthropic caliber).
    
    Rules Enforced:
    - Studies curriculum.json before asking questions (retrieves top 5 RAG chunks).
    - Asks only from completed curriculum topics based on candidate background.
    - Never asks unrelated or duplicate questions.
    - Asks at least 8 technical questions covering at least 4 curriculum days.
    - Adapts difficulty: increases if answer is excellent, gives hints & reduces if weak.
    - Sounds natural, insightful, and conversational—never robotic.
    """
    
    def __init__(self, rag_engine: RAGEngine = None):
        self.rag = rag_engine or RAGEngine()
        self.llm = None
        if settings.OPENAI_API_KEY:
            try:
                self.llm = ChatOpenAI(
                    model=settings.OPENAI_MODEL,
                    api_key=settings.OPENAI_API_KEY,
                    temperature=0.6
                )
            except Exception as e:
                logger.warning(f"ChatOpenAI init fallback: {e}")

    def generate(
        self,
        candidate_dict: Dict[str, Any],
        turns: List[Dict[str, Any]],
        days_covered: List[int],
        is_followup: bool = False,
        probe_reason: str = ""
    ) -> QuestionDetail:
        cand_obj = CandidateProfile(**candidate_dict)
        turn_num = len(turns) + 1
        
        # Track asked topics and question strings to prevent duplicates
        asked_topics: Set[str] = set()
        asked_question_texts: Set[str] = set()
        for t in turns:
            q_info = t.get("question", {})
            if isinstance(q_info, dict):
                if q_info.get("topic"):
                    asked_topics.add(q_info.get("topic"))
                if q_info.get("question"):
                    asked_question_texts.add(q_info.get("question"))
        
        # 1. Select target day ensuring minimum 4 curriculum days constraint
        target_day = self._select_next_day(candidate_dict, days_covered, turn_num)
        day_obj = CurriculumParser.get_day(target_day)
        
        # 2. Retrieve TOP 5 ChromaDB RAG Context Chunks BEFORE EVERY question
        last_answer = turns[-1].get("candidate_answer", "") if turns else ""
        rag_context_struct: StructuredRAGContext = self.rag.retrieve_context_for_candidate(
            candidate=cand_obj,
            target_day=target_day,
            previous_answer=last_answer,
            top_k=5
        )
        
        rag_text = "\n---\n".join([chunk.get("content_chunk", "") for chunk in rag_context_struct.retrieved_chunks])
        
        # 3. LLM Senior AI Interviewer Persona (Google / OpenAI / Anthropic Caliber)
        if self.llm:
            try:
                sys_prompt = (
                    "You are a Senior Staff AI Engineering Lead conducting a top-tier technical interview (Google, OpenAI, or Anthropic caliber).\n"
                    "Your persona is natural, peer-to-peer, insightful, and sharp—NEVER sound robotic or like a generic chatbot.\n"
                    "STUDY THE CURRICULUM: Ground your question strictly in the retrieved RAG context chunks from completed topics.\n"
                    "RULES:\n"
                    "1. Never ask unrelated or duplicate questions.\n"
                    "2. Address the candidate naturally by name.\n"
                    "3. If the candidate's previous response was excellent, step up difficulty and ask high-concurrency/edge-case trade-off questions.\n"
                    "4. If the candidate struggled, provide helpful hints/scaffolding and step down difficulty.\n"
                    "Respond strictly in JSON format:\n"
                    "{\n"
                    '  "question": "...",\n'
                    '  "rationale": "..."\n'
                    "}"
                )
                user_prompt = (
                    f"Candidate Name: {cand_obj.name}\n"
                    f"Target Role: {cand_obj.target_role}\n"
                    f"Experience Level: {cand_obj.experience_level}\n"
                    f"Completed Missions: {cand_obj.completed_missions}\n"
                    f"Curriculum Day {day_obj.day}: {day_obj.title} ({rag_context_struct.difficulty})\n"
                    f"Learning Objectives: {', '.join(rag_context_struct.relevant_learning_objectives)}\n"
                    f"Relevant Tools: {', '.join(rag_context_struct.relevant_tools)}\n"
                    f"Relevant Concepts: {', '.join(rag_context_struct.relevant_concepts)}\n"
                    f"Previously Discussed Topics: {', '.join(list(asked_topics)) if asked_topics else 'None'}\n"
                    f"Is Adaptive Followup Probe: {is_followup}\n"
                    f"Probe Reason / Hint Guidance: {probe_reason}\n"
                    f"Top 5 ChromaDB RAG Context Chunks:\n{rag_text}\n"
                )
                res = self.llm.invoke([SystemMessage(content=sys_prompt), HumanMessage(content=user_prompt)])
                parsed = json.loads(res.content.strip("`json\n "))
                question_text = parsed.get("question")
                rationale_text = parsed.get("rationale")
            except Exception as e:
                logger.error(f"Senior Engineer LLM question generation fallback: {e}")
                question_text, rationale_text = self._fallback_question(day_obj, cand_obj, is_followup, probe_reason, asked_question_texts)
        else:
            question_text, rationale_text = self._fallback_question(day_obj, cand_obj, is_followup, probe_reason, asked_question_texts)
            
        q_id = f"q_{turn_num}"
        return QuestionDetail(
            question_id=q_id,
            day=day_obj.day,
            module=day_obj.module,
            topic=day_obj.title,
            question=question_text,
            rationale=rationale_text,
            difficulty=rag_context_struct.difficulty,
            is_followup=is_followup,
            rag_context=[chunk.get("content_chunk", "") for chunk in rag_context_struct.retrieved_chunks]
        )

    def _select_next_day(self, candidate_dict: Dict[str, Any], days_covered: List[int], turn_num: int) -> int:
        suggested = candidate_dict.get("suggested_focus_days", [1, 5, 11, 15, 19, 24])
        completed = candidate_dict.get("completed_missions", list(range(1, 32)))
        
        # Priority to completed mission days to ensure we ask only from completed topics
        valid_days = [d for d in suggested if d in completed] if completed else suggested
        if not valid_days:
            valid_days = completed if completed else list(range(1, 32))
            
        unvisited = [d for d in valid_days if d not in days_covered]
        if unvisited and len(set(days_covered)) < 4:
            return unvisited[0]
        elif unvisited:
            return unvisited[0]
            
        uncovered = [d for d in completed if d not in days_covered]
        if uncovered:
            return uncovered[0]
        return valid_days[turn_num % len(valid_days)]

    def _fallback_question(
        self,
        day_obj,
        cand_obj: CandidateProfile,
        is_followup: bool,
        probe_reason: str,
        asked_questions: Set[str]
    ):
        if is_followup and probe_reason:
            return (
                f"Following up on {day_obj.title}, {cand_obj.name}: {probe_reason} (Hint: Consider memory bandwidth and index partitioning). How would you implement this?",
                f"Google/OpenAI level adaptive probe with hint for Day {day_obj.day}."
            )
            
        q_candidates = day_obj.sample_questions or [f"Explain the architectural trade-offs in {day_obj.title}."]
        selected_q = q_candidates[0]
        for q in q_candidates:
            if q not in asked_questions:
                selected_q = q
                break
                
        return (
            f"Hey {cand_obj.name}, regarding Day {day_obj.day} ({day_obj.title}): {selected_q}",
            f"Google/OpenAI level Senior Engineer question tailored for {cand_obj.target_role} on Day {day_obj.day}."
        )
