import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Groq } from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy-key' });

const app = express();

app.use(express.json({ limit: '10mb' }));

// Middleware to check for API key
app.use((req, res, next) => {
  if (req.path.startsWith('/api') && !process.env.GROQ_API_KEY) {
    return res.status(500).json({ 
      error: "API Key Missing", 
      details: "The GROQ_API_KEY is not set in the server environment. Please add it to your environment variables (Vercel/Render/etc.) then redeploy." 
    });
  }
  next();
});

// API Route for Full Resume Analysis (Replacing Gemini)
app.post("/api/analyze/resume", async (req, res) => {
  try {
    const { resumeText } = req.body;
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert resume analyzer. Analyze the text and return a JSON object strictly matching this schema:
          {
            "score": number (0-100),
            "summary": "string",
            "strengths": ["string"],
            "weaknesses": ["string"],
            "recommendations": ["string"],
            "skills": [{"name": "string", "relevance": number (0-100)}],
            "formattingScore": number (0-100),
            "contentScore": number (0-100),
            "keywordsScore": number (0-100),
            "education": [{"degree": "string", "institution": "string", "date": "string"}],
            "originalText": "string (the full input text provided)"
          }`
        },
        {
          role: "user",
          content: resumeText
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    res.json(JSON.parse(completion.choices[0].message.content || "{}"));
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Failed to analyze resume" });
  }
});

// API Route for Chat (Replacing Gemini)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, context } = req.body;
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an elite Senior Executive Career Coach and ATS Strategist. 
          CONTEXT OF THE CANDIDATE:
          - Overall Resume Score: ${context.score}/100
          - Key Strengths: ${context.strengths?.join(", ")}
          - Areas of Concern (Weaknesses): ${context.weaknesses?.join(", ")}
          - Custom Action Plan: ${context.recommendations?.join(", ")}
          - Market Skill Map: ${JSON.stringify(context.skills)}
          - Full Resume Text: ${context.resumeText}

          PROTOCOL:
          1. TONE: Professional, authoritative, and direct. Use "Executive Language."
          2. DATA-DRIVEN: Always reference specific lines from the "Full Resume Text" when suggesting improvements.
          3. QUANTIFICATION: If suggesting a rewrite, insist on the (Action + Context + Result) framework.
          4. ATS INSIGHT: Provide advice on how to bypass ATS filters based on the text.
          5. LIMIT: Keep interactions punchy and high-value (usually < 150 words).`
        },
        ...messages
      ],
      model: "llama-3.3-70b-versatile",
    });

    res.json({ text: completion.choices[0].message.content });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Chat failed" });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = 3000;
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
