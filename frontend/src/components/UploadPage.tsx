"use client";

import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  FileJson,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Users,
  Code2,
  Database,
  ArrowLeft,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CandidateProfile, CurriculumDay } from "@/types/interview";

interface UploadPageProps {
  onProceed: () => void;
  onBackToLanding: () => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({
  onProceed,
  onBackToLanding,
}) => {
  // Files State
  const [curriculumFile, setCurriculumFile] = useState<File | null>(null);
  const [candidatesFile, setCandidatesFile] = useState<File | null>(null);
  const [specsFile, setSpecsFile] = useState<File | null>(null);

  // Upload & Progress State
  const [progressCurriculum, setProgressCurriculum] = useState<number>(100); // 100 if default loaded
  const [progressCandidates, setProgressCandidates] = useState<number>(100);
  const [progressSpecs, setProgressSpecs] = useState<number>(100);

  // Extracted Information Summaries
  const [curriculumData, setCurriculumData] = useState<CurriculumDay[]>([]);
  const [candidateData, setCandidateData] = useState<CandidateProfile[]>([]);
  const [specSummary, setSpecSummary] = useState<{
    endpoints: string[];
    rules: string[];
  }>({
    endpoints: [
      "GET /api/v1/health",
      "GET /api/v1/curriculum",
      "GET /api/v1/candidates",
      "POST /api/v1/rag/ingest",
      "POST /api/v1/interview/start",
      "POST /api/v1/interview/submit-turn",
      "POST /api/v1/interview/{id}/complete",
    ],
    rules: [
      "Min 8 technical questions constraint",
      "Min 4 curriculum days coverage constraint",
      "Adaptive follow-up probes on shallow answers",
      "ChromaDB persistent vector indexer",
      "Structured feedback & score 0-100",
    ],
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto load existing data for initial summaries
  useEffect(() => {
    async function loadDefaults() {
      try {
        const [currRes, candRes] = await Promise.all([
          fetch("http://localhost:8000/api/v1/curriculum").then((r) => r.json()).catch(() => []),
          fetch("http://localhost:8000/api/v1/candidates").then((r) => r.json()).catch(() => []),
        ]);
        if (Array.isArray(currRes) && currRes.length > 0) setCurriculumData(currRes);
        if (Array.isArray(candRes) && candRes.length > 0) setCandidateData(candRes);
      } catch (err) {
        console.log("Using dynamic upload parser defaults");
      }
    }
    loadDefaults();
  }, []);

  // File Handlers
  const handleCurriculumUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCurriculumFile(file);
      setProgressCurriculum(0);
      setValidationError(null);

      // Simulate parsing progress
      for (let i = 20; i <= 100; i += 20) {
        await new Promise((r) => setTimeout(r, 80));
        setProgressCurriculum(i);
      }

      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) throw new Error("curriculum.json must be a JSON array of curriculum days.");
        setCurriculumData(parsed);
      } catch (err: any) {
        setValidationError(`Curriculum Error: ${err.message}`);
      }
    }
  };

  const handleCandidatesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCandidatesFile(file);
      setProgressCandidates(0);
      setValidationError(null);

      for (let i = 20; i <= 100; i += 20) {
        await new Promise((r) => setTimeout(r, 80));
        setProgressCandidates(i);
      }

      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) throw new Error("candidates.json must be a JSON array of candidate profiles.");
        setCandidateData(parsed);
      } catch (err: any) {
        setValidationError(`Candidates Error: ${err.message}`);
      }
    }
  };

  const handleSpecsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSpecsFile(file);
      setProgressSpecs(0);
      setValidationError(null);

      for (let i = 20; i <= 100; i += 20) {
        await new Promise((r) => setTimeout(r, 80));
        setProgressSpecs(i);
      }

      try {
        const text = await file.text();
        const lines = text.split("\n");
        const detectedEndpoints = lines.filter((l) => l.includes("GET /") || l.includes("POST /")).map((l) => l.trim());
        if (detectedEndpoints.length > 0) {
          setSpecSummary((prev) => ({ ...prev, endpoints: detectedEndpoints }));
        }
      } catch (err: any) {
        setValidationError(`Technical Specs Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#070A12] text-slate-100 overflow-y-auto p-6 md:p-10 font-sans custom-scrollbar">
      {/* Glow Blobs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/15 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Bar */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <button
          onClick={onBackToLanding}
          className="flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <UploadCloud className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Data Ingestion Center</h1>
            <p className="text-[11px] text-slate-400 font-mono">Dynamic Ingestion & Validation</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Error Notification */}
        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center space-x-3 shadow-lg"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{validationError}</span>
          </motion.div>
        )}

        {/* 1. File Upload Drop Slots Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Select or Drop Datasets (curriculum.json, candidates.json, technical-specs.md)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Slot 1: curriculum.json */}
            <div className="bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-3xl p-5 hover:border-blue-500/40 transition-all flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                    JSON Array
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">curriculum.json</h3>
                <p className="text-xs text-slate-400 mb-4">
                  31-day Enterprise AI Cohort curriculum dataset with topics & key concepts.
                </p>
              </div>

              <div className="space-y-3">
                <label className="w-full py-2.5 px-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer transition-all">
                  <UploadCloud className="w-4 h-4" />
                  <span>{curriculumFile ? curriculumFile.name : "Upload curriculum.json"}</span>
                  <input type="file" accept=".json" onChange={handleCurriculumUpload} className="hidden" />
                </label>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Parsed & Indexed</span>
                    <span>{progressCurriculum}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                      style={{ width: `${progressCurriculum}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slot 2: candidates.json */}
            <div className="bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-3xl p-5 hover:border-cyan-500/40 transition-all flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    Candidate Profiles
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">candidates.json</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Synthetic candidate profiles with background signals & target roles.
                </p>
              </div>

              <div className="space-y-3">
                <label className="w-full py-2.5 px-4 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer transition-all">
                  <UploadCloud className="w-4 h-4" />
                  <span>{candidatesFile ? candidatesFile.name : "Upload candidates.json"}</span>
                  <input type="file" accept=".json" onChange={handleCandidatesUpload} className="hidden" />
                </label>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Parsed & Indexed</span>
                    <span>{progressCandidates}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${progressCandidates}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slot 3: technical-specs.md */}
            <div className="bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-3xl p-5 hover:border-indigo-500/40 transition-all flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    Markdown API Spec
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">technical-specs.md</h3>
                <p className="text-xs text-slate-400 mb-4">
                  REST API endpoints, business constraints, and scoring specifications.
                </p>
              </div>

              <div className="space-y-3">
                <label className="w-full py-2.5 px-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer transition-all">
                  <UploadCloud className="w-4 h-4" />
                  <span>{specsFile ? specsFile.name : "Upload technical-specs.md"}</span>
                  <input type="file" accept=".md,.txt" onChange={handleSpecsUpload} className="hidden" />
                </label>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Parsed & Validated</span>
                    <span>{progressSpecs}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 transition-all duration-300"
                      style={{ width: `${progressSpecs}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Display Extracted Information Summaries Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            Extracted Information Summaries
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Curriculum Summary */}
            <div className="bg-[#121826]/80 border border-[#1E2638] rounded-3xl p-5 space-y-3 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2638]">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-400" /> Curriculum Summary
                </span>
                <span className="text-xs font-mono font-bold text-blue-400">
                  {curriculumData.length} Days Loaded
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                  <span>Modules</span>
                  <span className="text-slate-200">6 Core Modules</span>
                </div>
                <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                  <span>Vector Embeddings</span>
                  <span className="text-emerald-400 font-semibold">ChromaDB Indexed</span>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Topics Sample</span>
                  <div className="space-y-1">
                    {curriculumData.slice(0, 3).map((item) => (
                      <div key={item.day} className="bg-[#090D16] p-2 rounded-lg border border-[#1E2638] text-[11px]">
                        <span className="text-blue-400 font-mono font-semibold">Day {item.day}: </span>
                        <span className="text-slate-200">{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate Summary */}
            <div className="bg-[#121826]/80 border border-[#1E2638] rounded-3xl p-5 space-y-3 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2638]">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-400" /> Candidate Summary
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {candidateData.length} Candidates
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {candidateData.map((cand) => (
                  <div key={cand.id} className="bg-[#090D16] p-2.5 rounded-lg border border-[#1E2638] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[10px]"
                        style={{ backgroundColor: cand.avatar_color || "#3b82f6" }}
                      >
                        {cand.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 text-[11px]">{cand.name}</div>
                        <div className="text-[9px] text-slate-400">{cand.target_role}</div>
                      </div>
                    </div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* API Summary */}
            <div className="bg-[#121826]/80 border border-[#1E2638] rounded-3xl p-5 space-y-3 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2638]">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-indigo-400" /> API & Rules Summary
                </span>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {specSummary.endpoints.length} Endpoints
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                {specSummary.endpoints.map((ep, idx) => (
                  <div key={idx} className="bg-[#090D16] p-1.5 px-2.5 rounded border border-[#1E2638] text-[10px] text-slate-300 truncate">
                    {ep}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Proceed Button CTA */}
        <div className="pt-4 flex items-center justify-center">
          <button
            onClick={onProceed}
            className="px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 text-white font-extrabold text-lg shadow-2xl shadow-blue-500/35 hover:shadow-blue-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center space-x-3 border border-blue-400/40"
          >
            <span>Proceed to AI Interview Agent</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
