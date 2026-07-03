import type { Rule } from "./types.js";
import { finding } from "./helpers.js";

function hasFile(
  context: Parameters<Rule["evaluate"]>[0],
  predicate: (path: string) => boolean,
): boolean {
  return context.inventory.files.some((file) => predicate(file.path));
}

export const documentationRules: Rule[] = [
  {
    id: "docs.readme.missing",
    title: "README is missing",
    category: "documentation",
    severity: "medium",
    evaluate(context) {
      if (hasFile(context, (filePath) => /^README(\..*)?$/i.test(filePath)))
        return [];
      return [
        finding(
          this,
          "No README file was detected.",
          "Add a README with setup, usage, and validation guidance.",
          ["README* not found"],
        ),
      ];
    },
  },
  {
    id: "docs.quickstart.missing",
    title: "README quick start is unclear",
    category: "documentation",
    severity: "low",
    evaluate(context) {
      const readme = context.inventory.files.find((file) =>
        /^README(\..*)?$/i.test(file.path),
      );
      if (!readme) return [];
      const content = readme.content?.toLowerCase() ?? "";
      if (
        /(install|setup|usage|quick start|getting started|npm|pnpm|yarn)/i.test(
          content,
        )
      )
        return [];
      return [
        finding(
          this,
          "README exists but does not show an obvious setup or usage path.",
          "Add a short quick start section.",
          [readme.path],
        ),
      ];
    },
  },
  {
    id: "docs.contributing.missing",
    title: "Contribution guidance is missing",
    category: "documentation",
    severity: "low",
    evaluate(context) {
      const hasContributing = hasFile(context, (filePath) =>
        /^CONTRIBUTING(\..*)?$/i.test(filePath),
      );
      const readme = context.inventory.files.find((file) =>
        /^README(\..*)?$/i.test(file.path),
      );
      if (hasContributing || /contribut/i.test(readme?.content ?? ""))
        return [];
      return [
        finding(
          this,
          "No contribution guidance was detected.",
          "Add CONTRIBUTING.md or a README contribution section.",
          ["CONTRIBUTING* not found"],
        ),
      ];
    },
  },
  {
    id: "docs.license.missing",
    title: "License file is missing",
    category: "documentation",
    severity: "low",
    evaluate(context) {
      if (hasFile(context, (filePath) => /^LICENSE(\..*)?$/i.test(filePath)))
        return [];
      return [
        finding(
          this,
          "No license file was detected.",
          "Add a license file so agents and contributors know reuse terms.",
          ["LICENSE* not found"],
        ),
      ];
    },
  },
];
