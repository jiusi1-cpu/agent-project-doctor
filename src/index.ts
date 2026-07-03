import fs from "node:fs/promises";
import path from "node:path";

import {
  GENERATED_OUTPUT_FILES,
  DEFAULT_OUTPUT_DIRECTORY,
} from "./config/defaults.js";
import { normalizeScanOptions, type ScanOptions } from "./config/options.js";
import type { ScanReport } from "./reports/model.js";
import { renderAgentsDraft } from "./reports/renderAgentsDraft.js";
import { renderHtml } from "./reports/renderHtml.js";
import { renderMarkdown } from "./reports/renderMarkdown.js";
import { runRules } from "./rules/registry.js";
import { scanRepository } from "./scanner/scanRepository.js";
import { scoreFindings } from "./scoring/score.js";

export const packageName = "agent-project-doctor";

async function assertPathIsDirectory(directory: string): Promise<void> {
  const stats = await fs.stat(directory);
  if (!stats.isDirectory()) {
    throw new Error(`Scan path is not a directory: ${directory}`);
  }
}

function outputPath(
  outDir: string,
  fileName: (typeof GENERATED_OUTPUT_FILES)[number],
): string {
  const resolvedOutDir = path.resolve(outDir);
  const resolvedFile = path.resolve(resolvedOutDir, fileName);
  const relative = path.relative(resolvedOutDir, resolvedFile);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to write outside output directory: ${fileName}`);
  }
  return resolvedFile;
}

async function assertOutputsCanBeWritten(
  outDir: string,
  force: boolean,
): Promise<void> {
  if (force) return;
  const existing: string[] = [];
  for (const fileName of GENERATED_OUTPUT_FILES) {
    try {
      await fs.access(outputPath(outDir, fileName));
      existing.push(fileName);
    } catch {
      // Missing files are safe to create.
    }
  }
  if (existing.length > 0) {
    throw new Error(
      `Output already exists. Use --force to overwrite known generated files: ${existing.join(", ")}`,
    );
  }
}

export async function runScan(options: ScanOptions = {}): Promise<ScanReport> {
  const normalized = normalizeScanOptions({
    out: DEFAULT_OUTPUT_DIRECTORY,
    ...options,
  });
  await assertPathIsDirectory(normalized.rootPath);

  const inventory = await scanRepository({ rootPath: normalized.rootPath });
  const findings = runRules({ inventory });
  const report: ScanReport = {
    options: normalized,
    inventory,
    findings,
    score: scoreFindings(findings),
    generatedAt: new Date().toISOString(),
  };

  await fs.mkdir(normalized.outDir, { recursive: true });
  await assertOutputsCanBeWritten(normalized.outDir, normalized.force);
  await fs.writeFile(
    outputPath(normalized.outDir, "agent-doctor-report.html"),
    renderHtml(report),
    "utf8",
  );
  await fs.writeFile(
    outputPath(normalized.outDir, "agent-doctor-summary.md"),
    renderMarkdown(report),
    "utf8",
  );
  await fs.writeFile(
    outputPath(normalized.outDir, "AGENTS.generated.md"),
    renderAgentsDraft(report),
    "utf8",
  );

  return report;
}
