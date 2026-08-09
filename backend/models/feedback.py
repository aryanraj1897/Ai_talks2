from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class FeedbackTopicDetail(BaseModel):
    day: int
    topic: str
    score: float
    summary: str

class FeedbackReport(BaseModel):
    session_id: str
    candidate_id: str
    candidate_name: str
    target_role: str
    total_questions_asked: int
    curriculum_days_covered: List[int] = Field(default_factory=list)
    
    # Core 0-100 Scores
    overall_score: float = Field(default=85.0, ge=0.0, le=100.0)
    technical_knowledge: float = Field(default=85.0, ge=0.0, le=100.0)
    communication: float = Field(default=85.0, ge=0.0, le=100.0)
    problem_solving: float = Field(default=85.0, ge=0.0, le=100.0)
    system_design: float = Field(default=85.0, ge=0.0, le=100.0)
    
    # Qualitative Breakdown
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    missed_topics: List[str] = Field(default_factory=list)
    recommended_revision: List[str] = Field(default_factory=list)
    
    # Recommendation & Summary
    hiring_recommendation: str = "Hire"  # Strong Hire, Hire, Weak Hire, No Hire
    overall_summary: str = ""
    
    # Charts Visualization Data Structure
    charts_data: Dict[str, Any] = Field(default_factory=dict)
    topic_breakdown: List[FeedbackTopicDetail] = Field(default_factory=list)
