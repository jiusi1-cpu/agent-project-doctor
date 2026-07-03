import type { ScanReport } from "./model.js";

function listOrMissing(values: string[], missing: string): string {
  if (values.length === 0) return `- ${missing}`;
  return values.map((value) => `- \`${value}\``).join("\n");
}

export function renderAgentsDraft(report: ScanReport): string {
  const files = report.inventory.files
    .slice(0, 20)
    .map(
      (file) =>
        `- \`${file.path}\`${file.contentRead ? "" : " (metadata only)"}`,
    )
    .join("\n");

  return `# AGENTS.generated.md

> Generated draft. Review this file before copying any guidance into AGENTS.md.

## Project Overview

- Detected ecosystems: ${report.inventory.signals.ecosystems.length > 0 ? report.inventory.signals.ecosystems.join(", ") : "None detected"}
- Package manager: ${report.inventory.signals.packageManager ?? "Not detected"}

## Repository Map

${files || "- No files detected"}

## Setup Commands

${listOrMissing(report.inventory.signals.setupCommands, "No setup command detected yet")}

## Build Commands

${listOrMissing(report.inventory.signals.buildCommands, "No build command detected yet")}

## Test / Validation Commands

${listOrMissing(report.inventory.signals.testCommands, "No test command detected yet")}

## Safety Rules

- Do not edit secrets or environment files without explicit confirmation.
- Do not deploy to production without explicit confirmation.
- Do not run destructive commands such as \`rm -rf\`, \`git reset --hard\`, or force push without explicit confirmation.
- Do not assume unknown setup, build, test, deploy, lint, or format commands exist.

## Files Agents Should Avoid Editing Without Confirmation

- \`.env\` and other secret-bearing files.
- Lockfiles unless dependency changes are intentional.
- Generated outputs and build artifacts.

## Reporting Expectations

- Summarize changed files.
- Report validation commands that were actually run.
- If validation was not run, say so directly.
`;
}
