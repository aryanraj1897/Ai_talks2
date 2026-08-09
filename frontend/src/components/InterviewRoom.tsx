"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CandidateProfile,
  QuestionDetail,
  QuestionTurn,
  InterviewProgress,
  TurnEvaluation,
  FeedbackReport,
} from "@/types/interview";
import {
  User,
  BookOpen,
  Target,
  Send,
  Mic,
  MicOff,
  Clock,
  FileText,
  Sparkles,
  ChevronRight,
  Code,
  CheckCircle,
  Copy,
  Activity,
  Award,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InterviewRoomProps {
  candidate: CandidateProfile;
  progress: InterviewProgress;
  turns: QuestionTurn[];
  currentQuestion: QuestionDetail | null;
  lastEvaluation: TurnEvaluation | null;
  finalReport: FeedbackReport | null;
  isSubmitting: boolean;
  onSendAnswer: (answer: string) => void;
  onForceComplete: () => void;
  onOpenReportModal: () => void;
  onBackToUpload: () => void;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({
  candidate,
  progress,
  turns,
  currentQuestion,
  lastEvaluation,
  finalReport,
  isSubmitting,
  onSendAnswer,
  onForceComplete,
  onOpenReportModal,
  onBackToUpload,
}) => {
  const [inputAnswer, setInputAnswer] = useState("");
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [interviewNotes, setInterviewNotes] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Live MM:SS Interview Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, currentQuestion, isSubmitting]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSend = () => {
    if (!inputAnswer.trim() || isSubmitting) return;
    onSendAnswer(inputAnswer);
    setInputAnswer("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyCodeToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const completedTopics = turns.map((t) => ({
    day: t.question.day,
    topic: t.question.topic,
    score: t.evaluation?.composite_score || 80,
  }));

  return (
    <div className="w-screen h-screen bg-[#070A10] text-slate-200 flex overflow-hidden font-sans">
      {/* 1. LEFT SIDEBAR: Candidate Progress & Completed Topics */}
      <aside className="w-80 h-full bg-[#0D111A] border-r border-[#1E2638] flex flex-col select-none">
        {/* Top Header */}
        <div className="p-4 border-b border-[#1E2638] bg-[#090D16] flex items-center justify-between">
          <button
            onClick={onBackToUpload}
            className="p-1.5 rounded-lg bg-[#121826] hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-[#1E2638]"
            title="Back to Setup"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="text-right">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Interview Agent</h2>
            <span className="text-[10px] text-cyan-400 font-mono">Live Session</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {/* Candidate Card */}
          <div className="bg-[#121826] border border-[#1E2638] rounded-xl p-3.5 space-y-2 shadow-lg">
            <div className="flex items-center space-x-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md"
                style={{ backgroundColor: candidate.avatar_color || "#3b82f6" }}
              >
                {candidate.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-sm font-semibold text-white truncate">{candidate.name}</h3>
                <p className="text-[11px] text-slate-400 truncate">{candidate.target_role}</p>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-[#1E2638]/60 flex justify-between">
              <span>Experience: {candidate.experience_level}</span>
              <span className="text-cyan-400 font-semibold">{turns.length + 1} Turn</span>
            </div>
          </div>

          {/* Active Question Number Indicator */}
          <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 rounded-xl p-3.5 text-center">
            <span className="text-[10px] text-blue-300 uppercase tracking-widest font-mono font-semibold">Active Turn</span>
            <div className="text-2xl font-extrabold text-white font-mono my-0.5">
              Question #{turns.length + 1}
            </div>
            <p className="text-[10px] text-slate-400">Targeting Min 8 Questions Rule</p>
          </div>

          {/* Candidate Progress Gauges */}
          <div className="bg-[#090D16] border border-[#1E2638] rounded-xl p-3.5 space-y-3">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-400" /> Interview Progress
            </h4>

            {/* Questions Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Questions</span>
                <span className={progress.min_questions_met ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                  {progress.total_questions_asked} / 8 min
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (progress.total_questions_asked / 8) * 100)}%` }}
                />
              </div>
            </div>

            {/* Curriculum Days Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Days Covered</span>
                <span className={progress.min_days_met ? "text-emerald-400 font-bold" : "text-cyan-400 font-bold"}>
                  {progress.days_count} / 4 min
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (progress.days_count / 4) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Completed Topics List */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Completed Topics ({completedTopics.length})
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {completedTopics.length === 0 ? (
                <div className="text-xs text-slate-500 italic p-3 text-center bg-[#090D16] rounded-xl border border-[#1E2638]">
                  No turns completed yet.
                </div>
              ) : (
                completedTopics.map((ct, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#121826] border border-[#1E2638] rounded-xl p-2.5 flex items-center justify-between text-xs"
                  >
                    <div className="truncate max-w-[170px]">
                      <span className="font-mono text-cyan-400 text-[10px] mr-1.5">Day {ct.day}</span>
                      <span className="text-slate-200">{ct.topic}</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-emerald-400">{ct.score}%</span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MIDDLE CONSOLE: Streaming Chat & Bottom Input */}
      <main className="flex-1 h-full flex flex-col bg-[#070A10] relative">
        {/* Chat Console Header */}
        <div className="px-6 py-3.5 border-b border-[#1E2638] bg-[#090D16]/90 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-white">Senior Staff AI Engineering Interviewer</span>
          </div>

          {finalReport ? (
            <button
              onClick={onOpenReportModal}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center space-x-1.5 hover:bg-emerald-500/30 transition-colors shadow-lg"
            >
              <Award className="w-4 h-4" />
              <span>View Report</span>
            </button>
          ) : (
            <button
              onClick={onForceComplete}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
            >
              Finalize Interview
            </button>
          )}
        </div>

        {/* Streaming Chat Trajectory Window */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Welcome Message */}
          <div className="bg-[#121826] border border-[#1E2638] rounded-2xl p-4 max-w-3xl space-y-2">
            <div className="flex items-center space-x-2 text-blue-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold font-mono">SENIOR AI STAFF ENGINEER INTERVIEWER</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Welcome {candidate.name}. We will be conducting a high-caliber technical interview focusing on Enterprise AI Architecture, Vector Databases, RAG Pipelines, and System Design. Let's begin!
            </p>
          </div>

          {/* Past Question & Answer Turns */}
          {turns.map((turn, index) => (
            <div key={index} className="space-y-4">
              {/* AI Question Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0D111A] border border-[#1E2638] rounded-2xl p-5 max-w-3xl space-y-3 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-blue-400">Question #{turn.turn_index}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      Day {turn.question.day}: {turn.question.topic}
                    </span>
                  </div>
                  {turn.question.is_followup && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Adaptive Probe
                    </span>
                  )}
                </div>

                <div className="text-sm text-slate-100 font-sans leading-relaxed whitespace-pre-line">
                  {turn.question.question}
                </div>

                {/* Question Code Snippet Example if present */}
                {turn.question.rationale && (
                  <div className="text-[11px] text-slate-400 font-mono bg-[#070A10] p-2.5 rounded-lg border border-[#1E2638]/80">
                    Rationale: {turn.question.rationale}
                  </div>
                )}
              </motion.div>

              {/* Candidate Answer Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <div className="bg-gradient-to-r from-blue-600/90 to-cyan-600/90 border border-cyan-400/30 rounded-2xl p-4 max-w-2xl text-white space-y-2 shadow-lg">
                  <div className="flex items-center justify-between text-[11px] text-cyan-200 font-mono border-b border-white/10 pb-1">
                    <span>{candidate.name}</span>
                    <span>Answer Submitted</span>
                  </div>
                  <p className="text-xs font-mono leading-relaxed whitespace-pre-wrap">
                    {turn.candidate_answer}
                  </p>
                </div>
              </motion.div>

              {/* Evaluation Result Badge */}
              {turn.evaluation && (
                <div className="flex justify-center">
                  <div className="bg-[#121826] border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-mono text-emerald-300 flex items-center space-x-3 shadow-md">
                    <span>Score: {turn.evaluation.composite_score}%</span>
                    <span>•</span>
                    <span>Accuracy: {turn.evaluation.technical_accuracy}%</span>
                    <span>•</span>
                    <span>Depth: {turn.evaluation.depth_score}%</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Active Question Currently Being Answered */}
          {currentQuestion && !finalReport && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0D111A] border border-blue-500/40 rounded-2xl p-5 max-w-3xl space-y-3 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-blue-400">Question #{turns.length + 1}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    Day {currentQuestion.day}: {currentQuestion.topic}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {currentQuestion.difficulty}
                </span>
              </div>

              <div className="text-sm text-white font-sans leading-relaxed whitespace-pre-line font-medium">
                {currentQuestion.question}
              </div>
            </motion.div>
          )}

          {/* Typing Indicator when Submitting */}
          {isSubmitting && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono p-3 bg-[#0D111A] rounded-xl border border-[#1E2638] w-fit">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Senior Staff AI Engineer is evaluating & generating next prompt...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Bottom Input Console */}
        <div className="p-4 bg-[#090D16] border-t border-[#1E2638] space-y-3">
          {/* Voice Button & Text Input */}
          <div className="flex items-end space-x-3">
            {/* Voice Mic Toggle */}
            <button
              onClick={() => setIsVoiceRecording(!isVoiceRecording)}
              className={`p-3 rounded-xl border transition-all flex items-center justify-center ${
                isVoiceRecording
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse shadow-lg shadow-rose-500/20"
                  : "bg-[#121826] hover:bg-slate-800 text-slate-400 hover:text-white border-[#1E2638]"
              }`}
              title={isVoiceRecording ? "Stop Voice Input" : "Start Voice Input"}
            >
              {isVoiceRecording ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            {/* Textarea Input */}
            <div className="flex-1 bg-[#121826] border border-[#1E2638] focus-within:border-cyan-500/50 rounded-xl p-2.5 transition-colors">
              <textarea
                value={inputAnswer}
                onChange={(e) => setInputAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSubmitting || !!finalReport}
                placeholder="Type your technical response or insert code snippet (Shift+Enter for newline)..."
                rows={2}
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none custom-scrollbar font-mono"
              />
            </div>

            {/* Send CTA Button */}
            <button
              onClick={handleSend}
              disabled={!inputAnswer.trim() || isSubmitting || !!finalReport}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* 3. RIGHT SIDEBAR: Current Topic, Difficulty, Timer, Notes */}
      <aside className="w-80 h-full bg-[#0D111A] border-l border-[#1E2638] flex flex-col select-none">
        {/* Header */}
        <div className="p-4 border-b border-[#1E2638] bg-[#090D16] flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Interview Status</span>
          <div className="flex items-center space-x-1.5 text-cyan-400 font-mono text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {/* Active Topic & Difficulty Card */}
          {currentQuestion && (
            <div className="bg-[#121826] border border-[#1E2638] rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Active Module</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono border border-blue-500/30">
                  {currentQuestion.difficulty}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-cyan-400 font-mono">Day {currentQuestion.day}</span>
                <h3 className="text-xs font-bold text-white">{currentQuestion.topic}</h3>
                <p className="text-[11px] text-slate-400 mt-1">{currentQuestion.module}</p>
              </div>
            </div>
          )}

          {/* Real-time 6D Evaluation Scores Preview */}
          {lastEvaluation && (
            <div className="bg-[#090D16] border border-[#1E2638] rounded-xl p-3.5 space-y-2.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" /> Turn Evaluation Score
              </span>

              <div className="grid grid-cols-2 gap-2 font-mono text-center">
                <div className="bg-[#121826] p-2 rounded-lg border border-[#1E2638]">
                  <div className="text-[9px] text-slate-400">ACCURACY</div>
                  <div className="text-xs font-bold text-emerald-400">{lastEvaluation.technical_accuracy}%</div>
                </div>
                <div className="bg-[#121826] p-2 rounded-lg border border-[#1E2638]">
                  <div className="text-[9px] text-slate-400">DEPTH</div>
                  <div className="text-xs font-bold text-blue-400">{lastEvaluation.depth_score}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Interview Notes Scratchpad */}
          <div className="bg-[#121826] border border-[#1E2638] rounded-xl p-3.5 space-y-2">
            <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" /> Interviewer Notes
            </h4>
            <textarea
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              placeholder="Take live candidate notes during the session..."
              rows={6}
              className="w-full bg-[#090D16] border border-[#1E2638] rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none resize-none custom-scrollbar font-mono"
            />
          </div>
        </div>
      </aside>
    </div>
  );
};
