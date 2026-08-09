import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from vectordb.chroma_manager import ChromaManager
from parsers.curriculum_parser import CurriculumParser
from api.v1 import (
    health_router,
    curriculum_router,
    candidates_router,
    rag_router,
    interview_router,
    upload_router,
    dynamic_spec_router
)

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("abtalks_backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler initializing ChromaDB vector index and dynamic OpenAPI routes."""
    logger.info("Initializing ABTalks AI Interviewer Backend Services...")
    try:
        chroma = ChromaManager()
        if chroma.get_collection_count() == 0:
            logger.info("ChromaDB collection empty. Parsing curriculum and seeding embeddings...")
            days = CurriculumParser.parse_curriculum()
            docs, metas, ids = CurriculumParser.extract_documents_and_metadata(days)
            if docs:
                chroma.add_documents(documents=docs, metadatas=metas, ids=ids)
                logger.info(f"Seeded {len(docs)} curriculum embeddings into ChromaDB.")
        else:
            logger.info(f"ChromaDB collection loaded with {chroma.get_collection_count()} embeddings.")
    except Exception as e:
        logger.error(f"Lifespan initialization error: {e}", exc_info=True)
    yield
    logger.info("Shutting down ABTalks AI Interviewer Backend Services...")

app = FastAPI(
    title=settings.APP_NAME,
    description="Production-grade AI Technical Interviewer platform for ABTalks AI Cohort Hackathon.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register v1 Routers
app.include_router(health_router, prefix="/api/v1")
app.include_router(curriculum_router, prefix="/api/v1")
app.include_router(candidates_router, prefix="/api/v1")
app.include_router(rag_router, prefix="/api/v1")
app.include_router(interview_router, prefix="/api/v1")
app.include_router(upload_router, prefix="/api/v1")
app.include_router(dynamic_spec_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "status": "healthy"
    }
