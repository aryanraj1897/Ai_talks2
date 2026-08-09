import json
import os
import hashlib
from typing import List, Dict, Any, Tuple
from models.curriculum import CurriculumDay
from config import settings

class CurriculumParser:
    """Dynamically parses curriculum.json, extracting Modules, Days, Topics, 
    Learning Objectives, Tools, Difficulty, and converting into structured documents for ChromaDB.
    Supports automatic indexing updates when curriculum.json changes.
    """
    
    _last_file_hash: str = ""

    @staticmethod
    def get_file_hash(file_path: str = None) -> str:
        path = file_path or settings.CURRICULUM_PATH
        if not os.path.exists(path):
            return ""
        with open(path, "rb") as f:
            return hashlib.md5(f.read()).hexdigest()

    @classmethod
    def has_file_changed(cls, file_path: str = None) -> bool:
        current_hash = cls.get_file_hash(file_path)
        if current_hash != cls._last_file_hash:
            cls._last_file_hash = current_hash
            return True
        return False

    @staticmethod
    def parse_curriculum(file_path: str = None) -> List[CurriculumDay]:
        path = file_path or settings.CURRICULUM_PATH
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        curriculum = []
        raw_items = (
            data if isinstance(data, list)
            else data.get("days", []) or data.get("curriculum", []) or data.get("items", [])
            if isinstance(data, dict) else []
        )
        for item in raw_items:
            if isinstance(item, dict):
                curr_dict = item.get("day_data") or item.get("curriculum") or item
                if isinstance(curr_dict, dict) and "day" in curr_dict:
                    curriculum.append(CurriculumDay(**curr_dict))
                elif isinstance(item, dict) and "day" in item:
                    curriculum.append(CurriculumDay(**item))
        return curriculum

    @staticmethod
    def extract_documents_and_metadata(
        curriculum_input: Any = None
    ) -> Tuple[List[str], List[Dict[str, Any]], List[str]]:
        """Extracts Modules, Days, Topics, Objectives, Tools & Difficulty into 
        embeddable text documents and structured ChromaDB metadata.
        """
        if isinstance(curriculum_input, list):
            curriculum_items = curriculum_input
        else:
            curriculum_items = CurriculumParser.parse_curriculum(curriculum_input if isinstance(curriculum_input, str) else None)
        
        documents = []
        texts = []
        metadatas = []
        ids = []

        for item in curriculum_items:
            doc_id = f"day_{item.day}"
            
            # Format text representation focusing on Modules, Topics, Objectives, Tools & Difficulty
            text_doc = (
                f"Day {item.day}: {item.title}\n"
                f"Module: {item.module}\n"
                f"Difficulty Level: {item.difficulty}\n"
                f"Summary: {item.summary}\n"
                f"Learning Objectives:\n" + "\n".join([f"- {obj}" for obj in item.learning_objectives]) + "\n"
                f"Tools & Frameworks: {', '.join(item.tools)}\n"
                f"Key Concepts: {', '.join(item.key_concepts)}\n"
                f"Sample Questions:\n" + "\n".join([f"- {q}" for q in item.sample_questions])
            )
            
            metadata = {
                "day": item.day,
                "module": item.module,
                "topic": item.title,
                "difficulty": item.difficulty,
                "tools": ", ".join(item.tools),
                "objectives_count": len(item.learning_objectives),
                "sample_questions_count": len(item.sample_questions)
            }
            
            texts.append(text_doc)
            metadatas.append(metadata)
            ids.append(doc_id)

        return texts, metadatas, ids

    @staticmethod
    def get_day(day_num: int, file_path: str = None) -> CurriculumDay:
        curriculum = CurriculumParser.parse_curriculum(file_path)
        for c in curriculum:
            if c.day == day_num:
                return c
        raise ValueError(f"Day {day_num} not found in curriculum")
