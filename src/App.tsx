/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowLeft, RotateCcw, AlertTriangle, X } from "lucide-react";
import UploadZone from "./components/UploadZone";
import AnalysisDashboard from "./components/AnalysisDashboard";
import { ParticleBackground } from "./components/ParticleBackground";
import { analyzeResume } from "./lib/ai";
import { extractTextFromPdf } from "./lib/utils";
import { AnalysisResult, AppState } from "./types";

export default function App() {
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>(() => {
    try {
      const saved = localStorage.getItem("careerpulse_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleFileSelect = async (file: File) => {
    try {
      setState("analyzing");
      const text = await extractTextFromPdf(file);
      const output = await analyzeResume(text);
      
      // Save to history
      const newHistory = [output, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem("careerpulse_history", JSON.stringify(newHistory));
      
      setResult(output);
      setState("results");
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("error");
    }
  };

  const reset = () => {
    setState("idle");
    setResult(null);
    setErrorMsg(null);
  };

  const loadFromHistory = (item: AnalysisResult) => {
    setResult(item);
    setState("results");
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden relative">
      <ParticleBackground />
      {/* Visual background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 px-6 py-8 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={reset}>
          <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300 shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-none text-gray-900">CareerPulse</h1>
            <span className="text-[10px] uppercase tracking-widest font-black opacity-30">AI Solutions</span>
          </div>
        </div>

        <nav className="flex items-center gap-4 md:gap-8">
           <button 
             onClick={() => setShowHowItWorks(true)}
             className="text-sm font-medium hover:text-orange-500 transition-colors"
           >
             How it works
           </button>
           <div className="h-4 w-[1px] bg-gray-200 hidden sm:block"></div>
           <button 
             onClick={() => setShowHistory(true)}
             className="px-5 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
           >
             <RotateCcw className="w-4 h-4 text-gray-400" />
             History
           </button>
        </nav>
      </header>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowHistory(false)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
             >
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-2xl font-bold tracking-tight">Scan History</h3>
                   <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
                </div>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                   {history.length > 0 ? history.map((item, i) => (
                     <button 
                       key={i}
                       onClick={() => loadFromHistory(item)}
                       className="w-full text-left p-4 rounded-3xl bg-gray-50 hover:bg-orange-50 border border-transparent hover:border-orange-100 transition-all flex items-center justify-between group"
                     >
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center font-bold text-orange-500 shadow-sm group-hover:scale-110 transition-transform">
                              {item.score}
                           </div>
                           <div className="max-w-[200px]">
                              <p className="font-semibold text-gray-900 truncate">{item.summary}</p>
                              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Analysis Result</p>
                           </div>
                        </div>
                        <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-orange-500 rotate-180 transition-colors" />
                     </button>
                   )) : (
                     <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                           <RotateCcw className="w-8 h-8" />
                        </div>
                        <p className="text-gray-400 font-medium">No previous scans found</p>
                     </div>
                   )}
                </div>
             </motion.div>
          </div>
        )}

        {showHowItWorks && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowHowItWorks(false)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-10 shadow-2xl"
             >
                <div className="flex justify-between items-center mb-10">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center">
                         <Sparkles className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight">The Analysis Process</h3>
                   </div>
                   <button onClick={() => setShowHowItWorks(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <h4 className="font-bold text-gray-900">Deep Context Scan</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">Our AI decodes your professional narrative, looking beyond keywords to identify real impact.</p>
                   </div>
                   <div className="space-y-2">
                      <h4 className="font-bold text-gray-900">ATS Benchmarking</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">We simulate how modern Applicant Tracking Systems read your document to ensure you pass filters.</p>
                   </div>
                   <div className="space-y-2">
                      <h4 className="font-bold text-gray-900">Visual Precision</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">Layout and formatting are scored based on executive presentation standards.</p>
                   </div>
                   <div className="space-y-2">
                      <h4 className="font-bold text-gray-900">Actionable Roadmap</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">Receive a step-by-step checklist to transform your resume into a high-conversion asset.</p>
                   </div>
                </div>

                <button 
                  onClick={() => setShowHowItWorks(false)}
                  className="w-full mt-12 py-4 bg-black text-white rounded-2xl font-bold hover:bg-orange-600 transition-all"
                >
                  Got it, let's scan
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="relative z-10 px-6 md:px-12 pt-12 md:pt-20">
        <AnimatePresence mode="wait">
          {state === "idle" || state === "analyzing" ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              <div className="text-center mb-16 space-y-6">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100 mb-2"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-widest leading-none">Powered by Premium Intelligence</span>
                </motion.div>
                
                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95] max-w-3xl mx-auto">
                  Decode your professional <span className="italic serif font-normal text-orange-500">DNA</span>.
                </h2>
                
                <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
                  Upload your resume and let our AI analyze your impact, keywords, and layout precision in seconds.
                </p>
              </div>

              <UploadZone 
                onFileSelect={handleFileSelect} 
                isAnalyzing={state === "analyzing"} 
              />

              {state === "analyzing" && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="mt-12 flex flex-col items-center gap-4"
                 >
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                          className="w-2 h-2 bg-orange-500 rounded-full"
                        />
                      ))}
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-orange-500 animate-pulse">Running Deep Neural Scan</p>
                 </motion.div>
              )}
            </motion.div>
          ) : (state === "results" && result) ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100">
                 <div>
                    <button 
                      onClick={reset}
                      className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 group transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      Back to upload
                    </button>
                    <h2 className="text-3xl font-light tracking-tight">Personalized <span className="italic serif">Feedback</span></h2>
                 </div>
                 
                 <div className="flex gap-4">
                    <button 
                      onClick={reset}
                      className="px-6 py-3 bg-black text-white rounded-2xl font-semibold hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Scan Another
                    </button>
                 </div>
              </div>

              <AnalysisDashboard result={result} />
            </motion.div>
          ) : state === "error" ? (
             <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-8">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Scan Interrupted</h2>
              <p className="text-gray-500 max-w-sm mb-12">{errorMsg}</p>
              <button 
                onClick={reset}
                className="px-10 py-4 bg-black text-white rounded-full font-bold hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 py-12 px-12 border-t border-gray-100 mt-20 flex flex-col md:flex-row justify-between items-center gap-8 bg-white/50 backdrop-blur-sm">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
             <span className="font-bold text-sm tracking-tight">CareerPulse</span>
          </div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">© 2026 Powered by Google AI</p>
        </div>
        
        <div className="flex items-center gap-10">
           <a href="#" className="text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-gray-900">Privacy</a>
           <a href="#" className="text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-gray-900">Terms</a>
           <a href="#" className="text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-gray-900">Status</a>
        </div>

        <div className="font-mono text-[10px] text-gray-300">
          NODE://RUNTIME_AIS_CLOUD_RUN
        </div>
      </footer>
    </div>
  );
}
