import { renderAgentsDraft } from "../../src/reports/renderAgentsDraft.js";
import { createTestReport } from "./testReport.js";

describe("renderAgentsDraft", () => {
  it("uses detected commands and marks unknown commands as not detected", () => {
    const draft = renderAgentsDraft(createTestReport());

    expect(draft).toContain("# AGENTS.generated.md");
    expect(draft).toContain("npm test");
    expect(draft).toContain("No setup command detected yet");
    expect(draft).toContain("No build command detected yet");
    expect(draft).not.toContain("npm run build");
  });

  it("includes safety boundaries and generated-file warning", () => {
    const draft = renderAgentsDraft(createTestReport());

    expect(draft).toContain("Generated draft");
    expect(draft).toContain("Do not edit secrets");
    expect(draft).toContain("Do not deploy to production");
  });
});
