"use client";

import React, { useRef, useEffect } from "react";
import { QuestionTurn, QuestionDetail, CandidateProfile } from "@/types/interview";
import { Bot, User, Sparkles, AlertCircle, Layers, Database, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatConsoleProps {
  candidate: CandidateProfile | null;
  turns: QuestionTurn[];
  currentQuestion: QuestionDetail | null;
  isLoading: boolean;
  onToggleRagDrawer: (ragContext: string[]) => void;
}

export const ChatConsole: React.FC<ChatConsoleProps> = ({
  candidate,
  turns,
  currentQuestion,
  isLoading,
  onToggleRagDrawer,
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, currentQuestion, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0F17] overflow-hidden">
      {/* Header Banner */}
      <div className="px-6 py-3 border-b border-[#1E2638] bg-[#0E131F]/90 backdrop-blur flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-semibold text-white">AI Technical Interviewer</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono">
                GPT-4o + RAG
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interpreting curriculum & candidate background in real-time
            </p>
          </div>
        </div>

        {/* Audio Waveform Animation Visualizer */}
        <div className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#161D2F] border border-[#232D42]">
          <span className="text-[10px] font-mono text-slate-400 mr-1.5">LIVE AUDIO WAVES</span>
          <div className="flex items-center gap-0.5 h-4">
            <span className="w-0.5 h-full bg-blue-500 animate-[bounce_1s_infinite_100ms]"></span>
            <span className="w-0.5 h-full bg-cyan-400 animate-[bounce_1s_infinite_200ms]"></span>
            <span className="w-0.5 h-full bg-indigo-500 animate-[bounce_1s_infinite_300ms]"></span>
            <span className="w-0.5 h-full bg-blue-400 animate-[bounce_1s_infinite_150ms]"></span>
          </div>
        </div>
      </div>

      {/* Main Conversation Stream (ChatGPT style) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {turns.length === 0 && !currentQuestion && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Ready to Conduct Technical Interview
            </h3>
            <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
              Select candidate <span className="text-blue-400 font-semibold">{candidate?.name || "Profile"}</span> from the sidebar and click <span className="text-white font-medium">"Start Technical Interview"</span> to initiate dynamic RAG questioning.
            </p>
          </div>
        )}

        {/* Previous Turns */}
        {turns.map((turn, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* AI Question Message */}
            <div className="flex items-start space-x-3.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1 bg-[#121826] border border-[#1E2638] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-blue-400 font-mono">
                      Q{turn.turn_index} • Day {turn.question.day} ({turn.question.topic})
                    </span>
                    {turn.question.is_followup && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Adaptive Follow-up
                      </span>
                    )}
                  </div>
                  {turn.question.rag_context?.length > 0 && (
                    <button
                      onClick={() => onToggleRagDrawer(turn.question.rag_context)}
                      className="text-[10px] text-slate-400 hover:text-blue-400 flex items-center space-x-1 font-mono transition-colors"
                    >
                      <Database className="w-3 h-3 text-cyan-400" />
                      <span>RAG Chunks</span>
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-100 leading-relaxed font-normal">
                  {turn.question.question}
                </p>
              </div>
            </div>

            {/* Candidate Answer Message */}
            <div className="flex items-start justify-end space-x-3.5">
              <div className="flex-1 bg-[#161F33] border border-blue-500/30 rounded-2xl p-4 text-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-300">
                    {candidate?.name || "Candidate"} Response
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-100">
                  {turn.candidate_answer}
                </p>

                {/* Turn Evaluation Feedback Badge */}
                {turn.evaluation && (
                  <div className="mt-3 pt-3 border-t border-[#232F4A] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center space-x-3">
                      <span className="text-emerald-400">
                        Accuracy: {turn.evaluation.technical_accuracy}%
                      </span>
                      <span className="text-blue-400">
                        Depth: {turn.evaluation.depth_score}%
                      </span>
                    </div>
                    <span className="text-slate-400 italic text-[11px]">
                      "{turn.evaluation.feedback_snippet}"
                    </span>
                  </div>
                )}
              </div>

              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0 mt-0.5 shadow-md"
                style={{ backgroundColor: candidate?.avatar_color || "#3b82f6" }}
              >
                {candidate?.name.charAt(0) || "C"}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Current Active Question */}
        {currentQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-3.5"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1 bg-[#121826] border border-blue-500/40 rounded-2xl p-5 shadow-lg shadow-blue-500/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-blue-400 font-mono">
                    Active Q{turns.length + 1} • Day {currentQuestion.day} ({currentQuestion.topic})
                  </span>
                  {currentQuestion.is_followup && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Adaptive Follow-up
                    </span>
                  )}
                </div>
                {currentQuestion.rag_context?.length > 0 && (
                  <button
                    onClick={() => onToggleRagDrawer(currentQuestion.rag_context)}
                    className="text-[10px] text-slate-400 hover:text-blue-400 flex items-center space-x-1 font-mono transition-colors"
                  >
                    <Database className="w-3 h-3 text-cyan-400" />
                    <span>View RAG Context ({currentQuestion.rag_context.length})</span>
                  </button>
                )}
              </div>

              <p className="text-base text-white leading-relaxed font-medium mb-3">
                {currentQuestion.question}
              </p>

              <div className="text-xs text-slate-400 font-mono bg-[#090D16] p-2.5 rounded-lg border border-[#1E2638]">
                <span className="text-blue-400 font-semibold">Rationale: </span>
                {currentQuestion.rationale}
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-3 text-blue-400 text-xs font-mono p-4 bg-[#121826] rounded-xl border border-[#1E2638] w-fit">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
            <span>LangGraph Agent evaluating response & retrieving vector context...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>
    </div>
  );
};
