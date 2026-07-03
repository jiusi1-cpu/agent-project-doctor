import { renderMarkdown } from "../../src/reports/renderMarkdown.js";
import { createTestReport } from "./testReport.js";

describe("renderMarkdown", () => {
  it("renders score, findings, recommendations, and disclaimer", () => {
    const markdown = renderMarkdown(createTestReport());

    expect(markdown).toContain("# Agent Project Doctor Summary");
    expect(markdown).toContain("Score:");
    expect(markdown).toContain("Destructive <command> detected");
    expect(markdown).toContain("Require explicit approval.");
    expect(markdown).toContain("best-effort readiness signal scan");
    expect(markdown).not.toContain("SECRET_TOKEN");
  });
});
