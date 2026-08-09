"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle, FileText, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (message: string) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"curriculum" | "candidates">("curriculum");
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setStatusMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setStatusMessage(null);

    try {
      const text = await selectedFile.text();
      const parsed = JSON.parse(text);

      // Verify basic JSON array structure
      if (!Array.isArray(parsed)) {
        throw new Error("Uploaded file must contain a valid JSON array.");
      }

      // Simulated dynamic ingest
      setTimeout(() => {
        setIsUploading(false);
        onUploadSuccess(`Successfully parsed dynamic ${fileType}.json! (${parsed.length} items loaded)`);
        onClose();
      }, 1000);
    } catch (err: any) {
      setIsUploading(false);
      setStatusMessage(`Validation Error: ${err.message || "Invalid JSON file"}`);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-[#0F1626]/90 border border-blue-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative text-slate-200"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Dynamic Data Ingestion</h3>
              <p className="text-xs text-slate-400 font-mono">
                Upload custom curriculum.json or candidates.json
              </p>
            </div>
          </div>

          {/* Target Selector */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Select Dataset Target
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFileType("curriculum")}
                className={`py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                  fileType === "curriculum"
                    ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10"
                    : "bg-[#090D16] border-[#1E2638] text-slate-400 hover:border-slate-700"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>curriculum.json</span>
              </button>

              <button
                type="button"
                onClick={() => setFileType("candidates")}
                className={`py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                  fileType === "candidates"
                    ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10"
                    : "bg-[#090D16] border-[#1E2638] text-slate-400 hover:border-slate-700"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>candidates.json</span>
              </button>
            </div>
          </div>

          {/* Drag & Drop File Input */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Upload JSON File
            </label>
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-[#232F4A] hover:border-blue-500/50 rounded-2xl cursor-pointer bg-[#090D16]/60 hover:bg-[#121826] transition-all group p-4">
              <UploadCloud className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-slate-300">
                {selectedFile ? selectedFile.name : "Click to browse or drag & drop .json file"}
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-1">
                Parsed dynamically into ChromaDB & Agent Memory
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!selectedFile || isUploading}
              onClick={handleUpload}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isUploading ? (
                <span>Parsing & Indexing...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Parse & Index Dataset</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
