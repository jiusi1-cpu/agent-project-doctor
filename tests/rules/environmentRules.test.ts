import path from "node:path";

import { environmentRules } from "../../src/rules/environmentRules.js";
import { scanRepository } from "../../src/scanner/scanRepository.js";

async function runEnvironmentRules(fixture: string) {
  const inventory = await scanRepository({
    rootPath: path.resolve("tests/fixtures", fixture),
  });
  return environmentRules.flatMap((rule) => rule.evaluate({ inventory }));
}

describe("environmentRules", () => {
  it("reports env file presence without exposing env values", async () => {
    const findings = await runEnvironmentRules("risky-agent-instructions");

    const envFinding = findings.find(
      (finding) => finding.id === "env.file.present",
    );
    expect(envFinding?.evidence.join("\n")).toContain(".env");
    expect(envFinding?.evidence.join("\n")).not.toContain(
      "do-not-read-risky-value",
    );
  });

  it("reports missing gitignore and env example", async () => {
    const findings = await runEnvironmentRules("risky-agent-instructions");

    expect(findings.map((finding) => finding.id)).toEqual(
      expect.arrayContaining(["env.example.missing", "env.gitignore.missing"]),
    );
  });

  it("does not report env ignore gaps when env example and gitignore are present", async () => {
    const findings = await runEnvironmentRules("ci-ready-node");
    const ids = findings.map((finding) => finding.id);

    expect(ids).not.toContain("env.example.missing");
    expect(ids).not.toContain("env.gitignore.env_missing");
  });
});
