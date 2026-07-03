import path from "node:path";

import type { ScanReport } from "../../src/reports/model.js";
import { scoreFindings } from "../../src/scoring/score.js";

export function createTestReport(): ScanReport {
  const findings = [
    {
      id: "safety.destructive.language",
      title: "Destructive <command> detected",
      category: "safety" as const,
      severity: "high" as const,
      message: "Avoid `rm -rf` without confirmation.",
      recommendation: "Require explicit approval.",
      evidence: ["AGENTS.md"],
    },
    {
      id: "agent.agents_md.missing",
      title: "AGENTS.md is missing",
      category: "agent" as const,
      severity: "medium" as const,
      message: "No AGENTS.md file was detected.",
      recommendation: "Review AGENTS.generated.md.",
      evidence: ["AGENTS.md not found"],
    },
  ];

  return {
    options: {
      rootPath: path.resolve("tests/fixtures/minimal-node"),
      outDir: path.resolve("tests/fixtures/minimal-node/.agent-project-doctor"),
      force: false,
      json: false,
    },
    inventory: {
      rootPath: path.resolve("tests/fixtures/minimal-node"),
      files: [
        {
          path: "package.json",
          size: 100,
          extension: ".json",
          contentRead: true,
          content: '{"scripts":{"test":"vitest run"}}',
        },
        {
          path: "README.md",
          size: 20,
          extension: ".md",
          contentRead: true,
          content: "# Demo",
        },
        {
          path: "src/index.ts",
          size: 50,
          extension: ".ts",
          contentRead: false,
          reasonContentNotRead: "not_allowlisted",
        },
      ],
      filesByPath: new Map(),
      signals: {
        ecosystems: ["node"],
        packageManager: "npm",
        scripts: { test: "vitest run" },
        testCommands: ["npm test"],
        buildCommands: [],
        setupCommands: [],
      },
      warnings: [],
    },
    findings,
    score: scoreFindings(findings),
    generatedAt: "2026-07-03T00:00:00.000Z",
  };
}
