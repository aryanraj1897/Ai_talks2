"use client";

import React from "react";
import { FeedbackReport } from "@/types/interview";
import { X, Award, CheckCircle, AlertTriangle, BookOpen, Download, Shield, Sparkles, TrendingUp, Layers } from "lucide-react";
import { motion } from "framer-motion";

interface FeedbackReportModalProps {
  report: FeedbackReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackReportModal: React.FC<FeedbackReportModalProps> = ({
  report,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !report) return null;

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `interview_report_${report.candidate_name.replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case "Strong Hire":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "Hire":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      case "Weak Hire":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      default:
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
    }
  };

  const radarScores = report.charts_data?.radar_scores || [
    { subject: "Technical Knowledge", score: report.technical_knowledge || report.overall_score },
    { subject: "Communication", score: report.communication || 85 },
    { subject: "Problem Solving", score: report.problem_solving || 80 },
    { subject: "System Design", score: report.system_design || 78 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] bg-[#0D111A] border border-[#1E2638] rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans text-slate-200"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#1E2638] bg-[#090D16] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Structured Interview Evaluation Report
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {report.candidate_name} • {report.target_role}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 rounded-lg bg-[#1E2638] hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center space-x-1.5 transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Top Score Banner & Recommendation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#121826] border border-[#1E2638] rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Overall Score</span>
              <div className="text-4xl font-extrabold text-white font-mono my-2">{report.overall_score} / 100</div>
              <p className="text-[11px] text-slate-400">
                Across {report.total_questions_asked} turns & {report.curriculum_days_covered?.length} curriculum days
              </p>
            </div>

            <div className="bg-[#121826] border border-[#1E2638] rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Hiring Recommendation</span>
              <div className="my-2">
                <span
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-bold border ${getRecommendationBadge(
                    report.hiring_recommendation
                  )}`}
                >
                  <Shield className="w-4 h-4" />
                  <span>{report.hiring_recommendation}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Based on technical depth & system design score</p>
            </div>

            <div className="bg-[#121826] border border-[#1E2638] rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Curriculum Coverage</span>
              <div className="text-2xl font-bold text-cyan-400 font-mono my-2">
                {report.curriculum_days_covered?.length || 0} / 31 Days
              </div>
              <div className="flex flex-wrap gap-1">
                {report.curriculum_days_covered?.map((d) => (
                  <span key={d} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300">
                    Day {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Chart Visualizations Section */}
          <div className="bg-[#121826] border border-[#1E2638] rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Score Distribution & Performance Charts
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Radar Bar Scores Chart */}
              <div className="space-y-3 bg-[#090D16] p-4 rounded-xl border border-[#1E2638]">
                <span className="text-xs font-mono text-slate-400">4-Axis Competency Scores</span>
                {radarScores.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">{item.subject}</span>
                      <span className="text-cyan-400 font-bold">{item.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Topic Breakdown Progress */}
              <div className="space-y-3 bg-[#090D16] p-4 rounded-xl border border-[#1E2638] flex flex-col justify-between">
                <span className="text-xs font-mono text-slate-400">Topic-by-Topic Performance</span>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {report.topic_breakdown?.map((tb, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-[#121826] border border-[#1E2638]">
                      <div className="truncate max-w-[180px]">
                        <span className="font-mono text-cyan-400 text-[10px] mr-1.5">Day {tb.day}</span>
                        <span className="text-slate-200">{tb.topic}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 text-xs">{tb.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Qualitative Feedback Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-[#121826] border border-[#1E2638] rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 uppercase">
                <CheckCircle className="w-4 h-4" /> Demonstrated Strengths
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {report.strengths?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-[#121826] border border-[#1E2638] rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 uppercase">
                <AlertTriangle className="w-4 h-4" /> Areas for Improvement
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {report.weaknesses?.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Missed Topics */}
            <div className="bg-[#121826] border border-[#1E2638] rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5 uppercase">
                <Layers className="w-4 h-4" /> Missed Topics
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {report.missed_topics?.map((mt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{mt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Revision */}
            <div className="bg-[#121826] border border-[#1E2638] rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5 uppercase">
                <BookOpen className="w-4 h-4" /> Recommended Revision Plan
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {report.recommended_revision?.map((rr, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{rr}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Overall Summary Narrative */}
          <div className="bg-[#121826] border border-[#1E2638] rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Executive Interview Summary
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed italic bg-[#090D16] p-3 rounded-lg border border-[#1E2638]">
              "{report.overall_summary}"
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
