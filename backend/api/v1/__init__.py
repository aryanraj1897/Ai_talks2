from api.v1.health import router as health_router
from api.v1.curriculum import router as curriculum_router
from api.v1.candidates import router as candidates_router
from api.v1.rag import router as rag_router
from api.v1.interview import router as interview_router
from api.v1.upload import router as upload_router
from api.v1.dynamic_router import router as dynamic_spec_router

__all__ = [
    "health_router",
    "curriculum_router",
    "candidates_router",
    "rag_router",
    "interview_router",
    "upload_router",
    "dynamic_spec_router",
]
