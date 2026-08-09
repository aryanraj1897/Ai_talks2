import pytest
from fastapi.testclient import TestClient
import main

client = TestClient(main.app)

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_curriculum_endpoint():
    response = client.get("/api/v1/curriculum")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 31

def test_candidates_endpoint():
    response = client.get("/api/v1/candidates")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_specs_endpoint():
    response = client.get("/api/v1/specs")
    assert response.status_code == 200
    data = response.json()
    assert "endpoints" in data

def test_interview_flow_api():
    # 1. Start Interview Session
    start_res = client.post(
        "/api/v1/interview/start",
        json={"candidate_id": "CAND-001", "target_question_count": 8, "min_curriculum_days": 4}
    )
    assert start_res.status_code == 201
    start_data = start_res.json()
    session_id = start_data["session_id"]
    q_id = start_data["first_question"]["question_id"]
    assert session_id != ""

    # 2. Submit Turn Answer
    submit_res = client.post(
        "/api/v1/interview/submit-turn",
        json={
            "session_id": session_id,
            "question_id": q_id,
            "candidate_answer": "HNSW uses graph layers for approximate nearest neighbor similarity search."
        }
    )
    assert submit_res.status_code == 200
    submit_data = submit_res.json()
    assert submit_data["turn_index"] == 1
    assert "evaluation" in submit_data

    # 3. Get Feedback Report
    fb_res = client.get(f"/api/v1/interview/{session_id}/feedback")
    assert fb_res.status_code == 200
    fb_data = fb_res.json()
    assert fb_data["overall_score"] > 0
