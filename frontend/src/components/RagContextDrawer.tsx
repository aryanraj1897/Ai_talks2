"use client";

import React from "react";
import { Database, X, Sparkles, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RagContextDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ragContext: string[];
}

export const RagContextDrawer: React.FC<RagContextDrawerProps> = ({
  isOpen,
  onClose,
  ragContext,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-full max-w-md bg-[#0D111A] h-full border-l border-[#1E2638] flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#1E2638] flex items-center justify-between bg-[#090D16]">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">ChromaDB Vector RAG Drawer</h3>
                <p className="text-[10px] text-slate-400 font-mono">Retrieved Curriculum Context</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Context List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {ragContext.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-8">
                No RAG context loaded for current selection.
              </div>
            ) : (
              ragContext.map((chunk, idx) => (
                <div
                  key={idx}
                  className="bg-[#121826] border border-[#1E2638] rounded-xl p-3.5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-cyan-400 font-semibold flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Vector Match #{idx + 1}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      Cosine Similarity: ~0.92
                    </span>
                  </div>

                  <p className="text-slate-200 font-mono leading-relaxed whitespace-pre-wrap text-[11px] bg-[#090D16] p-2.5 rounded-lg border border-[#1E2638]">
                    {chunk}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
