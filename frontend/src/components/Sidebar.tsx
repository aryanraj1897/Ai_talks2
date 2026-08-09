"use client";

import React, { useState } from "react";
import { CandidateProfile, CurriculumDay } from "@/types/interview";
import { Users, BookOpen, Database, Sparkles, CheckCircle2, ChevronRight, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  candidates: CandidateProfile[];
  selectedCandidate: CandidateProfile | null;
  onSelectCandidate: (candidate: CandidateProfile) => void;
  curriculum: CurriculumDay[];
  vectorDocCount: number;
  activeTab: "candidates" | "curriculum";
  setActiveTab: (tab: "candidates" | "curriculum") => void;
  isInterviewInProgress: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  candidates,
  selectedCandidate,
  onSelectCandidate,
  curriculum,
  vectorDocCount,
  activeTab,
  setActiveTab,
  isInterviewInProgress,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCurriculum = curriculum.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.key_concepts.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <aside className="w-80 h-screen bg-[#0D111A] border-r border-[#1E2638] flex flex-col select-none text-slate-300">
      {/* Brand Header (Linear Style) */}
      <div className="p-4 border-b border-[#1E2638] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-white text-sm tracking-wide">ABTalks AI</h1>
            <p className="text-[11px] text-slate-400 font-mono">Interview Agent v1.0</p>
          </div>
        </div>

        {/* Vector DB ChromaDB Live Status Badge */}
        <div className="flex items-center space-x-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
          <Database className="w-3 h-3 animate-pulse" />
          <span>Chroma: {vectorDocCount}</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex border-b border-[#1E2638] bg-[#090D16] p-1 gap-1">
        <button
          onClick={() => setActiveTab("candidates")}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === "candidates"
              ? "bg-[#1E2638] text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#121826]"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Candidates</span>
        </button>
        <button
          onClick={() => setActiveTab("curriculum")}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === "curriculum"
              ? "bg-[#1E2638] text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#121826]"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Curriculum ({curriculum.length})</span>
        </button>
      </div>

      {/* Tab Content List */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {activeTab === "candidates" && (
          <div className="space-y-2">
            <div className="px-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Select Candidate Profile
            </div>
            {candidates.map((cand) => {
              const isSelected = selectedCandidate?.id === cand.id;
              return (
                <button
                  key={cand.id}
                  disabled={isInterviewInProgress}
                  onClick={() => onSelectCandidate(cand)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                    isSelected
                      ? "bg-[#161F33] border-blue-500/50 shadow-lg shadow-blue-500/10 text-white"
                      : "bg-[#090D16]/60 border-[#1E2638] hover:border-slate-700 hover:bg-[#121826] text-slate-300"
                  } ${isInterviewInProgress ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-md"
                        style={{ backgroundColor: cand.avatar_color || "#3b82f6" }}
                      >
                        {cand.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-xs text-white">{cand.name}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {cand.target_role}
                        </div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>

                  <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {cand.bio}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {cand.learning_signals?.strongest_domains?.slice(0, 2).map((domain, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono"
                      >
                        {domain}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {activeTab === "curriculum" && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search 31-day topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090D16] border border-[#1E2638] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />

            <div className="space-y-2">
              {filteredCurriculum.map((day) => (
                <div
                  key={day.day}
                  className="p-2.5 rounded-lg bg-[#090D16]/70 border border-[#1E2638] hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[10px] text-blue-400 font-semibold">
                      DAY {day.day}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {day.difficulty}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-slate-200 mb-1">{day.title}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2">{day.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#1E2638] bg-[#090D16] text-[10px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center space-x-1 font-mono">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>FastAPI + LangGraph</span>
        </span>
        <span className="font-mono">ABTalks Hackathon</span>
      </div>
    </aside>
  );
};
