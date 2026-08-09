"use client";

import React from "react";
import { InterviewProgress, CandidateProfile, TurnEvaluation, FeedbackReport } from "@/types/interview";
import { Target, Calendar, Award, FileText, CheckCircle2, Play, Sparkles, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface EvaluationHudProps {
  candidate: CandidateProfile | null;
  progress: InterviewProgress;
  lastEvaluation: TurnEvaluation | null;
  isInterviewInProgress: boolean;
  onStartInterview: () => void;
  onForceComplete: () => void;
  finalReport: FeedbackReport | null;
  onOpenReportModal: () => void;
}

export const EvaluationHud: React.FC<EvaluationHudProps> = ({
  candidate,
  progress,
  lastEvaluation,
  isInterviewInProgress,
  onStartInterview,
  onForceComplete,
  finalReport,
  onOpenReportModal,
}) => {
  const minQuestions = 8;
  const minDays = 4;

  const questionsPercent = Math.min(100, Math.round((progress.total_questions_asked / minQuestions) * 100));
  const daysPercent = Math.min(100, Math.round((progress.days_count / minDays) * 100));

  return (
    <aside className="w-80 h-screen bg-[#0D111A] border-l border-[#1E2638] flex flex-col select-none text-slate-300">
      {/* Header */}
      <div className="p-4 border-b border-[#1E2638] bg-[#090D16] flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white text-sm">Evaluation HUD</h3>
          <p className="text-[11px] text-slate-400 font-mono">Real-time 6D Scoring Engine</p>
        </div>

        {finalReport && (
          <button
            onClick={onOpenReportModal}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center space-x-1 hover:bg-emerald-500/30 transition-colors"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {/* Candidate Summary Card */}
        {candidate && (
          <div className="bg-[#121826] border border-[#1E2638] rounded-xl p-3.5 space-y-2">
            <div className="flex items-center space-x-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-md"
                style={{ backgroundColor: candidate.avatar_color || "#3b82f6" }}
              >
                {candidate.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">{candidate.name}</h4>
                <p className="text-[10px] text-slate-400">{candidate.target_role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-2">
          {!isInterviewInProgress ? (
            <button
              disabled={!candidate}
              onClick={onStartInterview}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Technical Interview</span>
            </button>
          ) : (
            <button
              onClick={onForceComplete}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Finalize & Generate Feedback</span>
            </button>
          )}
        </div>

        {/* Requirements Constraints Tracker */}
        <div className="bg-[#090D16] border border-[#1E2638] rounded-xl p-3.5 space-y-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Interview Constraints</span>
            <Activity className="w-3.5 h-3.5 text-blue-400" />
          </div>

          {/* Question Count Constraint (min 8) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-400" /> Total Questions
              </span>
              <span className={progress.min_questions_met ? "text-emerald-400 font-semibold" : "text-amber-400"}>
                {progress.total_questions_asked} / {minQuestions} min
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${questionsPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Curriculum Days Constraint (min 4) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Days Covered
              </span>
              <span className={progress.min_days_met ? "text-emerald-400 font-semibold" : "text-amber-400"}>
                {progress.days_count} / {minDays} min
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${daysPercent}%` }}
              ></div>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {progress.days_covered.map((day) => (
                <span
                  key={day}
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                >
                  Day {day}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time 6-Dimension Scoring HUD */}
        {lastEvaluation && (
          <div className="bg-[#121826] border border-[#1E2638] rounded-xl p-3.5 space-y-3">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                6-Dimension Score Matrix
              </span>
              <span className="text-emerald-400 font-mono font-bold text-xs">
                {lastEvaluation.composite_score || lastEvaluation.technical_accuracy}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center font-mono">
              <div className="bg-[#090D16] p-2 rounded-lg border border-[#1E2638]">
                <div className="text-[9px] text-slate-400 uppercase">Accuracy</div>
                <div className="text-xs font-bold text-emerald-400">{lastEvaluation.technical_accuracy}%</div>
              </div>
              <div className="bg-[#090D16] p-2 rounded-lg border border-[#1E2638]">
                <div className="text-[9px] text-slate-400 uppercase">Depth</div>
                <div className="text-xs font-bold text-blue-400">{lastEvaluation.depth_score}%</div>
              </div>
              <div className="bg-[#090D16] p-2 rounded-lg border border-[#1E2638]">
                <div className="text-[9px] text-slate-400 uppercase">Engineering</div>
                <div className="text-xs font-bold text-cyan-400">{lastEvaluation.engineering_thinking_score || 80}%</div>
              </div>
              <div className="bg-[#090D16] p-2 rounded-lg border border-[#1E2638]">
                <div className="text-[9px] text-slate-400 uppercase">System Design</div>
                <div className="text-xs font-bold text-indigo-400">{lastEvaluation.system_design_score || 80}%</div>
              </div>
              <div className="bg-[#090D16] p-2 rounded-lg border border-[#1E2638]">
                <div className="text-[9px] text-slate-400 uppercase">Communication</div>
                <div className="text-xs font-bold text-teal-400">{lastEvaluation.communication_score}%</div>
              </div>
              <div className="bg-[#090D16] p-2 rounded-lg border border-[#1E2638]">
                <div className="text-[9px] text-slate-400 uppercase">Confidence</div>
                <div className="text-xs font-bold text-purple-400">{lastEvaluation.confidence_score || 80}%</div>
              </div>
            </div>

            {lastEvaluation.feedback_snippet && (
              <p className="text-[11px] text-slate-300 bg-[#090D16] p-2.5 rounded-lg border border-[#1E2638] italic">
                "{lastEvaluation.feedback_snippet}"
              </p>
            )}
          </div>
        )}

        {/* Final Report Card Preview */}
        {finalReport && (
          <div className="bg-gradient-to-br from-[#121929] to-[#0A0E17] border border-emerald-500/30 rounded-xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Interview Complete</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  finalReport.hiring_recommendation === "Strong Hire"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : finalReport.hiring_recommendation === "Hire"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                }`}
              >
                {finalReport.hiring_recommendation}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400 font-mono">Overall Score</span>
              <span className="text-2xl font-bold text-white font-mono">{finalReport.overall_score} / 100</span>
            </div>

            <button
              onClick={onOpenReportModal}
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-600/20 transition-all"
            >
              View Detailed Structured Feedback
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
