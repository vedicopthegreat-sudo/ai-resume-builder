
"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Search,
  Sparkles,
  Target,
} from "lucide-react";

import { useResumeStore } from "@/src/store/resume-store";
import { analyzeResumeAgainstJob } from "@/lib/ats-analyzer";
import type { ATSAnalysisResult } from "@/lib/ats-analyzer";

type SavedAnalysis = {
  result: ATSAnalysisResult;
  analysisKey: string;
};

export default function ATSAnalyzer() {
  // Read the CURRENT resume from Zustand.
  // This includes edits that have not yet been saved to Supabase.
  const personal = useResumeStore((state) => state.personal);
  const summary = useResumeStore((state) => state.summary);
  const experiences = useResumeStore((state) => state.experiences);
  const educations = useResumeStore((state) => state.educations);
  const skills = useResumeStore((state) => state.skills);

  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<SavedAnalysis | null>(null);
  const [error, setError] = useState("");

  // Combine all current resume fields into searchable text.
  const resumeText = [
    personal.fullName,
    personal.jobTitle,
    personal.email,
    personal.location,
    personal.linkedin,
    personal.website,
    summary,
    ...experiences.flatMap((experience) => [
      experience.position,
      experience.company,
      experience.location,
      experience.description,
    ]),
    ...educations.flatMap((education) => [
      education.school,
      education.degree,
      education.field,
    ]),
    skills,
  ]
    .filter(Boolean)
    .join(" ");

  // The analysis becomes outdated if either the resume or job description changes.
  const currentAnalysisKey = JSON.stringify({
    resumeText,
    jobDescription,
  });

  const isOutdated =
    analysis !== null &&
    analysis.analysisKey !== currentAnalysisKey;

  const handleAnalyze = () => {
    setError("");

    if (!jobDescription.trim()) {
      setError("Please paste a job description first.");
      return;
    }

    if (!resumeText.trim()) {
      setError("Add some resume details before running the analysis.");
      return;
    }

    const result = analyzeResumeAgainstJob(
      resumeText,
      jobDescription
    );

    if (result.totalKeywords === 0) {
      setError(
        "We could not find enough relevant keywords in this job description. Try pasting the complete job description."
      );
      return;
    }

    setAnalysis({
      result,
      analysisKey: currentAnalysisKey,
    });
  };

  const getScoreLabel = (score: number) => {
    if (score >= 75) return "Strong keyword match";
    if (score >= 50) return "Moderate keyword match";
    return "Needs improvement";
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "#15803d";
    if (score >= 50) return "#b45309";
    return "#dc2626";
  };

  return (
    <section
      className="editor-card"
      id="ats-analyzer"
      style={{ marginTop: "24px" }}
    >
      <div className="editor-card-heading">
        <div className="editor-card-icon purple">
          <Target size={20} />
        </div>

        <div>
          <h2>ATS Resume Analyzer</h2>
          <p>
            Compare your current resume with a job description.
          </p>
        </div>
      </div>

      <div className="editor-field">
        <label htmlFor="ats-job-description">
          Paste the job description
        </label>

        <textarea
          id="ats-job-description"
          rows={8}
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste the job description here, including responsibilities, required skills, qualifications, and preferred experience..."
        />

        <span className="field-hint">
          The analyzer compares keywords in this description with your
          current resume.
        </span>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            marginTop: "14px",
            color: "#b91c1c",
            fontSize: "14px",
          }}
        >
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleAnalyze}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginTop: "16px",
          padding: "11px 18px",
          border: "none",
          borderRadius: "8px",
          background: "#4f46e5",
          color: "#ffffff",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <Search size={17} />
        Analyze Resume
      </button>

      {analysis && (
        <div style={{ marginTop: "24px" }}>
          {isOutdated && (
            <div
              role="status"
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                padding: "12px",
                marginBottom: "16px",
                borderRadius: "8px",
                background: "#fffbeb",
                color: "#92400e",
                fontSize: "14px",
              }}
            >
              <AlertCircle size={17} />
              Your resume or job description has changed. Analyze again
              to refresh these results.
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "24px",
              padding: "20px",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              background: "#fafafa",
            }}
          >
            <div
              style={{
                width: "104px",
                height: "104px",
                flexShrink: 0,
                borderRadius: "50%",
                border: `8px solid ${getScoreColor(analysis.result.score)}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <strong style={{ fontSize: "28px", lineHeight: 1 }}>
                {analysis.result.score}%
              </strong>
              <span style={{ fontSize: "11px", color: "#6b7280" }}>
                Match
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 700 }}>
                {getScoreLabel(analysis.result.score)}
              </h3>

              <p style={{ marginTop: "6px", color: "#6b7280" }}>
                {analysis.result.matchedKeywords.length} of{" "}
                {analysis.result.totalKeywords} identified job-description
                keywords appear in your resume.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginTop: "18px",
            }}
          >
            <div
              style={{
                padding: "16px",
                border: "1px solid #bbf7d0",
                borderRadius: "10px",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: 700,
                  color: "#15803d",
                }}
              >
                <CheckCircle2 size={18} />
                Matched keywords ({analysis.result.matchedKeywords.length})
              </h3>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "7px",
                  marginTop: "12px",
                }}
              >
                {analysis.result.matchedKeywords.length > 0 ? (
                  analysis.result.matchedKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      style={{
                        padding: "5px 9px",
                        borderRadius: "20px",
                        background: "#dcfce7",
                        color: "#166534",
                        fontSize: "12px",
                      }}
                    >
                      {keyword}
                    </span>
                  ))
                ) : (
                  <span style={{ color: "#6b7280", fontSize: "13px" }}>
                    No matching keywords found yet.
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                border: "1px solid #fecaca",
                borderRadius: "10px",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: 700,
                  color: "#b91c1c",
                }}
              >
                <AlertCircle size={18} />
                Missing keywords ({analysis.result.missingKeywords.length})
              </h3>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "7px",
                  marginTop: "12px",
                }}
              >
                {analysis.result.missingKeywords.length > 0 ? (
                  analysis.result.missingKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      style={{
                        padding: "5px 9px",
                        borderRadius: "20px",
                        background: "#fee2e2",
                        color: "#991b1b",
                        fontSize: "12px",
                      }}
                    >
                      {keyword}
                    </span>
                  ))
                ) : (
                  <span style={{ color: "#6b7280", fontSize: "13px" }}>
                    No missing keywords identified.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "18px",
              padding: "16px",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
            }}
          >
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 700,
              }}
            >
              <Sparkles size={18} />
              Improvement suggestions
            </h3>

            <ul
              style={{
                paddingLeft: "22px",
                marginTop: "12px",
                color: "#4b5563",
                fontSize: "14px",
                lineHeight: 1.8,
              }}
            >
              {analysis.result.missingKeywords.length > 0 && (
                <li>
                  Review the missing keywords. Add them only where they
                  accurately describe your skills or experience.
                </li>
              )}

              {!summary.trim() && (
                <li>
                  Add a professional summary tailored to the target role.
                </li>
              )}

              {skills.trim().length === 0 && (
                <li>
                  Add a skills section containing your relevant technical
                  and professional skills.
                </li>
              )}

              {!experiences.some((item) => item.description.trim()) && (
                <li>
                  Add responsibilities and achievements to your work
                  experience entries.
                </li>
              )}

              {experiences.length > 0 &&
                experiences.every(
                  (item) => !/\d/.test(item.description)
                ) && (
                  <li>
                    Where accurate, include measurable results such as
                    percentages, time saved, revenue, or project size.
                  </li>
                )}

              {analysis.result.missingKeywords.length === 0 &&
                summary.trim() &&
                skills.trim() &&
                experiences.some((item) => item.description.trim()) && (
                  <li>
                    Your resume contains the identified keywords. Review
                    the wording and make sure each claim accurately
                    reflects your experience.
                  </li>
                )}
            </ul>
          </div>

          <p
            style={{
              marginTop: "14px",
              color: "#6b7280",
              fontSize: "12px",
              lineHeight: 1.6,
            }}
          >
            This is a basic keyword comparison, not an actual score from
            an employer's ATS. It does not evaluate formatting, parsing
            compatibility, or the quality of your experience.
          </p>
        </div>
      )}
    </section>
  );
}
