import { jsPDF } from "jspdf";
import { AnalysisResult } from "../types";

export async function generateResumeReport(result: AnalysisResult) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  let cursorY = 20;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("CareerPulse AI - Analysis Report", margin, cursorY);
  cursorY += 10;

  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, cursorY);
  cursorY += 15;

  // Overall Score
  doc.setFillColor(0, 0, 0);
  doc.roundedRect(margin, cursorY, 60, 25, 3, 3, "F");
  doc.setTextColor(255);
  doc.setFontSize(10);
  doc.text("OVERALL SCORE", margin + 5, cursorY + 7);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(`${result.score}`, margin + 5, cursorY + 20);

  // Individual Scores
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text(`Formatting: ${result.formattingScore}%`, margin + 70, cursorY + 5);
  doc.text(`Impact: ${result.contentScore}%`, margin + 70, cursorY + 12);
  doc.text(`ATS Opt: ${result.keywordsScore}%`, margin + 70, cursorY + 19);
  cursorY += 35;

  // Summary
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", margin, cursorY);
  cursorY += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(result.summary, pageWidth - (margin * 2));
  doc.text(summaryLines, margin, cursorY);
  cursorY += (summaryLines.length * 5) + 10;

  // Strengths
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Core Strengths", margin, cursorY);
  cursorY += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  result.strengths.forEach(s => {
    doc.text(`• ${s}`, margin + 5, cursorY);
    cursorY += 6;
  });
  cursorY += 5;

  // Recommendations
  if (cursorY > 230) { doc.addPage(); cursorY = 20; }
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Recommendations", margin, cursorY);
  cursorY += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  result.recommendations.forEach(r => {
    const lines = doc.splitTextToSize(`• ${r}`, pageWidth - (margin * 2) - 5);
    doc.text(lines, margin + 5, cursorY);
    cursorY += (lines.length * 5) + 2;
  });
  cursorY += 10;

  // Skills
  if (cursorY > 230) { doc.addPage(); cursorY = 20; }
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Market Skill Map", margin, cursorY);
  cursorY += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  result.skills.forEach((skill, i) => {
    const xPos = margin + (i % 2 === 0 ? 0 : (pageWidth - margin * 2) / 2);
    doc.text(`${skill.name}: ${skill.relevance}%`, xPos, cursorY);
    if (i % 2 !== 0) cursorY += 6;
    if (i === result.skills.length - 1 && i % 2 === 0) cursorY += 6;
  });
  cursorY += 10;

  // Original Text section
  doc.addPage();
  cursorY = 20;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Extracted Original Content", margin, cursorY);
  cursorY += 10;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  const originalLines = doc.splitTextToSize(result.originalText || "No content extracted.", pageWidth - (margin * 2));
  
  // Handle multiple pages for original text
  originalLines.forEach((line: string) => {
    if (cursorY > 280) {
      doc.addPage();
      cursorY = 20;
    }
    doc.text(line, margin, cursorY);
    cursorY += 4;
  });

  doc.save(`CareerPulse_Analysis_${new Date().getTime()}.pdf`);
}
