import path from "node:path";

import { agentRules } from "../../src/rules/agentRules.js";
import { scanRepository } from "../../src/scanner/scanRepository.js";

async function runAgentRules(fixture: string) {
  const inventory = await scanRepository({
    rootPath: path.resolve("tests/fixtures", fixture),
  });
  return agentRules.flatMap((rule) => rule.evaluate({ inventory }));
}

describe("agentRules", () => {
  it("reports missing AGENTS.md", async () => {
    const findings = await runAgentRules("minimal-node");

    expect(findings.map((finding) => finding.id)).toContain(
      "agent.agents_md.missing",
    );
  });

  it("accepts scoped and validated AGENTS.md while noting cursor rules", async () => {
    const findings = await runAgentRules("agent-ready-node");
    const ids = findings.map((finding) => finding.id);

    expect(ids).not.toContain("agent.scope.missing");
    expect(ids).not.toContain("agent.validation.missing");
    expect(ids).toContain("agent.cursor_rules.detected");
  });

  it("reports conflicting validation commands across agent docs", async () => {
    const findings = await runAgentRules("conflicting-agent-docs");

    expect(findings.map((finding) => finding.id)).toContain(
      "agent.conflicting.instructions",
    );
    expect(findings.map((finding) => finding.id)).toContain(
      "agent.claude_md.detected",
    );
  });
});
