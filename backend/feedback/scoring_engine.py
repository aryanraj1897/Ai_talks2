import json
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from config import settings

logger = logging.getLogger(__name__)

class SixDimensionScore(BaseModel):
    accuracy: float = Field(default=80.0, ge=0.0, le=100.0)
    communication: float = Field(default=80.0, ge=0.0, le=100.0)
    depth: float = Field(default=80.0, ge=0.0, le=100.0)
    confidence: float = Field(default=80.0, ge=0.0, le=100.0)
    engineering_thinking: float = Field(default=80.0, ge=0.0, le=100.0)
    system_design: float = Field(default=80.0, ge=0.0, le=100.0)
    composite_turn_score: float = Field(default=80.0, ge=0.0, le=100.0)
    feedback_snippet: str = ""
    suggested_adaptation: str = ""

class ScoringEngine:
    """Dedicated 6-Dimension Technical Scoring Engine.
    
    Evaluates:
    1. Accuracy (0-100)
    2. Communication (0-100)
    3. Depth (0-100)
    4. Confidence (0-100)
    5. Engineering Thinking (0-100)
    6. System Design (0-100)
    
    Stores scores internally and uses scores to influence next questions.
    """
    
    def __init__(self):
        self.llm = None
        if settings.OPENAI_API_KEY:
            try:
                self.llm = ChatOpenAI(
                    model=settings.OPENAI_MODEL,
                    api_key=settings.OPENAI_API_KEY,
                    temperature=0.2
                )
            except Exception as e:
                logger.warning(f"ScoringEngine LLM init fallback: {e}")

    def evaluate_turn(
        self,
        question_text: str,
        topic: str,
        candidate_answer: str,
        previous_turn_scores: List[SixDimensionScore] = []
    ) -> SixDimensionScore:
        if not candidate_answer or len(candidate_answer.strip()) < 5:
            return SixDimensionScore(
                accuracy=20.0,
                communication=30.0,
                depth=15.0,
                confidence=20.0,
                engineering_thinking=20.0,
                system_design=15.0,
                composite_turn_score=20.0,
                feedback_snippet="Extremely brief or empty response.",
                suggested_adaptation="Reduce difficulty and prompt for basic definition."
            )
            
        if self.llm:
            try:
                sys_prompt = (
                    "You are a Staff AI Engineer scoring a candidate answer across 6 dimensions (0-100 each):\n"
                    "1. accuracy: Technical correctness of claims/concepts\n"
                    "2. communication: Structure, clarity, conciseness\n"
                    "3. depth: Trade-off analysis, underlying math, memory/VRAM awareness\n"
                    "4. confidence: Directness, conviction, lack of hesitant filler\n"
                    "5. engineering_thinking: Problem decomposition, edge-case consideration\n"
                    "6. system_design: End-to-end architecture, throughput/latency optimization\n"
                    "Respond strictly in JSON format:\n"
                    "{\n"
                    '  "accuracy": 85.0,\n'
                    '  "communication": 90.0,\n'
                    '  "depth": 80.0,\n'
                    '  "confidence": 85.0,\n'
                    '  "engineering_thinking": 88.0,\n'
                    '  "system_design": 82.0,\n'
                    '  "feedback_snippet": "...",\n'
                    '  "suggested_adaptation": "..."\n'
                    "}"
                )
                user_prompt = (
                    f"Question: {question_text}\n"
                    f"Topic: {topic}\n"
                    f"Candidate Answer: {candidate_answer}\n font-mono"
                )
                res = self.llm.invoke([SystemMessage(content=sys_prompt), HumanMessage(content=user_prompt)])
                parsed = json.loads(res.content.strip("`json\n "))
                
                acc = float(parsed.get("accuracy", 80.0))
                comm = float(parsed.get("communication", 80.0))
                dep = float(parsed.get("depth", 80.0))
                conf = float(parsed.get("confidence", 80.0))
                eng = float(parsed.get("engineering_thinking", 80.0))
                sysd = float(parsed.get("system_design", 80.0))
                
                comp = round(
                    (acc * 0.25) + (dep * 0.20) + (eng * 0.20) + (sysd * 0.15) + (comm * 0.10) + (conf * 0.10), 1
                )
                
                return SixDimensionScore(
                    accuracy=acc,
                    communication=comm,
                    depth=dep,
                    confidence=conf,
                    engineering_thinking=eng,
                    system_design=sysd,
                    composite_turn_score=comp,
                    feedback_snippet=parsed.get("feedback_snippet", "Good response."),
                    suggested_adaptation=parsed.get("suggested_adaptation", "Advance topic.")
                )
            except Exception as e:
                logger.error(f"ScoringEngine LLM fallback: {e}")
                
        # Structured Heuristic Scoring Fallback
        word_count = len(candidate_answer.split())
        acc = min(100.0, max(40.0, 65.0 + (word_count * 0.4)))
        comm = 85.0
        dep = min(100.0, max(35.0, 55.0 + (word_count * 0.5)))
        conf = 80.0 if word_count >= 15 else 50.0
        eng = min(100.0, max(40.0, 60.0 + (word_count * 0.45)))
        sysd = min(100.0, max(40.0, 58.0 + (word_count * 0.4)))
        
        comp = round(
            (acc * 0.25) + (dep * 0.20) + (eng * 0.20) + (sysd * 0.15) + (comm * 0.10) + (conf * 0.10), 1
        )
        
        adaptation = "Trigger system design scenario" if sysd >= 80 else "Probe trade-offs"
        return SixDimensionScore(
            accuracy=round(acc, 1),
            communication=comm,
            depth=round(dep, 1),
            confidence=conf,
            engineering_thinking=round(eng, 1),
            system_design=round(sysd, 1),
            composite_turn_score=comp,
            feedback_snippet="Foundational explanation with good keyword coverage.",
            suggested_adaptation=adaptation
        )

    def determine_question_influence(self, scores: List[SixDimensionScore]) -> Dict[str, Any]:
        """Uses accumulated turn scores to dynamically influence the next question strategy."""
        if not scores:
            return {"strategy": "standard", "focus_area": "core", "target_difficulty": "Intermediate"}
            
        avg_acc = sum(s.accuracy for s in scores) / len(scores)
        avg_dep = sum(s.depth for s in scores) / len(scores)
        avg_eng = sum(s.engineering_thinking for s in scores) / len(scores)
        avg_sysd = sum(s.system_design for s in scores) / len(scores)
        
        if avg_eng >= 85 and avg_sysd >= 82:
            return {
                "strategy": "advanced_systems",
                "focus_area": "high_concurrency_architecture",
                "target_difficulty": "Advanced",
                "instruction": "Candidate exhibits strong engineering thinking & system design. Ask high-concurrency architecture and edge case questions."
            }
        elif avg_acc < 65 or avg_dep < 60:
            return {
                "strategy": "remedial_probe",
                "focus_area": "foundational_concepts",
                "target_difficulty": "Beginner",
                "instruction": "Candidate is struggling with accuracy or depth. Ask foundational clarification question with hints."
            }
        else:
            return {
                "strategy": "balanced_tradeoff",
                "focus_area": "tradeoff_analysis",
                "target_difficulty": "Intermediate",
                "instruction": "Ask balanced comparison and trade-off questions."
            }
