from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class LearningSignals(BaseModel):
    strongest_domains: List[str] = Field(default_factory=list)
    weakest_domains: List[str] = Field(default_factory=list)
    code_proficiency: str = "High in Python & TypeScript"
    communication_style: str = "Technical, clear, structured"
    learning_notes: str = "Participant in ABTalks Enterprise AI Cohort"

class AttemptDetail(BaseModel):
    score: float = 85.0
    pass_status: bool = Field(alias="pass", default=True)

    class Config:
        populate_by_name = True

class CandidateProfile(BaseModel):
    id: str
    name: str
    target_role: str = "Enterprise AI Engineer"
    experience_level: str = "Mid-Senior"
    avatar_color: Optional[str] = "#3b82f6"
    bio: str = "Focused on vector search, RAG pipelines, and agentic AI systems."
    completed_missions: List[int] = Field(default_factory=list)
    attempts: Dict[str, Any] = Field(default_factory=dict)
    skipped_topics: List[int] = Field(default_factory=list)
    learning_signals: LearningSignals = Field(default_factory=LearningSignals)
    suggested_focus_days: List[int] = Field(default_factory=list)
