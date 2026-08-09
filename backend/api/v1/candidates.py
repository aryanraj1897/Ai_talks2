from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from parsers.candidate_parser import CandidateParser
from models.candidate import CandidateProfile

router = APIRouter()

@router.get("/candidates", response_model=List[CandidateProfile])
def get_candidates():
    """Returns dynamically parsed candidate profiles."""
    try:
        return CandidateParser.parse_candidates()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/candidates/{candidate_id}", response_model=CandidateProfile)
def get_candidate(candidate_id: str):
    cand = CandidateParser.get_candidate(candidate_id)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return cand

@router.get("/candidates/{candidate_id}/profile")
def get_candidate_profile_analysis(candidate_id: str):
    """Returns enriched candidate profile analysis with extracted learning signals."""
    try:
        return CandidateParser.generate_candidate_profile(candidate_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/candidates/{candidate_id}/plan")
def get_candidate_interview_plan(candidate_id: str):
    """Automatically generates structured multi-phase technical interview plan."""
    try:
        return CandidateParser.generate_interview_plan(candidate_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
