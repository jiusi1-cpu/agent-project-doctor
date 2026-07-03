import { finding } from "./helpers.js";
import type { Rule } from "./types.js";

export const ciRules: Rule[] = [
  {
    id: "project.entrypoint.unclear",
    title: "Project entrypoint is unclear",
    category: "project",
    severity: "low",
    evaluate(context) {
      if (
        context.inventory.signals.ecosystems.length > 0 &&
        Object.keys(context.inventory.signals.scripts).length > 0
      )
        return [];
      return [
        finding(
          this,
          "No obvious project entrypoint or script metadata was detected.",
          "Document the main entrypoint and common commands.",
          ["No ecosystem scripts found"],
        ),
      ];
    },
  },
  {
    id: "ci.workflow.missing",
    title: "CI workflow is missing",
    category: "ci",
    severity: "medium",
    evaluate(context) {
      if (
        context.inventory.files.some((file) =>
          file.path.startsWith(".github/workflows/"),
        )
      )
        return [];
      return [
        finding(
          this,
          "No GitHub Actions workflow was detected.",
          "Add a workflow that runs validation commands.",
          [".github/workflows not found"],
        ),
      ];
    },
  },
];
