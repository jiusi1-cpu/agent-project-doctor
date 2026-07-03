import type { NormalizedScanOptions } from "../config/options.js";

export type Severity = "info" | "low" | "medium" | "high";

export type FindingCategory =
  | "documentation"
  | "testing"
  | "agent"
  | "environment"
  | "safety"
  | "ci"
  | "project";

export interface FileRecord {
  path: string;
  size: number;
  extension: string;
  content?: string;
  contentRead: boolean;
  reasonContentNotRead?: string;
}

export interface ProjectSignals {
  ecosystems: string[];
  packageManager?: string;
  scripts: Record<string, string>;
  testCommands: string[];
  buildCommands: string[];
  setupCommands: string[];
}

export interface ProjectInventory {
  rootPath: string;
  files: FileRecord[];
  filesByPath: Map<string, FileRecord>;
  signals: ProjectSignals;
  warnings: string[];
}

export interface Finding {
  id: string;
  title: string;
  category: FindingCategory;
  severity: Severity;
  message: string;
  recommendation: string;
  evidence: string[];
}

export interface ScoreResult {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  severityCounts: Record<Severity, number>;
  topRisks: Finding[];
}

export interface ScanReport {
  options: NormalizedScanOptions;
  inventory: ProjectInventory;
  findings: Finding[];
  score: ScoreResult;
  generatedAt: string;
}
