import type { FileRecord } from "../reports/model.js";
import { finding } from "./helpers.js";
import type { Rule } from "./types.js";

function hasPath(files: FileRecord[], path: string): boolean {
  return files.some((file) => file.path === path);
}

function hasEnvExample(files: FileRecord[]): boolean {
  return files.some((file) =>
    /^\.env\.(example|sample|template)$/i.test(file.path),
  );
}

function envFiles(files: FileRecord[]): FileRecord[] {
  return files.filter((file) => file.path === ".env");
}

export const environmentRules: Rule[] = [
  {
    id: "env.example.missing",
    title: "Environment example is missing",
    category: "environment",
    severity: "medium",
    evaluate(context) {
      if (
        envFiles(context.inventory.files).length === 0 ||
        hasEnvExample(context.inventory.files)
      )
        return [];
      return [
        finding(
          this,
          "A .env file exists but no environment example file was detected.",
          "Add .env.example with placeholder keys only.",
          [".env present"],
        ),
      ];
    },
  },
  {
    id: "env.file.present",
    title: ".env file is present",
    category: "environment",
    severity: "medium",
    evaluate(context) {
      const matches = envFiles(context.inventory.files);
      if (matches.length === 0) return [];
      return [
        finding(
          this,
          ".env exists in the scanned tree. Values were not read.",
          "Ensure .env is ignored and not committed.",
          matches.map((file) => file.path),
        ),
      ];
    },
  },
  {
    id: "env.gitignore.missing",
    title: ".gitignore is missing",
    category: "environment",
    severity: "low",
    evaluate(context) {
      if (hasPath(context.inventory.files, ".gitignore")) return [];
      return [
        finding(
          this,
          "No .gitignore file was detected.",
          "Add .gitignore and include .env patterns.",
          [".gitignore not found"],
        ),
      ];
    },
  },
  {
    id: "env.gitignore.env_missing",
    title: ".gitignore does not ignore env files",
    category: "environment",
    severity: "medium",
    evaluate(context) {
      const gitignore = context.inventory.filesByPath.get(".gitignore");
      if (!gitignore) return [];
      if (/^\.env(\*|$)/m.test(gitignore.content ?? "")) return [];
      return [
        finding(
          this,
          ".gitignore exists but does not ignore .env files.",
          "Add .env or .env* to .gitignore.",
          [".gitignore"],
        ),
      ];
    },
  },
];
