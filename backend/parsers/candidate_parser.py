import json
import os
from typing import List, Dict, Any, Optional
from models.candidate import CandidateProfile, LearningSignals
from config import settings

class InterviewPlan(Dict[str, Any]):
    """Structured interview plan automatically generated for a candidate."""
    pass

class CandidateParser:
    """Dynamically parses candidates.json, extracting Name, Completed Days, Skipped Days, 
    Attempts, and Learning Signals to generate enriched candidate profiles and automated interview plans.
    """
    
    @staticmethod
    def parse_candidates(file_path: str = None) -> List[CandidateProfile]:
        path = file_path or settings.CANDIDATES_PATH
        if not os.path.exists(path):
            raise FileNotFoundError(f"Candidates file not found at: {path}")
            
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        candidates = []
        raw_items = data if isinstance(data, list) else data.get("candidates", []) if isinstance(data, dict) else []
        for item in raw_items:
            if isinstance(item, dict):
                # Unwrap nested keys if present
                candidate_dict = item.get("member") or item.get("candidate") or item
                if isinstance(candidate_dict, dict) and "name" in candidate_dict:
                    candidates.append(CandidateProfile(**candidate_dict))
                elif isinstance(item, dict) and "name" in item:
                    candidates.append(CandidateProfile(**item))
        return candidates
        
    @staticmethod
    def get_candidate(candidate_id: str, file_path: str = None) -> Optional[CandidateProfile]:
        candidates = CandidateParser.parse_candidates(file_path)
        for cand in candidates:
            if cand.id == candidate_id or candidate_id.lower() in cand.id.lower() or cand.id.lower() in candidate_id.lower():
                return cand
        return candidates[0] if candidates else None

    @staticmethod
    def extract_candidate_signals(candidate: CandidateProfile) -> Dict[str, Any]:
        """Extracts Candidate Name, Completed Days, Skipped Days, Attempts, and Learning Signals."""
        completed_days = candidate.completed_missions
        skipped_days = candidate.skipped_topics
        attempts_dict = candidate.attempts
        signals = candidate.learning_signals
        
        # Calculate attempt metrics
        total_attempts = len(attempts_dict)
        passed_attempts = sum(1 for a in attempts_dict.values() if isinstance(a, dict) and a.get("pass", True))
        avg_score = round(
            sum(a.get("score", 0) for a in attempts_dict.values() if isinstance(a, dict)) / total_attempts, 1
        ) if total_attempts > 0 else 0.0

        return {
            "id": candidate.id,
            "candidate_name": candidate.name,
            "target_role": candidate.target_role,
            "experience_level": candidate.experience_level,
            "completed_days": completed_days,
            "completed_days_count": len(completed_days),
            "skipped_days": skipped_days,
            "skipped_days_count": len(skipped_days),
            "attempts": attempts_dict,
            "total_attempts": total_attempts,
            "passed_attempts": passed_attempts,
            "average_attempt_score": avg_score,
            "learning_signals": {
                "strongest_domains": signals.strongest_domains,
                "weakest_domains": signals.weakest_domains,
                "code_proficiency": signals.code_proficiency,
                "communication_style": signals.communication_style,
                "learning_notes": signals.learning_notes
            },
            "suggested_focus_days": candidate.suggested_focus_days
        }

    @classmethod
    def generate_candidate_profile(cls, candidate_id: str, file_path: str = None) -> Dict[str, Any]:
        """Generates a complete candidate profile analysis object."""
        cand = cls.get_candidate(candidate_id, file_path)
        if not cand:
            raise ValueError(f"Candidate {candidate_id} not found.")
            
        extracted = cls.extract_candidate_signals(cand)
        
        # Profile summary & readiness risk tag
        if extracted["average_attempt_score"] >= 90 and len(extracted["skipped_days"]) <= 5:
            readiness = "High Readiness (Enterprise AI Architect Candidate)"
        elif extracted["average_attempt_score"] >= 75:
            readiness = "Moderate Readiness (Solid Core, Needs Probing on Skipped Topics)"
        else:
            readiness = "Requires Thorough Technical Verification"

        return {
            "profile_meta": extracted,
            "readiness_classification": readiness,
            "primary_strengths": extracted["learning_signals"]["strongest_domains"],
            "primary_gaps": extracted["learning_signals"]["weakest_domains"],
            "key_focus_days": extracted["suggested_focus_days"]
        }

    @classmethod
    def generate_interview_plan(cls, candidate_id: str, file_path: str = None) -> Dict[str, Any]:
        """Automatically generates a structured, multi-phase technical interview plan
        enforcing minimum 8 questions and minimum 4 curriculum days.
        """
        cand = cls.get_candidate(candidate_id, file_path)
        if not cand:
            raise ValueError(f"Candidate {candidate_id} not found.")
            
        signals = cls.extract_candidate_signals(cand)
        focus_days = signals["suggested_focus_days"] or [1, 5, 11, 15, 19, 24]
        skipped_days = signals["skipped_days"]
        
        # Determine 4 distinct curriculum target days
        target_days = []
        for d in focus_days:
            if d not in target_days:
                target_days.append(d)
        for d in skipped_days:
            if d not in target_days and len(target_days) < 6:
                target_days.append(d)
                
        # Ensure at least 4 days
        default_days = [1, 6, 11, 15, 19, 24]
        for d in default_days:
            if d not in target_days:
                target_days.append(d)

        # Plan Phases
        plan_phases = [
            {
                "phase": "Phase 1: Core Fundamentals & Strength Probe",
                "target_days": target_days[:2],
                "target_questions_count": 2,
                "objective": f"Verify candidate mastery in {', '.join(signals['learning_signals']['strongest_domains'][:2])}."
            },
            {
                "phase": "Phase 2: Skipped Topics & Learning Gap Verification",
                "target_days": target_days[2:4],
                "target_questions_count": 3,
                "objective": f"Probe skipped curriculum days ({', '.join(map(str, skipped_days[:3]))}) and weak domains ({', '.join(signals['learning_signals']['weakest_domains'])})."
            },
            {
                "phase": "Phase 3: Stateful Agent & Systems Architecture Deep Dive",
                "target_days": target_days[4:6],
                "target_questions_count": 3,
                "objective": "Evaluate end-to-end production LLMOps, LangGraph interrupt state checkpointers, and trade-off analysis."
            }
        ]

        return {
            "candidate_id": cand.id,
            "candidate_name": cand.name,
            "target_role": cand.target_role,
            "plan_summary": {
                "total_questions_planned": 8,
                "curriculum_days_targeted": target_days[:6],
                "min_questions_rule": ">= 8 Questions",
                "min_days_rule": ">= 4 Curriculum Days"
            },
            "phases": plan_phases,
            "adaptive_trigger_rules": [
                "If technical accuracy < 70%, trigger immediate deep-dive follow-up probe on underlying math.",
                "If response word count < 20, prompt for trade-off analysis.",
                "If accuracy >= 90%, advance to higher difficulty architectural question."
            ]
        }
