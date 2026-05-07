import { AnalysisResult } from "../types";

interface GroqEnhancement {
  summary: string;
  improvements: string[];
}

export async function analyzeResume(resumeText: string): Promise<AnalysisResult> {
  const response = await fetch("/api/analyze/resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText }),
  });

  if (!response.ok) throw new Error("Groq analysis failed");
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

export async function enhanceWithGroq(resumeText: string): Promise<GroqEnhancement> {
  try {
    const response = await fetch("/api/analyze/resume", { // Using the main analysis endpoint for enhancement too if needed or keep existing logic
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText }),
    });

    if (!response.ok) throw new Error("Groq API error");
    const data = await response.json();
    return {
      summary: data.summary,
      improvements: data.recommendations
    };
  } catch (error) {
    console.error("Groq enhancement failed:", error);
    throw error;
  }
}
