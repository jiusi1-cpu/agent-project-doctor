import type { ScanReport, Severity } from "./model.js";
import { escapeHtml } from "../utils/text.js";

const SEVERITIES: Severity[] = ["high", "medium", "low", "info"];

export function htmlTemplate(report: ScanReport): string {
  const findings = report.findings
    .map(
      (finding) => `<article class="finding ${escapeHtml(finding.severity)}">
  <h3>${escapeHtml(finding.title)}</h3>
  <p><strong>Severity:</strong> ${escapeHtml(finding.severity)} · <strong>Category:</strong> ${escapeHtml(finding.category)}</p>
  <p>${escapeHtml(finding.message)}</p>
  <p><strong>Recommendation:</strong> ${escapeHtml(finding.recommendation)}</p>
  <p><strong>Evidence:</strong> ${escapeHtml(finding.evidence.join(", "))}</p>
</article>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Agent Project Doctor Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; color: #172026; background: #f7f8fa; }
    main { max-width: 960px; margin: 0 auto; padding: 32px 20px; }
    .summary, .finding { background: #fff; border: 1px solid #d8dee4; border-radius: 8px; padding: 18px; margin: 14px 0; }
    .score { font-size: 40px; font-weight: 700; }
    .counts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
    .counts div { background: #eef2f6; padding: 10px; border-radius: 6px; }
    .high { border-left: 5px solid #b42318; }
    .medium { border-left: 5px solid #b54708; }
    .low { border-left: 5px solid #175cd3; }
    .info { border-left: 5px solid #475467; }
  </style>
</head>
<body>
  <main>
    <h1>Agent Project Doctor Report</h1>
    <section class="summary">
      <div class="score">${report.score.score}/100</div>
      <p><strong>Grade:</strong> ${escapeHtml(report.score.grade)}</p>
      <p><strong>Scanned path:</strong> ${escapeHtml(report.options.rootPath)}</p>
      <p><strong>Generated:</strong> ${escapeHtml(report.generatedAt)}</p>
      <p>This is a local best-effort readiness signal scan, not a security certification.</p>
    </section>
    <section class="summary">
      <h2>Severity Counts</h2>
      <div class="counts">
        ${SEVERITIES.map((severity) => `<div><strong>${severity}</strong><br>${report.score.severityCounts[severity]}</div>`).join("\n")}
      </div>
    </section>
    <section>
      <h2>Findings</h2>
      ${findings || "<p>No findings detected by the current rule set.</p>"}
    </section>
  </main>
</body>
</html>`;
}
