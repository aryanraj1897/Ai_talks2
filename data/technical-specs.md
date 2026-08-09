# ABTalks AI Technical Interview Agent Specification

## 1. System Overview

The ABTalks AI Technical Interview Agent is an enterprise-grade autonomous interviewing platform designed for evaluating candidates in the 31-Day Enterprise AI Cohort. The system parses curriculum and candidate datasets dynamically, leverages Retrieval-Augmented Generation (RAG) over a ChromaDB vector store, maintains session memory across turns, generates adaptive technical follow-up questions, and outputs comprehensive candidate feedback reports with overall scores and hiring recommendations.

---

## 2. Constraints & Business Rules

1. **Dynamic Data Engine**: Curriculum (`curriculum.json`) and candidate profiles (`candidates.json`) MUST be parsed dynamically from files at runtime. Questions and topics MUST NEVER be hardcoded.
2. **Retrieval Augmented Generation (RAG)**: Curriculum embeddings are dynamically indexed into ChromaDB. During each turn, relevant curriculum chunks and candidate background signals are retrieved to construct grounded, high-precision technical questions.
3. **Session Constraints**:
   - **Minimum Questions**: Every completed interview session MUST ask at least **8 technical questions**.
   - **Minimum Curriculum Days Coverage**: Every completed interview session MUST cover at least **4 distinct curriculum days**.
4. **Adaptive Follow-Up Mechanics**:
   - If a candidate's answer is shallow or incomplete, the agent MUST issue an adaptive follow-up probe diving deeper into the specific gap.
   - If a candidate demonstrates high mastery, the agent transitions to a higher difficulty topic across curriculum days.
5. **Interview Feedback & Recommendation**:
   - Scores generated on a 0–100 numerical scale.
   - Hiring Recommendations: `Strong Hire`, `Hire`, `Weak Hire`, or `No Hire`.

---

## 3. API Endpoints Specification

### 3.1 Data Management & Ingestion

#### `GET /api/v1/health`
Checks server, ChromaDB vector store, and Redis session store status.
- **Response `200 OK`**:
  ```json
  {
    "status": "healthy",
    "version": "1.0.0",
    "chromadb_indexed_documents": 31,
    "redis_status": "connected"
  }
  ```

#### `GET /api/v1/curriculum`
Returns the dynamically loaded curriculum list.
- **Response `200 OK`**:
  ```json
  [
    {
      "day": 1,
      "module": "Prompt Engineering & LLM Fundamentals",
      "title": "LLM Architectures & Tokenization",
      "summary": "...",
      "key_concepts": ["..."],
      "difficulty": "Beginner"
    }
  ]
  ```

#### `GET /api/v1/candidates`
Returns all dynamic candidate profiles.
- **Response `200 OK`**: List of Candidate Objects.

#### `GET /api/v1/candidates/{candidate_id}`
Returns details for a specific candidate.

---

### 3.2 Vector Store & RAG Endpoints

#### `POST /api/v1/rag/ingest`
Forces re-indexing of `curriculum.json` into ChromaDB.
- **Response `200 OK`**:
  ```json
  {
    "message": "Curriculum successfully indexed into ChromaDB",
    "collection": "abtalks_curriculum",
    "indexed_count": 31
  }
  ```

#### `POST /api/v1/rag/search`
Executes vector similarity search against ChromaDB curriculum collection.
- **Request Body**:
  ```json
  {
    "query": "HNSW recall tuning efSearch",
    "top_k": 3,
    "filter_day": null
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "query": "HNSW recall tuning efSearch",
    "results": [
      {
        "day": 6,
        "title": "Vector Indexing Algorithms (HNSW, IVF, Flat)",
        "content_chunk": "...",
        "similarity_score": 0.892
      }
    ]
  }
  ```

---

### 3.3 Interview Session & Agent Execution APIs

#### `POST /api/v1/interview/start`
Initializes a new technical interview session for a selected candidate.
- **Request Body**:
  ```json
  {
    "candidate_id": "cand_anshu_01",
    "target_question_count": 8,
    "min_curriculum_days": 4
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "session_id": "sess_8f910a2b",
    "candidate": { "id": "cand_anshu_01", "name": "Anshu Pathak", "target_role": "..." },
    "status": "in_progress",
    "current_turn": 1,
    "first_question": {
      "question_id": "q_1",
      "day": 6,
      "module": "Vector Databases & Embeddings",
      "topic": "Vector Indexing Algorithms (HNSW, IVF, Flat)",
      "question": "Anshu, given your expertise in vector search, how does tuning efSearch in HNSW impact query latency versus search recall?",
      "rationale": "Targeting candidate focus day 6 (Vector Indexing)."
    }
  }
  ```

#### `POST /api/v1/interview/submit-turn`
Submits candidate's answer for the current question and returns evaluation + next adaptive question.
- **Request Body**:
  ```json
  {
    "session_id": "sess_8f910a2b",
    "question_id": "q_1",
    "candidate_answer": "Increasing efSearch expands the dynamic candidate list size during graph traversal, increasing search recall at the expense of higher QPS latency."
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "session_id": "sess_8f910a2b",
    "turn_index": 1,
    "evaluation": {
      "technical_accuracy": 95,
      "depth_score": 90,
      "communication_score": 92,
      "is_followup_needed": false,
      "feedback_snippet": "Strong understanding of HNSW graph traversal and latency trade-offs."
    },
    "progress": {
      "total_questions_asked": 1,
      "days_covered": [6],
      "days_count": 1,
      "min_questions_met": false,
      "min_days_met": false
    },
    "is_interview_complete": false,
    "next_question": {
      "question_id": "q_2",
      "day": 11,
      "topic": "Hybrid Search & Reciprocal Rank Fusion (RRF)",
      "question": "...",
      "is_followup": false
    }
  }
  ```

#### `GET /api/v1/interview/{session_id}/state`
Retrieves live state, history, score tracking, and RAG context for an active session.

#### `POST /api/v1/interview/{session_id}/complete`
Finalizes the interview, triggers the LangGraph report node, and returns structured feedback.
- **Response `200 OK`**:
  ```json
  {
    "session_id": "sess_8f910a2b",
    "candidate": { "name": "Anshu Pathak", "target_role": "..." },
    "summary": {
      "total_questions_asked": 8,
      "curriculum_days_covered": [6, 11, 15, 19],
      "overall_score": 91,
      "hiring_recommendation": "Strong Hire"
    },
    "topic_breakdown": [
      { "day": 6, "topic": "Vector Indexing", "score": 95 },
      { "day": 11, "topic": "Hybrid Search RRF", "score": 88 }
    ],
    "strengths": ["Deep knowledge of vector retrieval math", "Clear trade-off analysis"],
    "areas_for_growth": ["Could elaborate more on LangGraph interrupt state checkpointers"],
    "detailed_feedback": "Anshu demonstrated exceptional mastery across 4 curriculum days..."
  }
  ```
