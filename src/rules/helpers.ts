import type { Finding } from "../reports/model.js";
import type { Rule } from "./types.js";

export function finding(
  rule: Rule,
  message: string,
  recommendation: string,
  evidence: string[],
): Finding {
  return {
    id: rule.id,
    title: rule.title,
    category: rule.category,
    severity: rule.severity,
    message,
    recommendation,
    evidence,
  };
}

export function fileContentByBasename(
  files: { path: string; content?: string }[],
  basenames: string[],
): string {
  const wanted = new Set(basenames);
  return files
    .filter((file) => wanted.has(file.path.split("/").at(-1) ?? ""))
    .map((file) => file.content ?? "")
    .join("\n");
}
