import type { FileRecord } from "../reports/model.js";
import { finding } from "./helpers.js";
import type { Rule } from "./types.js";

function file(files: FileRecord[], filePath: string): FileRecord | undefined {
  return files.find((candidate) => candidate.path === filePath);
}

function agentFiles(files: FileRecord[]): FileRecord[] {
  return files.filter(
    (candidate) =>
      ["AGENTS.md", "CLAUDE.md", ".clinerules"].includes(candidate.path) ||
      candidate.path.startsWith(".cursor/rules/"),
  );
}

function combinedAgentText(files: FileRecord[]): string {
  return agentFiles(files)
    .map((candidate) => candidate.content ?? "")
    .join("\n")
    .toLowerCase();
}

function mentionsScope(text: string): boolean {
  return /\b(scope|boundary|boundaries|may edit|allowed|avoid editing)\b/i.test(
    text,
  );
}

function mentionsValidation(text: string): boolean {
  return /\b(validation|validate|test|npm test|pnpm test|yarn test|checks?)\b/i.test(
    text,
  );
}

function validationCommands(text: string): Set<string> {
  const commands = new Set<string>();
  for (const match of text.matchAll(
    /\b(npm|pnpm|yarn|bun)\s+(?:run\s+)?test\b/gim,
  )) {
    commands.add(match[0].toLowerCase().replace(/\s+/g, " "));
  }
  return commands;
}

export const agentRules: Rule[] = [
  {
    id: "agent.agents_md.missing",
    title: "AGENTS.md is missing",
    category: "agent",
    severity: "medium",
    evaluate(context) {
      if (file(context.inventory.files, "AGENTS.md")) return [];
      return [
        finding(
          this,
          "No AGENTS.md file was detected.",
          "Generate and review AGENTS.generated.md, then add a maintained AGENTS.md when ready.",
          ["AGENTS.md not found"],
        ),
      ];
    },
  },
  {
    id: "agent.claude_md.detected",
    title: "CLAUDE.md detected",
    category: "agent",
    severity: "info",
    evaluate(context) {
      if (!file(context.inventory.files, "CLAUDE.md")) return [];
      return [
        finding(
          this,
          "CLAUDE.md exists.",
          "Keep CLAUDE.md consistent with AGENTS.md.",
          ["CLAUDE.md"],
        ),
      ];
    },
  },
  {
    id: "agent.cursor_rules.detected",
    title: "Cursor rules detected",
    category: "agent",
    severity: "info",
    evaluate(context) {
      if (
        !context.inventory.files.some((candidate) =>
          candidate.path.startsWith(".cursor/rules/"),
        )
      )
        return [];
      return [
        finding(
          this,
          "Cursor rules exist.",
          "Summarize shared guidance in AGENTS.md for cross-agent use.",
          [".cursor/rules/"],
        ),
      ];
    },
  },
  {
    id: "agent.conflicting.instructions",
    title: "Agent instructions may conflict",
    category: "agent",
    severity: "medium",
    evaluate(context) {
      const commands = validationCommands(
        combinedAgentText(context.inventory.files),
      );
      if (commands.size <= 1) return [];
      return [
        finding(
          this,
          "Multiple validation commands were detected across agent instruction files.",
          "Choose one primary validation command.",
          [...commands],
        ),
      ];
    },
  },
  {
    id: "agent.scope.missing",
    title: "Agent scope guidance is missing",
    category: "agent",
    severity: "medium",
    evaluate(context) {
      const text = combinedAgentText(context.inventory.files);
      if (!text || mentionsScope(text)) return [];
      return [
        finding(
          this,
          "Agent instructions do not describe edit scope or boundaries.",
          "Add scope and protected-file guidance.",
          ["agent docs"],
        ),
      ];
    },
  },
  {
    id: "agent.validation.missing",
    title: "Agent validation guidance is missing",
    category: "agent",
    severity: "medium",
    evaluate(context) {
      const text = combinedAgentText(context.inventory.files);
      if (!text || mentionsValidation(text)) return [];
      return [
        finding(
          this,
          "Agent instructions do not describe validation commands.",
          "Add exact validation commands or state that none are detected.",
          ["agent docs"],
        ),
      ];
    },
  },
];
