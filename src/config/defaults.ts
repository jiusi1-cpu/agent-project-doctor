export const DEFAULT_OUTPUT_DIRECTORY = ".agent-project-doctor";

export const DEFAULT_MAX_TEXT_FILE_BYTES = 256_000;

export const DEFAULT_IGNORED_DIRECTORIES = [
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".turbo",
  "coverage",
  DEFAULT_OUTPUT_DIRECTORY,
] as const;

export const GENERATED_OUTPUT_FILES = [
  "agent-doctor-report.html",
  "agent-doctor-summary.md",
  "AGENTS.generated.md",
] as const;
