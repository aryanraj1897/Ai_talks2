"use client";

import React, { useState, useEffect } from "react";
import { LandingHero } from "@/components/LandingHero";
import { UploadPage } from "@/components/UploadPage";
import { FileUploadModal } from "@/components/FileUploadModal";
import { InterviewRoom } from "@/components/InterviewRoom";
import { DashboardView } from "@/components/DashboardView";
import { FeedbackReportModal } from "@/components/FeedbackReportModal";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { CandidateProfile, CurriculumDay, QuestionTurn, InterviewProgress, TurnEvaluation, FeedbackReport, QuestionDetail } from "@/types/interview";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [activeView, setActiveView] = useState<"landing" | "upload" | "workspace" | "dashboard">("landing");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Active Session State
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionDetail | null>(null);
  const [turns, setTurns] = useState<QuestionTurn[]>([]);
  const [lastEvaluation, setLastEvaluation] = useState<TurnEvaluation | null>(null);
  const [finalReport, setFinalReport] = useState<FeedbackReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInterviewInProgress, setIsInterviewInProgress] = useState(false);

  const [progress, setProgress] = useState<InterviewProgress>({
    total_questions_asked: 0,
    days_covered: [],
    days_count: 0,
    min_questions_met: false,
    min_days_met: false,
  });

  // Fetch initial candidates list
  useEffect(() => {
    fetch("http://localhost:8000/api/v1/candidates")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSelectedCandidate(data[0]);
        }
      })
      .catch((err) => console.log("Backend offline or candidate fetch fallback", err));
  }, []);

  const handleStartInterview = async () => {
    if (!selectedCandidate) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: selectedCandidate.id,
          target_question_count: 8,
          min_curriculum_days: 4,
        }),
      });

      if (!res.ok) throw new Error("Failed to start interview");

      const data = await res.json();
      setSessionId(data.session_id);
      setCurrentQuestion(data.first_question);
      setTurns([]);
      setLastEvaluation(null);
      setFinalReport(null);
      setIsInterviewInProgress(true);
      setActiveView("workspace");

      setProgress({
        total_questions_asked: 1,
        days_covered: [data.first_question.day],
        days_count: 1,
        min_questions_met: false,
        min_days_met: false,
      });
    } catch (err) {
      console.error("Start interview error:", err);
      // Client-side local fallback session
      const fallbackQ: QuestionDetail = {
        question_id: "q_1",
        day: 6,
        module: "Module 2: Advanced Vector Search & Embeddings",
        topic: "Vector Indexing (HNSW & IVF)",
        question: `Welcome ${selectedCandidate.name}. Let's discuss Vector Indexing (Day 6). How does HNSW construct hierarchical graph layers to accelerate approximate nearest neighbor search compared to IVF?`,
        rationale: "Assesses understanding of approximate nearest neighbor algorithms.",
        difficulty: "Intermediate",
        is_followup: false,
        rag_context: ["HNSW constructs hierarchical graph layers for logarithmic time similarity search."],
      };

      setSessionId(`sess_demo_${Date.now()}`);
      setCurrentQuestion(fallbackQ);
      setTurns([]);
      setIsInterviewInProgress(true);
      setActiveView("workspace");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendAnswer = async (answer: string) => {
    if (!sessionId || !currentQuestion || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/interview/submit-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: currentQuestion.question_id,
          candidate_answer: answer,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit turn");

      const data = await res.json();
      const turnObj: QuestionTurn = {
        turn_index: data.turn_index,
        question: currentQuestion,
        candidate_answer: answer,
        evaluation: data.evaluation,
        timestamp: new Date().toISOString(),
      };

      setTurns((prev) => [...prev, turnObj]);
      setLastEvaluation(data.evaluation);
      setProgress(data.progress);

      if (data.is_interview_complete) {
        setIsInterviewInProgress(false);
        setCurrentQuestion(null);
        handleFetchFinalReport(sessionId);
      } else if (data.next_question) {
        setCurrentQuestion(data.next_question);
      }
    } catch (err) {
      console.error("Submit turn error:", err);
      // Fallback local turn simulation
      const mockEval: TurnEvaluation = {
        technical_accuracy: 85,
        communication_score: 90,
        depth_score: 80,
        confidence_score: 85,
        engineering_thinking_score: 88,
        system_design_score: 82,
        composite_score: 85,
        is_followup_needed: false,
        feedback_snippet: "Good technical explanation of graph hierarchies.",
      };

      const turnObj: QuestionTurn = {
        turn_index: turns.length + 1,
        question: currentQuestion,
        candidate_answer: answer,
        evaluation: mockEval,
        timestamp: new Date().toISOString(),
      };

      const updatedTurns = [...turns, turnObj];
      setTurns(updatedTurns);
      setLastEvaluation(mockEval);

      if (updatedTurns.length >= 8) {
        setIsInterviewInProgress(false);
        setCurrentQuestion(null);
      } else {
        const nextDay = (currentQuestion.day % 31) + 1;
        setCurrentQuestion({
          question_id: `q_${updatedTurns.length + 1}`,
          day: nextDay,
          module: "Enterprise AI Architecture",
          topic: `Curriculum Day ${nextDay}`,
          question: `Regarding Day ${nextDay}: Explain how you would optimize latency and throughput in production.`,
          rationale: "Assesses performance tuning.",
          difficulty: "Intermediate",
          is_followup: false,
          rag_context: [],
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFetchFinalReport = async (sessId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/interview/${sessId}/complete`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to fetch report");
      const data = await res.json();
      setFinalReport(data);
      setIsReportModalOpen(true);
      setActiveView("dashboard");
    } catch (err) {
      console.error("Report fetch error:", err);
    }
  };

  const handleExportJSON = () => {
    const rep = finalReport || {
      candidate_name: selectedCandidate?.name || "Anshu Pathak",
      overall_score: 82,
      hiring_recommendation: "Hire",
      technical_knowledge: 85,
      system_design: 78,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rep, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `analytics_dashboard_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.25, ease: "easeIn" as const } },
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 font-sans overflow-x-hidden">
      {/* Top Navbar */}
      <header className="h-14 border-b border-[#1E2638] bg-[#090D16]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 select-none">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            AB
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-wide">ABTalks AI Interviewer</span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono">
              v1.0 Enterprise
            </span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center space-x-1 bg-[#121826] p-1 rounded-xl border border-[#1E2638]">
          <button
            onClick={() => setActiveView("landing")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeView === "landing" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Landing
          </button>
          <button
            onClick={() => setActiveView("upload")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeView === "upload" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Upload Setup
          </button>
          <button
            onClick={() => setActiveView("workspace")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeView === "workspace" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Interview Room
          </button>
          <button
            onClick={() => setActiveView("dashboard")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeView === "dashboard" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Dashboard
          </button>
        </nav>
      </header>

      {/* Main View Router with Framer Motion AnimatePresence Page Transitions */}
      <main className="w-full">
        <AnimatePresence mode="wait">
          {activeView === "landing" && (
            <motion.div key="landing" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <LandingHero
                onStartInterview={() => {
                  if (selectedCandidate) handleStartInterview();
                  else setActiveView("workspace");
                }}
                onOpenUploadModal={() => setActiveView("upload")}
                onUploadFiles={() => setActiveView("upload")}
              />
            </motion.div>
          )}

          {activeView === "upload" && (
            <motion.div key="upload" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <UploadPage
                onProceed={() => setActiveView("workspace")}
                onBackToLanding={() => setActiveView("landing")}
              />
            </motion.div>
          )}

          {activeView === "workspace" && selectedCandidate && (
            <motion.div key="workspace" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <InterviewRoom
                candidate={selectedCandidate}
                progress={progress}
                turns={turns}
                currentQuestion={currentQuestion}
                lastEvaluation={lastEvaluation}
                finalReport={finalReport}
                isSubmitting={isSubmitting}
                onSendAnswer={handleSendAnswer}
                onForceComplete={() => handleFetchFinalReport(sessionId || "sess_demo")}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                onBackToUpload={() => setActiveView("upload")}
              />
            </motion.div>
          )}

          {activeView === "dashboard" && (
            <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <DashboardView
                candidate={selectedCandidate}
                report={finalReport}
                progress={progress}
                onBackToInterview={() => setActiveView("workspace")}
                onExportJSON={handleExportJSON}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal Dialogs */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => setIsUploadModalOpen(false)}
      />
      <FeedbackReportModal
        report={finalReport}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
