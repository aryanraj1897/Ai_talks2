export interface CandidateProfile {
  id: string;
  name: string;
  target_role: string;
  experience_level: string;
  avatar_color?: string;
  bio: string;
  completed_missions: number[];
  attempts: Record<string, { score: number; pass: boolean }>;
  skipped_topics: number[];
  learning_signals: {
    strongest_domains: string[];
    weakest_domains: string[];
    code_proficiency: string;
    communication_style: string;
    learning_notes: string;
  };
  suggested_focus_days: number[];
}

export interface CurriculumDay {
  day: number;
  module: string;
  title: string;
  summary: string;
  learning_objectives: string[];
  key_concepts: string[];
  tools: string[];
  difficulty: string;
  sample_questions: string[];
}

export interface QuestionDetail {
  question_id: string;
  day: number;
  module: string;
  topic: string;
  question: string;
  rationale: string;
  difficulty: string;
  is_followup: boolean;
  rag_context: string[];
}

export interface TurnEvaluation {
  technical_accuracy: number;
  communication_score: number;
  depth_score: number;
  confidence_score: number;
  engineering_thinking_score: number;
  system_design_score: number;
  composite_score: number;
  is_followup_needed: boolean;
  feedback_snippet: string;
  suggested_probe?: string;
  suggested_adaptation?: string;
}

export interface QuestionTurn {
  turn_index: number;
  question: QuestionDetail;
  candidate_answer: string;
  evaluation?: TurnEvaluation;
  timestamp: string;
}

export interface InterviewProgress {
  total_questions_asked: number;
  days_covered: number[];
  days_count: number;
  min_questions_met: boolean;
  min_days_met: boolean;
}

export interface FeedbackReport {
  session_id: string;
  candidate_id: string;
  candidate_name: string;
  target_role: string;
  total_questions_asked: number;
  curriculum_days_covered: number[];
  overall_score: number;
  technical_knowledge: number;
  communication: number;
  problem_solving: number;
  system_design: number;
  strengths: string[];
  weaknesses: string[];
  missed_topics: string[];
  recommended_revision: string[];
  hiring_recommendation: 'Strong Hire' | 'Hire' | 'Weak Hire' | 'No Hire';
  overall_summary: string;
  charts_data: {
    radar_scores?: Array<{ subject: string; score: number; fullMark?: number }>;
    turn_progression?: Array<{ turn: string; day: string; score: number; accuracy: number }>;
  };
  topic_breakdown: Array<{
    day: number;
    topic: string;
    score: number;
    summary: string;
  }>;
}
