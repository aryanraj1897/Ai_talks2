"use client";

import React from "react";
import { ParticleBackground } from "./ParticleBackground";
import {
  Sparkles,
  Bot,
  Database,
  Layers,
  ArrowRight,
  UploadCloud,
  ShieldCheck,
  Zap,
  Terminal,
  Cpu,
  BrainCircuit,
  BarChart3,
  Award,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

interface LandingHeroProps {
  onStartInterview: () => void;
  onOpenUploadModal: () => void;
  onUploadFiles?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartInterview,
  onOpenUploadModal,
}) => {
  return (
    <div className="relative min-h-screen w-full bg-[#070A12] text-slate-100 overflow-x-hidden flex flex-col justify-between selection:bg-blue-500 selection:text-white font-sans">
      {/* Background Animated Particles */}
      <ParticleBackground />

      {/* Radiant Background Glow Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/20 to-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-3/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-indigo-600/15 to-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Glassmorphic Navigation Header */}
      <header className="relative z-10 w-full px-6 py-4 border-b border-white/10 bg-[#070A12]/60 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/25">
            <div className="w-full h-full bg-[#090D16] rounded-2xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight">ABTalks AI</span>
            <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300">
              Cohort Agent
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-300">
          <span className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer transition-colors">
            <BrainCircuit className="w-4 h-4 text-cyan-400" /> LangGraph Architecture
          </span>
          <span className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer transition-colors">
            <Database className="w-4 h-4 text-blue-400" /> ChromaDB RAG
          </span>
          <span className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer transition-colors">
            <Zap className="w-4 h-4 text-amber-400" /> Redis Memory
          </span>
        </div>

        <button
          onClick={onStartInterview}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center space-x-1.5"
        >
          <span>Launch Platform</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Hero Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 pt-16 pb-24 flex flex-col items-center justify-center text-center">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-inner"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-mono text-slate-300">
            ABTalks AI Cohort Hackathon • Production Agent
          </span>
        </motion.div>

        {/* Hero Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]"
        >
          AI Interview Agent
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-blue-200 to-cyan-300 max-w-3xl font-medium mb-10 leading-relaxed"
        >
          Personalized Enterprise AI Engineering Interviews
        </motion.p>

        {/* Hero CTA Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-16"
        >
          {/* Start Interview CTA Button */}
          <button
            onClick={onStartInterview}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 text-white font-bold text-base shadow-2xl shadow-blue-500/35 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 group border border-blue-400/30"
          >
            <span>Start Interview</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Upload Files CTA Button */}
          <button
            onClick={onOpenUploadModal}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-base border border-white/15 backdrop-blur-xl hover:border-blue-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 shadow-lg"
          >
            <UploadCloud className="w-5 h-5 text-cyan-400" />
            <span>Upload Files</span>
          </button>
        </motion.div>

        {/* Feature Cards Grid (Glassmorphism + Glow) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left"
        >
          {/* Feature 1 */}
          <div className="group relative p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl hover:border-blue-500/40 hover:bg-white/[0.06] transition-all shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">ChromaDB Vector RAG</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamically embeds 31 curriculum days into HNSW vector index for high-precision document retrieval.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group relative p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl hover:border-cyan-500/40 hover:bg-white/[0.06] transition-all shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">LangGraph State Machine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enforces 8+ question minimums, 4+ curriculum days, adaptive follow-up probes, and session memory.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group relative p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl hover:border-indigo-500/40 hover:bg-white/[0.06] transition-all shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Structured Evaluation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates 0–100 numerical score, detailed topic breakdown, and hiring recommendation reports.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Professional Responsive Footer */}
      <footer className="relative z-10 w-full border-t border-white/10 bg-[#05070E] px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              AB
            </div>
            <span className="font-mono text-slate-300">
              ABTalks AI Cohort Hackathon © 2026
            </span>
          </div>

          <div className="flex items-center space-x-6 font-mono text-[11px]">
            <span className="hover:text-blue-400 transition-colors">FastAPI</span>
            <span className="text-slate-600">•</span>
            <span className="hover:text-blue-400 transition-colors">LangGraph</span>
            <span className="text-slate-600">•</span>
            <span className="hover:text-blue-400 transition-colors">OpenAI GPT-4o</span>
            <span className="text-slate-600">•</span>
            <span className="hover:text-blue-400 transition-colors">ChromaDB</span>
            <span className="text-slate-600">•</span>
            <span className="hover:text-blue-400 transition-colors">Next.js 15</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
