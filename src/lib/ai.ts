import { AnalysisResult } from "../types";

interface AIEnhancement {
  summary: string;
  improvements: string[];
}

export async function analyzeResume(resumeText: string): Promise<AnalysisResult> {
  const response = await fetch("/api/analyze/resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText }),
  });

  if (!response.ok) throw new Error("Analysis failed");
  return await response.json();
}

export async function chatWithCoach(messages: any[], context: any): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, context }),
  });

  if (!response.ok) throw new Error("Chat failed");
  const data = await response.json();
  return data.text;
}

export async function enhanceWithAI(resumeText: string): Promise<AIEnhancement> {
  try {
    const response = await fetch("/api/analyze/resume", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText }),
    });

    if (!response.ok) throw new Error("AI enhancement error");
    const data = await response.json();
    return {
      summary: data.summary,
      improvements: data.recommendations
    };
  } catch (error) {
    console.error("AI enhancement failed:", error);
    throw error;
  }
}
