"use client";

import React, { useState } from "react";
import { Send, Code, Terminal, Sparkles, CornerDownLeft } from "lucide-react";

interface CodeEditorProps {
  onSubmitAnswer: (answer: string) => void;
  isDisabled: boolean;
  isInterviewComplete: boolean;
  currentTurn: number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  onSubmitAnswer,
  isDisabled,
  isInterviewComplete,
  currentTurn,
}) => {
  const [answerText, setAnswerText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() || isDisabled) return;
    onSubmitAnswer(answerText);
    setAnswerText("");
  };

  const handleInsertSnippet = (snippet: string) => {
    setAnswerText((prev) => (prev ? `${prev}\n${snippet}` : snippet));
  };

  return (
    <div className="bg-[#0A0E17] border-t border-[#1E2638] p-4 flex flex-col gap-2.5">
      {/* Quick Snippet Helpers (Cursor style) */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-mono text-[11px]">Answer Console (Turn #{currentTurn})</span>
        </div>
        <div className="flex items-center space-x-1.5 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => handleInsertSnippet("```python\n# Implementation & Architecture\n```")}
            className="px-2 py-0.5 rounded bg-[#161F33] hover:bg-[#1E2C48] text-slate-300 border border-slate-700 transition-colors"
          >
            + Code Snippet
          </button>
          <button
            type="button"
            onClick={() => handleInsertSnippet("**Trade-off Analysis:**\n- Latency vs Recall:\n- Memory footprint:")}
            className="px-2 py-0.5 rounded bg-[#161F33] hover:bg-[#1E2C48] text-slate-300 border border-slate-700 transition-colors"
          >
            + Trade-offs Template
          </button>
        </div>
      </div>

      {/* Textarea Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          rows={3}
          disabled={isDisabled || isInterviewComplete}
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder={
            isInterviewComplete
              ? "Interview session completed. Review feedback report on right panel."
              : "Type candidate technical answer here (markdown code blocks supported)..."
          }
          className="w-full bg-[#121826] text-slate-100 placeholder-slate-500 rounded-xl p-3.5 border border-[#1E2638] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-xs leading-relaxed resize-none custom-scrollbar"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              handleSubmit(e);
            }
          }}
        />

        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[10px] text-slate-500 font-mono">
            Press <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">Ctrl + Enter</kbd> to submit
          </span>

          <button
            type="submit"
            disabled={!answerText.trim() || isDisabled || isInterviewComplete}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center space-x-1.5 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span>Submit Turn</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
