export interface Skill {
  name: string;
  relevance: number; // 0-100
}

export interface Education {
  degree: string;
  institution: string;
  date: string;
}

export interface AnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  skills: Skill[];
  formattingScore: number;
  contentScore: number;
  keywordsScore: number;
  education?: Education[];
  originalText?: string;
}

export type AppState = 'idle' | 'uploading' | 'analyzing' | 'results' | 'error';
