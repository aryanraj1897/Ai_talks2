"use client";

import React, { useState } from "react";
import { FeedbackReport, CandidateProfile, InterviewProgress } from "@/types/interview";
import {
  Award,
  TrendingUp,
  Shield,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  PieChart,
  Activity,
  Layers,
  ArrowLeft,
  Download,
  Target,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

interface DashboardViewProps {
  candidate: CandidateProfile | null;
  report: FeedbackReport | null;
  progress: InterviewProgress;
  onBackToInterview: () => void;
  onExportJSON: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  candidate,
  report,
  progress,
  onBackToInterview,
  onExportJSON,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "breakdown" | "revision">("overview");

  // Fallback demo metrics if report is not yet finalized
  const overallScore = report?.overall_score || 82;
  const hiringRec = report?.hiring_recommendation || "Hire";
  const techKnowledge = report?.technical_knowledge || 85;
  const sysDesign = report?.system_design || 78;
  const probSolving = report?.problem_solving || 84;
  const comms = report?.communication || 88;

  const coveragePercent = Math.round(((progress.days_count || 4) / 31) * 100);
  const questionsPercent = Math.min(100, Math.round(((progress.total_questions_asked || 8) / 8) * 100));

  // Circular Progress Gauge Circumference
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const scoreStroke = circumference - (overallScore / 100) * circumference;
  const coverageStroke = circumference - (coveragePercent / 100) * circumference;

  const radarData = [
    { label: "Technical", val: techKnowledge },
    { label: "System Design", val: sysDesign },
    { label: "Problem Solving", val: probSolving },
    { label: "Communication", val: comms },
    { label: "Code Proficiency", val: 86 },
    { label: "Confidence", val: 82 },
  ];

  return (
    <div className="w-full min-h-screen bg-[#070A10] text-slate-100 p-6 space-y-6 font-sans select-none">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#090D16] border border-[#1E2638] rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToInterview}
            className="p-2.5 rounded-xl bg-[#121826] hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-[#1E2638]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-wide">Enterprise Analytics Dashboard</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono">
                AI Interviewer v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Candidate: {candidate?.name || "Anshu Pathak"} • {candidate?.target_role || "Senior AI Engineer"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onExportJSON}
            className="px-4 py-2.5 rounded-xl bg-[#121826] hover:bg-slate-800 text-slate-200 text-xs font-mono flex items-center space-x-2 border border-[#1E2638] transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Report JSON</span>
          </button>

          <button
            onClick={onBackToInterview}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all"
          >
            Return to Interview Room
          </button>
        </div>
      </div>

      {/* Top Gauges & Hiring Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Gauge 1: Overall Score Circular Progress */}
        <div className="bg-[#090D16] border border-[#1E2638] rounded-2xl p-5 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Overall Score</span>
            <div className="text-3xl font-extrabold text-white font-mono my-1">{overallScore} / 100</div>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> High Competency
            </span>
          </div>

          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r={radius} stroke="#1E2638" strokeWidth="6" fill="transparent" />
              <motion.circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#10B981"
                strokeWidth="6"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: scoreStroke }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute font-mono text-xs font-bold text-white">{overallScore}%</span>
          </div>
        </div>

        {/* Gauge 2: Knowledge Coverage Circular Progress */}
        <div className="bg-[#090D16] border border-[#1E2638] rounded-2xl p-5 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Knowledge Coverage</span>
            <div className="text-3xl font-extrabold text-cyan-400 font-mono my-1">
              {progress.days_count || 4} / 31 Days
            </div>
            <span className="text-[11px] text-cyan-300 font-mono">Curriculum Coverage</span>
          </div>

          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r={radius} stroke="#1E2638" strokeWidth="6" fill="transparent" />
              <motion.circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#06B6D4"
                strokeWidth="6"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: coverageStroke }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute font-mono text-xs font-bold text-white">{coveragePercent}%</span>
          </div>
        </div>

        {/* Gauge 3: Question Turns Metric */}
        <div className="bg-[#090D16] border border-[#1E2638] rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Question Turns</span>
          <div className="text-3xl font-extrabold text-indigo-400 font-mono my-1">
            {progress.total_questions_asked || 8} Turns
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${questionsPercent}%` }}
            />
          </div>
        </div>

        {/* Hiring Recommendation Badge Card */}
        <div className="bg-gradient-to-br from-[#121826] to-[#0A0E17] border border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-2xl">
          <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Hiring Recommendation</span>
          <div className="my-1">
            <span
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold border ${
                hiringRec === "Strong Hire"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-500/20"
                  : hiringRec === "Hire"
                  ? "bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-lg shadow-blue-500/20"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/50"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>{hiringRec}</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Engineered for Enterprise Hiring decisions</p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SVG Radar Chart Visualization */}
        <div className="bg-[#090D16] border border-[#1E2638] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              6-Axis Competency Radar Chart
            </h3>
            <span className="text-xs font-mono text-cyan-400">Multi-Dimensional Evaluation</span>
          </div>

          <div className="relative w-full h-72 flex items-center justify-center">
            {/* SVG Radar Polygon Graph */}
            <svg className="w-full h-full max-w-sm" viewBox="0 0 200 200">
              {/* Radar Background Grids */}
              <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" fill="none" stroke="#1E2638" strokeWidth="1" />
              <polygon points="100,45 147,72 147,127 100,155 53,127 53,72" fill="none" stroke="#1E2638" strokeWidth="1" />
              <polygon points="100,70 125,85 125,115 100,130 75,115 75,85" fill="none" stroke="#1E2638" strokeWidth="1" />

              {/* Axis Lines */}
              <line x1="100" y1="100" x2="100" y2="20" stroke="#1E2638" strokeWidth="1" />
              <line x1="100" y1="100" x2="170" y2="60" stroke="#1E2638" strokeWidth="1" />
              <line x1="100" y1="100" x2="170" y2="140" stroke="#1E2638" strokeWidth="1" />
              <line x1="100" y1="100" x2="100" y2="180" stroke="#1E2638" strokeWidth="1" />
              <line x1="100" y1="100" x2="30" y2="140" stroke="#1E2638" strokeWidth="1" />
              <line x1="100" y1="100" x2="30" y2="60" stroke="#1E2638" strokeWidth="1" />

              {/* Filled Candidate Score Radar Polygon */}
              <motion.polygon
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.8, scale: 1 }}
                transition={{ duration: 1.0 }}
                points="100,32 158,68 155,132 100,165 42,130 40,68"
                fill="url(#radarGradient)"
                stroke="#06B6D4"
                strokeWidth="2"
              />

              <defs>
                <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs">
            {radarData.map((d, i) => (
              <div key={i} className="bg-[#121826] p-2 rounded-lg border border-[#1E2638]">
                <span className="text-[10px] text-slate-400 uppercase block">{d.label}</span>
                <span className="font-bold text-cyan-400 text-sm">{d.val}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Competency Bar Chart Breakdown */}
        <div className="bg-[#090D16] border border-[#1E2638] rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Competency Bar Chart Performance
            </h3>
            <span className="text-xs font-mono text-slate-400">Score Metrics</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Technical Knowledge</span>
                <span className="text-emerald-400 font-bold">{techKnowledge}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${techKnowledge}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">System Design & Scalability</span>
                <span className="text-blue-400 font-bold">{sysDesign}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${sysDesign}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Problem Solving & Trade-offs</span>
                <span className="text-indigo-400 font-bold">{probSolving}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${probSolving}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Communication & Articulation</span>
                <span className="text-cyan-400 font-bold">{comms}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${comms}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-400"
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#121826] border border-[#1E2638] text-xs text-slate-300 italic">
            "Candidate exhibits high technical mastery with minimal hesitation. Strong architectural instincts."
          </div>
        </div>
      </div>

      {/* Qualitative Feedback Sections: Strengths, Weaknesses, Recommended Topics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths Card */}
        <div className="bg-[#090D16] border border-[#1E2638] rounded-2xl p-5 space-y-3 shadow-xl">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Key Strengths
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {(report?.strengths || [
              "Deep understanding of HNSW & IVF vector indexing trade-offs.",
              "Articulate explanation of RAG prompt compression techniques.",
              "Strong system design principles under high concurrency."
            ]).map((s, i) => (
              <li key={i} className="flex items-start gap-2 bg-[#121826] p-2.5 rounded-lg border border-[#1E2638]">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses Card */}
        <div className="bg-[#090D16] border border-[#1E2638] rounded-2xl p-5 space-y-3 shadow-xl">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Areas for Growth
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {(report?.weaknesses || [
              "Could elaborate further on mathematical proofs for vector space complexity.",
              "Review GPU VRAM memory fragmentation strategies during batch inference."
            ]).map((w, i) => (
              <li key={i} className="flex items-start gap-2 bg-[#121826] p-2.5 rounded-lg border border-[#1E2638]">
                <span className="text-amber-400 font-bold">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Topics Card */}
        <div className="bg-[#090D16] border border-[#1E2638] rounded-2xl p-5 space-y-3 shadow-xl">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Recommended Revision Topics
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {(report?.recommended_revision || [
              "Day 24: Distributed Training & vLLM Optimization",
              "Day 18: Advanced Prompt Injection Defense & Guardrails"
            ]).map((r, i) => (
              <li key={i} className="flex items-start gap-2 bg-[#121826] p-2.5 rounded-lg border border-[#1E2638]">
                <span className="text-indigo-400 font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
