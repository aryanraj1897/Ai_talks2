from typing import List
from fastapi import APIRouter, HTTPException
from parsers.curriculum_parser import CurriculumParser
from models.curriculum import CurriculumDay

router = APIRouter()

@router.get("/curriculum", response_model=List[CurriculumDay])
def get_curriculum():
    """Returns dynamically parsed curriculum JSON data."""
    try:
        return CurriculumParser.parse_curriculum()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/curriculum/{day_num}", response_model=CurriculumDay)
def get_curriculum_day(day_num: int):
    try:
        return CurriculumParser.get_day(day_num)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
