import type { FileRecord } from "../reports/model.js";
import { finding } from "./helpers.js";
import type { Rule } from "./types.js";

function scannedText(files: FileRecord[]): string {
  return files
    .filter((file) => file.contentRead)
    .map((file) => file.content ?? "")
    .join("\n")
    .toLowerCase();
}

export const safetyRules: Rule[] = [
  {
    id: "safety.destructive.language",
    title: "Destructive command language detected",
    category: "safety",
    severity: "high",
    evaluate(context) {
      const text = scannedText(context.inventory.files);
      if (
        !/(rm\s+-rf|git\s+reset\s+--hard|force push|git\s+push\s+--force)/i.test(
          text,
        )
      )
        return [];
      return [
        finding(
          this,
          "Docs or agent instructions mention destructive commands without a clear confirmation boundary.",
          "Require explicit user confirmation for destructive operations.",
          ["destructive command phrase"],
        ),
      ];
    },
  },
  {
    id: "safety.production.language",
    title: "Production deploy language detected",
    category: "safety",
    severity: "high",
    evaluate(context) {
      const text = scannedText(context.inventory.files);
      if (
        !/(deploy directly to production|production deploy|deploy to production)/i.test(
          text,
        )
      )
        return [];
      return [
        finding(
          this,
          "Docs or agent instructions mention production deployment.",
          "Require explicit approval and staging guidance before production deploys.",
          ["production deploy phrase"],
        ),
      ];
    },
  },
  {
    id: "safety.secret.language",
    title: "Secret handling guidance is weak",
    category: "safety",
    severity: "medium",
    evaluate(context) {
      const text = scannedText(context.inventory.files);
      const mentionsSecret = /(api key|api keys|secret|token|\.env)/i.test(
        text,
      );
      const hasGuidance =
        /(do not commit|never commit|placeholder|example|ignore|redact)/i.test(
          text,
        );
      if (!mentionsSecret || hasGuidance) return [];
      return [
        finding(
          this,
          "Docs mention secrets or environment files without clear handling guidance.",
          "Add guidance to avoid committing or printing secrets.",
          ["secret-related wording"],
        ),
      ];
    },
  },
  {
    id: "safety.large_repo.warning",
    title: "Repository may be large for agent context",
    category: "safety",
    severity: "low",
    evaluate(context) {
      const totalBytes = context.inventory.files.reduce(
        (sum, file) => sum + file.size,
        0,
      );
      if (context.inventory.files.length < 500 && totalBytes < 5_000_000)
        return [];
      return [
        finding(
          this,
          "The repository has many files or large files that may overload agent context.",
          "Give agents focused paths and exclude generated assets.",
          [`${context.inventory.files.length} files`, `${totalBytes} bytes`],
        ),
      ];
    },
  },
];
