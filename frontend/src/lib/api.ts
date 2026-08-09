import { CandidateProfile, CurriculumDay, QuestionDetail, TurnEvaluation, InterviewProgress, FeedbackReport } from "@/types/interview";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchCandidates(): Promise<CandidateProfile[]> {
  const res = await fetch(`${API_BASE_URL}/candidates`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch candidates");
  return res.json();
}

export async function fetchCurriculum(): Promise<CurriculumDay[]> {
  const res = await fetch(`${API_BASE_URL}/curriculum`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch curriculum");
  return res.json();
}

export async function startInterview(candidateId: string): Promise<{
  session_id: string;
  candidate: CandidateProfile;
  first_question: QuestionDetail;
}> {
  const res = await fetch(`${API_BASE_URL}/interview/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      candidate_id: candidateId,
      target_question_count: 8,
      min_curriculum_days: 4
    })
  });
  if (!res.ok) throw new Error("Failed to start interview session");
  return res.json();
}

export async function submitTurn(sessionId: string, questionId: string, answer: string): Promise<{
  session_id: string;
  turn_index: number;
  evaluation: TurnEvaluation;
  progress: InterviewProgress;
  is_interview_complete: boolean;
  next_question?: QuestionDetail;
}> {
  const res = await fetch(`${API_BASE_URL}/interview/submit-turn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      question_id: questionId,
      candidate_answer: answer
    })
  });
  if (!res.ok) throw new Error("Failed to submit answer turn");
  return res.json();
}

export async function completeInterview(sessionId: string): Promise<FeedbackReport> {
  const res = await fetch(`${API_BASE_URL}/interview/${sessionId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error("Failed to complete interview session");
  return res.json();
}

export async function getRagStats(): Promise<{
  collection_name: string;
  document_count: number;
  persist_directory: string;
}> {
  const res = await fetch(`${API_BASE_URL}/rag/stats`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch RAG stats");
  return res.json();
}
