from typing import List
from pydantic import BaseModel, Field

class CurriculumDay(BaseModel):
    day: int
    module: str = "Enterprise AI Engineering"
    title: str = "AI Architecture"
    summary: str = "Technical deep-dive on core AI concepts, architecture, and implementation patterns."
    learning_objectives: List[str] = Field(default_factory=list)
    key_concepts: List[str] = Field(default_factory=list)
    tools: List[str] = Field(default_factory=list)
    difficulty: str = "Intermediate"
    sample_questions: List[str] = Field(default_factory=list)
