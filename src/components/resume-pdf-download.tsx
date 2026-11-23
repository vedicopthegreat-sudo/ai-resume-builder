
"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import { useResumeStore } from "@/src/store/resume-store";
import ResumePDFDocument from "./resume-pdf-document";

export default function ResumePDFDownload() {
  const personal = useResumeStore((state) => state.personal);
  const summary = useResumeStore((state) => state.summary);
  const experiences = useResumeStore((state) => state.experiences);
  const educations = useResumeStore((state) => state.educations);
  const skills = useResumeStore((state) => state.skills);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      const resumeData = {
        personal,
        summary,
        experiences,
        educations,
        skills,
      };

      const blob = await pdf(
        <ResumePDFDocument data={resumeData} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      const safeName = (personal.fullName || "Resume")
        .trim()
        .replace(/[^a-z0-9-_]/gi, "_");

      link.href = url;
      link.download = `${safeName}_Resume.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error("PDF generation failed:", error);
      window.alert("Could not generate the PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isGenerating}
      className="editor-save-button"
    >
      <Download size={16} />
      {isGenerating ? "Generating PDF..." : "Download PDF"}
    </button>
  );
}
