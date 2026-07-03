import path from "node:path";

import { ciRules } from "../../src/rules/ciRules.js";
import { scanRepository } from "../../src/scanner/scanRepository.js";

async function runCiRules(fixture: string) {
  const inventory = await scanRepository({
    rootPath: path.resolve("tests/fixtures", fixture),
  });
  return ciRules.flatMap((rule) => rule.evaluate({ inventory }));
}

describe("ciRules", () => {
  it("reports missing workflow and unclear entrypoint", async () => {
    const findings = await runCiRules("empty-repo");

    expect(findings.map((finding) => finding.id)).toEqual(
      expect.arrayContaining([
        "ci.workflow.missing",
        "project.entrypoint.unclear",
      ]),
    );
  });

  it("does not report missing CI when workflow exists", async () => {
    const findings = await runCiRules("ci-ready-node");

    expect(findings.map((finding) => finding.id)).not.toContain(
      "ci.workflow.missing",
    );
  });
});
