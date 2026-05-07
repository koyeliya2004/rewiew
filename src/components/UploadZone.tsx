import { motion } from "motion/react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import React, { useState, useCallback } from "react";
import { cn } from "../lib/utils";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
}

export default function UploadZone({ onFileSelect, isAnalyzing }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setError(null);
        onFileSelect(file);
      } else {
        setError("Please upload a PDF file.");
      }
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setError(null);
        onFileSelect(file);
      } else {
        setError("Please upload a PDF file.");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        className={cn(
          "relative group border-2 border-dashed rounded-3xl p-12 transition-all duration-300 flex flex-col items-center justify-center gap-6",
          dragActive 
            ? "border-orange-500 bg-orange-50/50 scale-[1.02]" 
            : "border-gray-200 hover:border-gray-300 bg-white shadow-sm hover:shadow-md",
          isAnalyzing && "opacity-50 pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-300",
          dragActive ? "bg-orange-100" : "bg-gray-50 group-hover:bg-gray-100"
        )}>
          {isAnalyzing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <Upload className="w-10 h-10 text-orange-500" />
            </motion.div>
          ) : (
            <Upload className={cn(
              "w-10 h-10 transition-colors duration-300",
              dragActive ? "text-orange-500" : "text-gray-400"
            )} />
          )}
        </div>

        <div className="text-center">
          <h3 className="text-xl font-medium tracking-tight text-gray-900 mb-2">
            {isAnalyzing ? "Analyzing your profile..." : "Upload your resume"}
          </h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Drop your PDF here or click to browse. Let Gemini craft your competitive edge.
          </p>
        </div>

        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleChange}
            disabled={isAnalyzing}
          />
          <div className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-black transition-colors">
            Select File
          </div>
        </label>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-full"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-40 group-hover:opacity-60 transition-opacity">
          <FileText className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-widest font-bold">PDF Format Only</span>
        </div>
      </div>
    </motion.div>
  );
}
