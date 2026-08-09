import json
import logging
from typing import Dict, Any, List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field
from models.candidate import CandidateProfile
from models.interview import QuestionDetail, TurnEvaluation
from config import settings

logger = logging.getLogger(__name__)

class AdaptiveFollowup(BaseModel):
    followup_type: str  # Clarification, Why Question, Edge Case, Scenario Question, Comparison Question
    adjusted_difficulty: str  # Beginner, Intermediate, Advanced
    question: str
    rationale: str

class FollowupGenerator:
    """Intelligent Follow-up Question Generator & Adaptive Difficulty Engine.
    
    Generates 5 specialized follow-up archetypes:
    1. Clarification (vague terms)
    2. Why Questions (underlying architectural/math motivations)
    3. Edge Cases (out-of-memory, latency, prompt injection)
    4. Scenario Questions (100x traffic surge, server outages)
    5. Comparison Questions (HNSW vs IVF, Bi-Encoders vs Cross-Encoders, etc.)
    
    Adjusts difficulty dynamically:
    - Increases difficulty if candidate answers correctly (Accuracy >= 88% & Depth >= 85%).
    - Reduces difficulty if candidate is struggling (Accuracy < 65%).
    """
    
    def __init__(self):
        self.llm = None
        if settings.OPENAI_API_KEY:
            try:
                self.llm = ChatOpenAI(
                    model=settings.OPENAI_MODEL,
                    api_key=settings.OPENAI_API_KEY,
                    temperature=0.6
                )
            except Exception as e:
                logger.warning(f"FollowupGenerator LLM init fallback: {e}")

    def adjust_difficulty(
        self,
        current_difficulty: str,
        evaluation: TurnEvaluation
    ) -> str:
        """Increases difficulty if candidate answers correctly, reduces if struggling."""
        acc = evaluation.technical_accuracy
        dep = evaluation.depth_score
        
        diff_levels = ["Beginner", "Intermediate", "Advanced"]
        current_idx = diff_levels.index(current_difficulty) if current_difficulty in diff_levels else 1
        
        if acc >= 88.0 and dep >= 85.0:
            # Increase difficulty
            new_idx = min(len(diff_levels) - 1, current_idx + 1)
            return diff_levels[new_idx]
        elif acc < 65.0 or dep < 60.0:
            # Reduce difficulty
            new_idx = max(0, current_idx - 1)
            return diff_levels[new_idx]
            
        return current_difficulty

    def generate_followup(
        self,
        question: QuestionDetail,
        candidate_answer: str,
        evaluation: TurnEvaluation,
        conversation_history: List[Dict[str, Any]],
        current_difficulty: str,
        candidate: CandidateProfile
    ) -> AdaptiveFollowup:
        # 1. Adjust difficulty based on accuracy & depth performance
        next_difficulty = self.adjust_difficulty(current_difficulty, evaluation)
        
        # 2. Select Follow-up Archetype based on answer analysis
        followup_type = self._determine_archetype(evaluation, candidate_answer)
        
        # 3. Generate Follow-up Question via LLM or Structured Rule Engine
        if self.llm:
            try:
                sys_prompt = (
                    "You are a Senior Staff AI Engineer conducting a technical interview.\n"
                    "Generate an intelligent, highly specific technical follow-up question.\n"
                    f"Selected Followup Archetype: {followup_type}\n"
                    f"Target Difficulty Level: {next_difficulty}\n"
                    "Respond strictly in JSON format:\n"
                    "{\n"
                    '  "followup_type": "...",\n'
                    '  "adjusted_difficulty": "...",\n'
                    '  "question": "...",\n'
                    '  "rationale": "..."\n'
                    "}"
                )
                user_prompt = (
                    f"Candidate Name: {candidate.name}\n"
                    f"Target Role: {candidate.target_role}\n"
                    f"Original Question: {question.question}\n"
                    f"Topic: {question.topic}\n"
                    f"Candidate Answer: {candidate_answer}\n"
                    f"Evaluation Accuracy: {evaluation.technical_accuracy}%, Depth: {evaluation.depth_score}%\n"
                    f"Conversation Turns: {len(conversation_history)}\n"
                )
                res = self.llm.invoke([SystemMessage(content=sys_prompt), HumanMessage(content=user_prompt)])
                parsed = json.loads(res.content.strip("`json\n "))
                return AdaptiveFollowup(**parsed)
            except Exception as e:
                logger.error(f"FollowupGenerator LLM fallback: {e}")
                
        # Structured Fallback Archetype Generator
        fallback_q, fallback_rat = self._fallback_archetype_question(
            followup_type, question, candidate_answer, candidate, next_difficulty
        )
        return AdaptiveFollowup(
            followup_type=followup_type,
            adjusted_difficulty=next_difficulty,
            question=fallback_q,
            rationale=fallback_rat
        )

    def _determine_archetype(self, evaluation: TurnEvaluation, answer: str) -> str:
        word_count = len(answer.split())
        acc = evaluation.technical_accuracy
        dep = evaluation.depth_score
        
        if word_count < 18 or evaluation.is_followup_needed:
            return "Clarification"
        elif acc >= 88 and dep >= 85:
            return "Edge Cases"
        elif dep < 75:
            return "Why Questions"
        elif "vs" in answer.lower() or "compare" in answer.lower():
            return "Comparison Questions"
        else:
            return "Scenario Questions"

    def _fallback_archetype_question(
        self,
        archetype: str,
        question: QuestionDetail,
        answer: str,
        candidate: CandidateProfile,
        difficulty: str
    ):
        name = candidate.name
        topic = question.topic
        
        if archetype == "Clarification":
            return (
                f"Thanks {name}. Could you clarify what specific architectural assumptions or libraries you would use when implementing this for {topic}?",
                f"Clarification probe targeting brief response at {difficulty} difficulty."
            )
        elif archetype == "Why Questions":
            return (
                f"Why did you choose that approach for {topic}? What are the underlying mathematical or memory trade-offs compared to standard approaches?",
                f"Why question probing architectural motivation at {difficulty} difficulty."
            )
        elif archetype == "Edge Cases":
            return (
                f"That makes sense. Now consider an edge case: What happens if GPU VRAM runs out or vector index fragmentation occurs during runtime in {topic}?",
                f"Edge case probe for high-scoring response stepping up to {difficulty} difficulty."
            )
        elif archetype == "Comparison Questions":
            return (
                f"How does your proposed solution for {topic} compare against competing techniques (such as HNSW vs IVF or Bi-Encoders vs Cross-Encoders)?",
                f"Comparison question assessing trade-off awareness at {difficulty} difficulty."
            )
        else: # Scenario Questions
            return (
                f"Imagine a scenario where traffic surges 100x during a live production deployment of {topic}. How would your system handle scaling and fallback?",
                f"Real-world scenario question evaluating enterprise readiness at {difficulty} difficulty."
            )
