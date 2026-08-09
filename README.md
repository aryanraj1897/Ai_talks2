# ABTalks AI Technical Interviewer Agent 🤖🎙️

> **Production-Grade Enterprise AI Interview Agent built for the ABTalks AI Cohort Hackathon.**
> Conducts personalized, RAG-grounded, non-repetitive technical engineering interviews based on dynamic curriculum datasets (`curriculum.json`), candidate profiles (`candidates.json`), and system specifications (`technical-specs.md`).

---

## 🌟 Key Highlights

- **Dynamic Dataset Parsing**: Zero hardcoded questions or curriculum. Parses `curriculum.json` (31 Days) and candidate signals dynamically.
- **ChromaDB Vector RAG Engine**: Performs HNSW vector similarity search (`top_k=5`) against persistent ChromaDB embeddings before generating EVERY question.
- **LangGraph StateGraph Workflow**: 6-node state machine (`parser`, `retriever`, `interviewer`, `scorer`, `memory`, `feedback`) with conditional routing.
- **Enforced Business Constraints**: Guarantees **Minimum 8 Questions** and **Minimum 4 Curriculum Days** coverage before finalizing session.
- **Redis Session Memory**: Persists conversation trajectories and automatically synthesizes 4-turn memory summaries every 4 turns.
- **6-Dimension Scoring Engine**: Scores candidate responses across *Accuracy, Communication, Depth, Confidence, Engineering Thinking, System Design* on a 0–100 numerical scale.
- **ChatGPT + Cursor + Linear Style UI**: Built with Next.js 15, TypeScript, Tailwind CSS, Framer Motion, interactive SVG radar charts, and circular progress ring gauges.

---

## 📸 Application Screenshots

```
+-----------------------------------------------------------------------------------+
|                            LANDING HERO & SETUP PAGE                              |
|  [Modern AI Dark Glassmorphism Hero] -> [File Upload & Dataset Validation Setup]   |
+-----------------------------------------------------------------------------------+
```

```
+-----------------------------------------------------------------------------------+
|                         INTERACTIVE 3-COLUMN INTERVIEW ROOM                       |
|  [Left: Progress & Days] | [Middle: Streaming Chat & Input] | [Right: 6D Timer & Notes]|
+-----------------------------------------------------------------------------------+
```

```
+-----------------------------------------------------------------------------------+
|                        ENTERPRISE ANALYTICS DASHBOARD                             |
|  [6-Axis SVG Radar Chart] | [Competency Bar Charts] | [Circular Gauges & Hiring Rec] |
+-----------------------------------------------------------------------------------+
```

---

## 🏗️ Clean Architecture Folder Structure

```text
ABTalks3/
├── backend/                        # FastAPI + LangGraph + ChromaDB Backend
│   ├── api/v1/                     # REST API Endpoint Routers
│   │   ├── candidates.py           # GET Candidate Profiles & Plans
│   │   ├── curriculum.py           # GET 31-Day Curriculum Explorer
│   │   ├── dynamic_router.py       # GET Dynamic Technical Specs (/api/v1/specs)
│   │   ├── health.py               # GET System Healthcheck
│   │   ├── interview.py            # POST Start, Next-Question, Submit-Turn, Feedback, End
│   │   ├── rag.py                  # POST Ingest & Vector Search
│   │   └── upload.py               # POST Upload Files & Update Embeddings
│   ├── agents/                     # LangGraph Agents & Nodes
│   │   ├── langgraph_workflow.py   # StateGraph 6-Node Workflow & Conditional Router
│   │   ├── interview_graph.py      # Main Interview Agent Engine
│   │   └── nodes/                  # Individual Agent Nodes
│   │       ├── followup_generator.py # 5 Follow-up Archetypes & Adaptive Difficulty
│   │       ├── question_generator.py # Senior Staff AI Engineer Persona Question Node
│   │       ├── response_evaluator.py # Response Evaluator Node
│   │       └── feedback_generator.py # Structured JSON Feedback Report Node
│   ├── feedback/                   # 6-Dimension Technical Scoring Engine
│   │   └── scoring_engine.py       # Accuracy, Comm, Depth, Confidence, Eng, System Design
│   ├── memory/                     # Redis Session Memory Manager
│   │   ├── memory_agent.py         # Dedicated Memory Agent & 4-Turn Summarizer
│   │   └── redis_memory.py         # Redis Store with In-Memory Fallback
│   ├── models/                     # Pydantic Domain & API Models
│   │   ├── candidate.py            # CandidateProfile & LearningSignals
│   │   ├── curriculum.py           # CurriculumDay Model
│   │   ├── feedback.py             # FeedbackReport & TopicBreakdown
│   │   └── interview.py            # QuestionTurn, TurnEvaluation, Progress
│   ├── parsers/                    # Dynamic Dataset & Spec Parsers
│   │   ├── candidate_parser.py     # candidates.json Parser & Profile Generator
│   │   ├── curriculum_parser.py    # curriculum.json Parser & Document Chunk Extractor
│   │   └── spec_parser.py          # technical-specs.md Dynamic Markdown Parser
│   ├── rag/                        # RAG Vector Engine
│   │   └── rag_engine.py           # Retrieves Top 5 ChromaDB Chunks per Question
│   ├── vectordb/                   # Vector Database Manager
│   │   └── chroma_manager.py       # Persistent ChromaDB HNSW Cosine Store
│   ├── config.py                   # Application Environment Settings
│   ├── main.py                     # FastAPI Lifespan & App Entrypoint
│   └── requirements.txt            # Python Dependencies Manifest
├── frontend/                       # Next.js 15 + TypeScript + Tailwind CSS Frontend
│   ├── src/
│   │   ├── app/                    # Next.js App Router (page.tsx, layout.tsx, globals.css)
│   │   ├── components/             # React UI Components
│   │   │   ├── DashboardView.tsx   # Premium Analytics Dashboard (Radar & Bar Charts)
│   │   │   ├── EvaluationHud.tsx   # Real-time 6D Score Matrix & Constraints HUD
│   │   │   ├── FeedbackReportModal.tsx # Structured JSON Report Card & Export Modal
│   │   │   ├── FileUploadModal.tsx # File Upload Helper Modal
│   │   │   ├── InterviewRoom.tsx   # 3-Column Interactive Interview Room Console
│   │   │   ├── LandingHero.tsx     # Modern AI Dark Glassmorphism Hero Section
│   │   │   ├── ParticleBackground.tsx # HTML5 Canvas AI Network Animation
│   │   │   ├── SkeletonLoader.tsx  # Shimmer Motion Skeleton Loader
│   │   │   └── UploadPage.tsx      # Dedicated Dataset Upload & Validation Page
│   │   └── types/                  # TypeScript Data Types
│   │       └── interview.ts        # Candidate, Turn, Feedback & Progress Interfaces
│   ├── package.json                # Frontend Dependencies Manifest
│   └── next.config.ts              # Next.js Configuration
├── data/                           # Dataset Storage Directory
│   ├── candidates.json             # Candidates Profiles & Learning Signals
│   ├── curriculum.json             # 31-Day Enterprise AI Cohort Curriculum
│   └── technical-specs.md          # System & REST API Specifications
├── chroma_db_data/                 # Persistent ChromaDB Vector Storage Directory
├── Dockerfile.backend              # Production FastAPI Dockerfile
├── Dockerfile.frontend             # Production Next.js 15 Multi-Stage Dockerfile
├── docker-compose.yml              # Docker Compose Stack Orchestration
├── .env.example                    # Environment Variables Template
└── README.md                       # Complete Project Documentation
```

---

## ⚙️ Environment Variables (`.env`)

Copy `.env.example` to `.env` in the root directory:

```env
# OpenAI API Key & Model
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o

# Redis Memory Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Vector DB & Storage Paths
CHROMA_PERSIST_DIR=./chroma_db_data
CURRICULUM_PATH=./data/curriculum.json
CANDIDATES_PATH=./data/candidates.json
SPECS_PATH=./data/technical-specs.md

# Business Rules Constraints
MIN_QUESTIONS=8
MIN_CURRICULUM_DAYS=4

# Logging
LOG_LEVEL=INFO
APP_NAME=ABTalks AI Technical Interviewer
```

---

## 🚀 Quick Start & Local Execution

### 1. Backend Setup (FastAPI + Python 3.11)

```bash
cd backend
python -m venv .venv
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- **FastAPI OpenAPI Swagger Documentation**: `http://localhost:8000/docs`
- **ReDoc Interactive Documentation**: `http://localhost:8000/redoc`

### 2. Frontend Setup (Next.js 15 + Node.js v20)

```bash
cd frontend
npm install
npm run dev
```

- **Frontend Platform URL**: `http://localhost:3000`

---

## 🐳 Production Docker Setup

Deploy the complete multi-container stack with one command:

```bash
docker-compose up --build
```

### Services Launched:
1. `abtalks_frontend`: Next.js 15 web application (`http://localhost:3000`).
2. `abtalks_backend`: FastAPI server (`http://localhost:8000`).
3. `abtalks_redis`: Redis 7 session store (`localhost:6379`).
4. `chroma_data`: Persistent volume for vector embeddings (`/app/chroma_db_data`).

---

## 📡 REST API Documentation Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | System health check endpoint |
| `POST` | `/api/v1/upload` | Upload & parse dataset files (`curriculum.json`, `candidates.json`, `technical-specs.md`) |
| `GET` | `/api/v1/curriculum` | Retrieve parsed 31-day curriculum explorer |
| `GET` | `/api/v1/candidates` | List candidate profiles & automated interview plans |
| `POST` | `/api/v1/interview/start` | Initialize new adaptive technical interview session |
| `POST` | `/api/v1/interview/next-question` | Fetch active or next question turn |
| `POST` | `/api/v1/interview/submit-turn` | Submit candidate answer & evaluate 6-dimension scores |
| `GET` | `/api/v1/interview/{session_id}/feedback` | Retrieve current or final feedback report |
| `POST` | `/api/v1/interview/{session_id}/end` | Finalize interview session & generate JSON report |
| `GET` | `/api/v1/specs` | Dynamically parsed API specifications from `technical-specs.md` |

---

## 🔮 Future Improvements & Roadmap

1. **Real-time WebRTC Voice Streaming**: Direct low-latency speech-to-speech interaction with the Senior Engineer AI Interviewer.
2. **Interactive Code Execution Sandbox**: In-browser Docker/Pyodide code execution environment for live coding challenges.
3. **GitHub Repository Deep Analysis**: Automatically clone candidate GitHub projects and incorporate repository commit history into RAG retrieval queries.
4. **Multi-lingual Enterprise Interviews**: Support conducting interviews in Spanish, French, German, and Arabic.

---

## 📜 License & Hackathon Context

Built for the **ABTalks AI Cohort Hackathon 2026**. Designed with Clean Architecture principles separating business logic from UI.
