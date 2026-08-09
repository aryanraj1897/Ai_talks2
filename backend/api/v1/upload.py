import os
import json
import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from pydantic import BaseModel
from parsers.curriculum_parser import CurriculumParser
from parsers.candidate_parser import CandidateParser
from parsers.spec_parser import SpecParser
from vectordb.chroma_manager import ChromaManager
from config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/upload", tags=["Upload"])

class UploadSummaryResponse(BaseModel):
    status: str = "success"
    message: str = "Files uploaded and processed successfully."
    curriculum_days_extracted: int = 0
    candidates_extracted: int = 0
    endpoints_extracted: int = 0
    vector_embeddings_stored: int = 0

@router.post("", response_model=UploadSummaryResponse, status_code=status.HTTP_200_OK)
async def upload_files(
    curriculum_file: Optional[UploadFile] = File(None),
    candidates_file: Optional[UploadFile] = File(None),
    specs_file: Optional[UploadFile] = File(None)
):
    """POST /api/v1/upload
    Allows upload of curriculum.json, candidates.json, technical-specs.md.
    Parses datasets dynamically, updates ChromaDB vector store, and returns extracted summaries.
    """
    logger.info("Processing file upload request...")
    days_count = 0
    cands_count = 0
    specs_count = 0
    vector_count = 0
    
    try:
        data_dir = os.path.dirname(settings.CURRICULUM_PATH)
        os.makedirs(data_dir, exist_ok=True)
        
        # 1. Save uploaded curriculum.json if provided
        if curriculum_file:
            curr_content = await curriculum_file.read()
            with open(settings.CURRICULUM_PATH, "wb") as f:
                f.write(curr_content)
            logger.info("Curriculum file updated successfully.")
            
        # 2. Save uploaded candidates.json if provided
        if candidates_file:
            cand_content = await candidates_file.read()
            with open(settings.CANDIDATES_PATH, "wb") as f:
                f.write(cand_content)
            logger.info("Candidates file updated successfully.")
            
        # 3. Save uploaded technical-specs.md if provided
        if specs_file:
            specs_content = await specs_file.read()
            with open(settings.SPECS_PATH, "wb") as f:
                f.write(specs_content)
            logger.info("Technical specs file updated successfully.")
            
        # 4. Parse Curriculum & Update ChromaDB embeddings
        curriculum_days = CurriculumParser.parse_curriculum()
        days_count = len(curriculum_days)
        
        chroma = ChromaManager()
        docs, metas, ids = CurriculumParser.extract_documents_and_metadata(curriculum_days)
        if docs:
            chroma.add_documents(documents=docs, metadatas=metas, ids=ids)
            vector_count = len(docs)
            
        # 5. Parse Candidates
        candidates = CandidateParser.parse_candidates()
        cands_count = len(candidates)
        
        # 6. Parse Technical Specs
        spec = SpecParser.parse_specs()
        specs_count = len(spec.endpoints)
        
        return UploadSummaryResponse(
            status="success",
            message="Dataset uploaded, parsed dynamically, and indexed into ChromaDB successfully.",
            curriculum_days_extracted=days_count,
            candidates_extracted=cands_count,
            endpoints_extracted=specs_count,
            vector_embeddings_stored=vector_count
        )
    except Exception as e:
        logger.error(f"Error processing upload: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process dataset files: {str(e)}"
        )
