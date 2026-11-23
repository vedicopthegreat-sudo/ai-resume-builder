
const STOP_WORDS = new Set([
  "the", "and", "for", "with", "you", "your", "our", "are", "this",
  "that", "from", "will", "have", "has", "had", "was", "were", "who",
  "what", "when", "where", "how", "why", "can", "could", "should",
  "would", "must", "may", "might", "into", "onto", "their", "they",
  "them", "his", "her", "its", "all", "any", "each", "more", "most",
  "some", "such", "than", "then", "also", "about", "across", "within",
  "between", "through", "using", "use", "used", "work", "working",
  "role", "team", "teams", "ability", "skills", "skill", "experience",
  "years", "year", "strong", "good", "excellent", "required",
  "preferred", "responsibilities", "responsibility", "including",
  "candidate", "position", "job", "knowledge", "understanding",
]);

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z][a-z0-9+#.]*/g) ?? [];

  return [...new Set(
    words
      .map((word) => word.replace(/[.]+$/, ""))
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
  )];
}

export type ATSAnalysisResult = {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  totalKeywords: number;
};

export function analyzeResumeAgainstJob(
  resumeText: string,
  jobDescription: string
): ATSAnalysisResult {
  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywords = new Set(extractKeywords(resumeText));

  const matchedKeywords = jobKeywords.filter((keyword) =>
    resumeKeywords.has(keyword)
  );

  const missingKeywords = jobKeywords.filter(
    (keyword) => !resumeKeywords.has(keyword)
  );

  const score =
    jobKeywords.length === 0
      ? 0
      : Math.round((matchedKeywords.length / jobKeywords.length) * 100);

  return {
    score,
    matchedKeywords,
    missingKeywords,
    totalKeywords: jobKeywords.length,
  };
}
