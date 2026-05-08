import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Target, 
  Lightbulb, 
  Zap, 
  ArrowUpRight, 
  Binary, 
  Layout, 
  FileCheck2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Download,
  BrainCircuit,
  Loader2,
  Info,
  GraduationCap
} from "lucide-react";
import { AnalysisResult } from "../types";
import { cn } from "../lib/utils";
import { generateResumeReport } from "../lib/pdf";
import { enhanceWithAI } from "../lib/ai";
import Chatbot from "./Chatbot";

function CountUp({ end, duration = 2, delay = 0 }: { end: number, duration?: number, delay?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp - (delay * 1000)) / (duration * 1000), 1);
      if (progress > 0) {
        setCount(Math.floor(progress * end));
      }
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const timer = setTimeout(() => {
       window.requestAnimationFrame(step);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [end, duration, delay]);

  return <>{count}</>;
}

interface AnalysisDashboardProps {
  result: AnalysisResult;
}

export default function AnalysisDashboard({ result: initialResult }: AnalysisDashboardProps) {
  const [result, setResult] = useState(initialResult);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleDownload = async () => {
    await generateResumeReport(result);
  };

  const handleAIEnhance = async () => {
    if (!result.originalText) return;
    try {
      setIsEnhancing(true);
      const enhancement = await enhanceWithAI(result.originalText);
      setResult(prev => ({
        ...prev,
        summary: enhancement.summary,
        recommendations: [...prev.recommendations, ...enhancement.improvements]
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 pb-20">
      {/* Header Actions */}
      <div className="flex justify-end gap-4">
        <button 
          onClick={handleAIEnhance}
          disabled={isEnhancing}
          className="flex items-center gap-2 px-6 py-3 bg-orange-50 text-orange-700 rounded-2xl font-bold hover:bg-orange-100 transition-all disabled:opacity-50"
        >
          {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
          Deep AI Analysis
        </button>
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg"
        >
          <Download className="w-4 h-4" />
          Download PDF Report
        </button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-black rounded-3xl p-8 text-white relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-orange-400" />
                <span className="text-xs uppercase tracking-widest font-bold opacity-70">AI Intelligence</span>
              </div>
              <h2 className="text-4xl font-light tracking-tight mb-4">
                Analysis <span className="italic serif">Complete</span>
              </h2>
              <p className="text-gray-400 max-w-md leading-relaxed">
                {result.summary}
              </p>
            </div>
            
            <div className="mt-8 flex items-end gap-1">
              <span className="text-8xl font-black">
                <CountUp end={result.score} delay={0.5} />
              </span>
              <span className="text-2xl font-bold opacity-30 mb-4 tracking-tighter">/ 100</span>
            </div>
          </div>
          
          {/* Abstract Grid background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          </div>
        </motion.div>

        <div className="space-y-6">
          <ScoreCard 
            title="Formatting" 
            score={result.formattingScore} 
            icon={<Layout className="w-5 h-5" />}
            description="Visual precision, logical layout, and executive readability. Critical for first impressions with human reviewers."
            delay={0.1}
          />
          <ScoreCard 
            title="Professional Impact" 
            score={result.contentScore} 
            icon={<Target className="w-5 h-5" />}
            description="Strength of achievements and action-oriented narrative. Evaluates how well you quantify results and demonstrate value."
            delay={0.2}
          />
          <ScoreCard 
            title="ATS Optimization" 
            score={result.keywordsScore} 
            icon={<Binary className="w-5 h-5" />}
            description="Keyword density and structural compatibility. High scores mean you're more likely to pass automated screening filters."
            delay={0.3}
          />
        </div>
      </div>

      {/* Critical Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <InsightSection 
          title="Core Strengths" 
          items={result.strengths} 
          icon={<CheckCircle2 className="w-6 h-6 text-green-500" />}
          bg="bg-green-50/50"
          textColor="text-green-700"
        />
        <InsightSection 
          title="Areas for Focus" 
          items={result.weaknesses} 
          icon={<XCircle className="w-6 h-6 text-red-500" />}
          bg="bg-red-50/50"
          textColor="text-red-700"
        />
      </div>

      {/* Skills Analysis */}
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.4 }}
         className="bg-white border border-gray-100 rounded-3xl p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <Zap className="w-6 h-6 text-orange-500" />
          <h3 className="text-2xl font-medium tracking-tight text-gray-900">Market Skill Map</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {result.skills.map((skill, i) => (
            <motion.div 
              key={skill.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + (i * 0.05) }}
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: "#fff",
                boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                borderColor: "#e5e7eb"
              }}
              className="p-4 rounded-2xl bg-gray-50 border border-transparent transition-all group cursor-default"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400">Score {skill.relevance}%</span>
                <ArrowUpRight className="w-3 h-3 text-gray-300 group-hover:text-orange-500 transition-colors" />
              </div>
              <p className="font-medium text-gray-900">{skill.name}</p>
              <div className="mt-3 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.relevance}%` }}
                  transition={{ delay: 0.7 + (i * 0.1), duration: 1 }}
                  className="h-full bg-orange-500"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Education List */}
      {result.education && result.education.length > 0 && (
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.45 }}
           className="bg-white border border-gray-100 rounded-3xl p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <GraduationCap className="w-6 h-6 text-orange-500" />
            <h3 className="text-2xl font-medium tracking-tight text-gray-900">Educational Background</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.education.map((edu, i) => (
              <div 
                key={i}
                className="p-6 rounded-2xl bg-gray-50 border border-transparent hover:border-gray-200 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                   </div>
                   <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-white px-3 py-1 rounded-full border border-gray-100">{edu.date}</span>
                </div>
                <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{edu.degree}</h4>
                <p className="text-gray-500 text-sm mt-1">{edu.institution}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actionable Recommendations */}
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.5 }}
         className="bg-orange-500 text-white rounded-3xl p-10 relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Lightbulb className="w-6 h-6" />
            <h3 className="text-2xl font-bold">Action Plan</h3>
          </div>
          <ul className="space-y-4">
            {result.recommendations.map((rec, i) => (
               <motion.li 
                 key={i}
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.6 + (i * 0.1) }}
                 className="flex items-start gap-4 text-orange-50 font-medium"
               >
                 <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
                 <p className="leading-relaxed"><strong className="text-white">Step {i + 1}:</strong> {rec}</p>
               </motion.li>
            ))}
          </ul>
        </div>
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <FileCheck2 className="w-64 h-64 rotate-12" />
        </div>
      </motion.div>

      {/* Chatbot Interface */}
      <Chatbot 
        resumeText={result.originalText || ""} 
        analysis={result} 
      />
    </div>
  );
}

function ScoreCard({ title, score, icon, description, delay }: { title: string, score: number, icon: React.ReactNode, description: string, delay: number }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="bg-white border border-gray-100 p-6 rounded-3xl group hover:border-orange-200 transition-all cursor-default relative"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:text-orange-500 group-hover:bg-orange-50 transition-colors">
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-gray-400 uppercase tracking-widest">
             <CountUp end={score} delay={delay + 0.5} />/100
          </span>
          <Info className="w-3.5 h-3.5 text-gray-300 hover:text-gray-900 cursor-help transition-colors" />
        </div>
      </div>
      
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute z-50 left-6 right-6 -top-2 translate-y-[-100%] bg-black text-white p-3 rounded-xl text-[10px] leading-relaxed shadow-xl pointer-events-none"
          >
            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45" />
            <p className="font-medium opacity-90">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <h4 className="text-lg font-medium text-gray-900 group-hover:translate-x-1 transition-transform">{title}</h4>
      <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: delay + 0.5, duration: 1 }}
          className="h-full bg-gray-900 group-hover:bg-orange-500 transition-colors"
        />
      </div>
    </motion.div>
  );
}

function InsightSection({ title, items, icon, bg, textColor }: { title: string, items: string[], icon: React.ReactNode, bg: string, textColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("p-8 rounded-3xl", bg)}
    >
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h3 className={cn("text-xl font-bold tracking-tight", textColor)}>{title}</h3>
      </div>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
             <div className={cn("mt-2 w-1 h-1 rounded-full flex-shrink-0", textColor.replace('text-', 'bg-'), "opacity-30")} />
             <p className={cn("text-sm leading-relaxed italic serif", textColor)}>{item}</p>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
