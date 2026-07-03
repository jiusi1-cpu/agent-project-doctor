import type { Finding, ScanReport, Severity } from "./model.js";

const SEVERITIES: Severity[] = ["high", "medium", "low", "info"];

function renderFinding(finding: Finding): string {
  return [
    `### ${finding.title}`,
    "",
    `- Severity: \`${finding.severity}\``,
    `- Category: \`${finding.category}\``,
    `- Message: ${finding.message}`,
    `- Recommendation: ${finding.recommendation}`,
    `- Evidence: ${finding.evidence.join(", ")}`,
  ].join("\n");
}

export function renderMarkdown(report: ScanReport): string {
  const sections = [
    "# Agent Project Doctor Summary",
    "",
    `Scanned path: \`${report.options.rootPath}\``,
    `Generated at: \`${report.generatedAt}\``,
    `Score: **${report.score.score}/100**`,
    `Grade: **${report.score.grade}**`,
    "",
    "> This is a local best-effort readiness signal scan, not a security certification.",
    "",
    "## Severity Counts",
    "",
    ...SEVERITIES.map(
      (severity) => `- ${severity}: ${report.score.severityCounts[severity]}`,
    ),
    "",
    "## Findings",
    "",
  ];

  if (report.findings.length === 0) {
    sections.push("No findings detected by the current rule set.");
  } else {
    for (const severity of SEVERITIES) {
      const findings = report.findings.filter(
        (finding) => finding.severity === severity,
      );
      if (findings.length === 0) continue;
      sections.push(
        `## ${severity.toUpperCase()} Findings`,
        "",
        ...findings.map(renderFinding),
        "",
      );
    }
  }

  sections.push(
    "## Recommended Next Actions",
    "",
    "1. Review high and medium findings first.",
    "2. Review AGENTS.generated.md before copying guidance into AGENTS.md.",
    "3. Run the repository's own validation commands manually when you decide it is safe.",
  );

  return `${sections.join("\n").trim()}\n`;
}
