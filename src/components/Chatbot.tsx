import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { chatWithCoach } from "../lib/ai";
import { AnalysisResult } from "../types";
import { cn } from "../lib/utils";

interface ChatbotProps {
  resumeText: string;
  analysis: AnalysisResult;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chatbot({ resumeText, analysis }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Hi! I'm your CareerPulse AI assistant. I've analyzed your resume and found some key areas to discuss. How can I help you improve today?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const responseText = await chatWithCoach(newMessages, {
        score: analysis.score,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations,
        skills: analysis.skills,
        resumeText: resumeText.substring(0, 10000) // Increased context limit
      });

      setMessages(prev => [...prev, { role: "assistant", content: responseText }]);
    } catch (error) {
      console.error("Chat failed:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting to my brain right now. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-8 right-8 z-[100] w-16 h-16 bg-black text-white rounded-full shadow-2xl flex items-center justify-center group",
          isOpen && "hidden"
        )}
      >
        <MessageSquare className="w-8 h-8 group-hover:rotate-12 transition-transform" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[101] w-full max-w-[450px] h-[70vh] max-h-[700px] bg-white rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-black p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold tracking-tight">AI Career Coach</h4>
                  <div className="flex items-center gap-1.5 opacity-60">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Active Now</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-gray-50/50"
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: m.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex gap-3",
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    m.role === "user" ? "bg-orange-100 text-orange-600" : "bg-black text-white"
                  )}>
                    {m.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                    m.role === "user" 
                      ? "bg-orange-500 text-white rounded-tr-none" 
                      : "bg-white border border-gray-100 shadow-sm rounded-tl-none text-gray-800"
                  )}>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                   </div>
                   <div className="bg-white border border-gray-100 p-4 rounded-2xl animate-pulse">
                      <div className="flex gap-1">
                         <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                         <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                         <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                      </div>
                   </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-100">
               <div className="relative">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask about your resume..."
                    className="w-full pl-6 pr-14 py-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-400 text-sm"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-2 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-orange-500 transition-colors disabled:opacity-30 disabled:hover:bg-black"
                  >
                    <Send className="w-4 h-4" />
                  </button>
               </div>
               <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-widest font-bold">
                 Insights powered by CareerPulse AI
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
