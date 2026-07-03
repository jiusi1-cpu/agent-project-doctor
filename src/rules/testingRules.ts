import type { Rule } from "./types.js";
import { finding, fileContentByBasename } from "./helpers.js";

function hasTestDirectory(paths: string[]): boolean {
  return paths.some((filePath) =>
    /(^|\/)(__tests__|tests?|spec)\//i.test(filePath),
  );
}

function hasCiTest(files: { path: string; content?: string }[]): boolean {
  return files.some(
    (file) =>
      file.path.startsWith(".github/workflows/") &&
      /\b(test|vitest|jest|pytest|go test|cargo test)\b/i.test(
        file.content ?? "",
      ),
  );
}

function hasRiskySkipTestsLanguage(text: string): boolean {
  const normalized = text.toLowerCase();
  const risky =
    /\b(skip tests|skip the tests|do not run tests|don'?t run tests)\b/.test(
      normalized,
    );
  const safeNegation =
    /\b(do not skip tests|don't skip tests|never skip tests)\b/.test(
      normalized,
    );
  return risky && !safeNegation;
}

export const testingRules: Rule[] = [
  {
    id: "test.command.missing",
    title: "Test command is missing",
    category: "testing",
    severity: "medium",
    evaluate(context) {
      if (context.inventory.signals.testCommands.length > 0) return [];
      return [
        finding(
          this,
          "No obvious test command was detected.",
          "Document or add a test command before relying on agents.",
          ["No test scripts found"],
        ),
      ];
    },
  },
  {
    id: "test.directory.missing",
    title: "Test directory is missing",
    category: "testing",
    severity: "low",
    evaluate(context) {
      if (hasTestDirectory(context.inventory.files.map((file) => file.path)))
        return [];
      return [
        finding(
          this,
          "No common test directory was detected.",
          "Add tests under tests/, test/, spec/, or __tests__.",
          ["No common test directory found"],
        ),
      ];
    },
  },
  {
    id: "test.ci.missing",
    title: "CI test signal is missing",
    category: "testing",
    severity: "low",
    evaluate(context) {
      if (hasCiTest(context.inventory.files)) return [];
      return [
        finding(
          this,
          "No CI workflow with an obvious test command was detected.",
          "Add or document CI validation so agents know expected checks.",
          [".github/workflows test command not found"],
        ),
      ];
    },
  },
  {
    id: "test.skip.language",
    title: "Agent instructions suggest skipping tests",
    category: "testing",
    severity: "high",
    evaluate(context) {
      const agentText = fileContentByBasename(context.inventory.files, [
        "AGENTS.md",
        "CLAUDE.md",
        ".clinerules",
      ]);
      if (!hasRiskySkipTestsLanguage(agentText)) return [];
      return [
        finding(
          this,
          "Agent instructions contain affirmative language that suggests skipping tests.",
          "Replace it with validation-first guidance.",
          ["agent instruction text"],
        ),
      ];
    },
  },
];
