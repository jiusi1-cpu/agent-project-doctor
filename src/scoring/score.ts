import type { Finding, ScoreResult, Severity } from "../reports/model.js";

const PENALTIES: Record<Severity, number> = {
  info: 0,
  low: 3,
  medium: 8,
  high: 15,
};

const SAFETY_CAP_IDS = new Set(["safety.secret.language", "env.file.present"]);

function gradeForScore(score: number): ScoreResult["grade"] {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

function capGrade(
  grade: ScoreResult["grade"],
  cap: ScoreResult["grade"],
): ScoreResult["grade"] {
  const order: ScoreResult["grade"][] = ["A", "B", "C", "D", "F"];
  return order[Math.max(order.indexOf(grade), order.indexOf(cap))] ?? grade;
}

export function scoreFindings(findings: Finding[]): ScoreResult {
  const severityCounts: Record<Severity, number> = {
    info: 0,
    low: 0,
    medium: 0,
    high: 0,
  };
  let score = 100;

  for (const finding of findings) {
    severityCounts[finding.severity] += 1;
    score -= PENALTIES[finding.severity];
  }

  score = Math.max(0, Math.min(100, score));
  let grade = gradeForScore(score);

  if (severityCounts.high >= 1) grade = capGrade(grade, "B");
  if (severityCounts.high >= 2) grade = capGrade(grade, "C");
  if (
    findings.some(
      (finding) =>
        SAFETY_CAP_IDS.has(finding.id) ||
        /script.execution|overwrite|secret/.test(finding.id),
    )
  ) {
    grade = capGrade(grade, "C");
  }

  return {
    score,
    grade,
    severityCounts,
    topRisks: findings
      .filter(
        (finding) =>
          finding.severity === "high" || finding.severity === "medium",
      )
      .slice(0, 5),
  };
}
