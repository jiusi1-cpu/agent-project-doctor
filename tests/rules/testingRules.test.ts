import path from "node:path";

import { testingRules } from "../../src/rules/testingRules.js";
import { scanRepository } from "../../src/scanner/scanRepository.js";

async function runTestingRules(fixture: string) {
  const inventory = await scanRepository({
    rootPath: path.resolve("tests/fixtures", fixture),
  });
  return testingRules.flatMap((rule) => rule.evaluate({ inventory }));
}

describe("testingRules", () => {
  it("reports missing test command and test directory", async () => {
    const findings = await runTestingRules("empty-repo");

    expect(findings.map((finding) => finding.id)).toEqual(
      expect.arrayContaining([
        "test.command.missing",
        "test.directory.missing",
      ]),
    );
  });

  it("detects risky affirmative skip-test language", async () => {
    const findings = await runTestingRules("skip-tests-agent");

    expect(findings.map((finding) => finding.id)).toContain(
      "test.skip.language",
    );
  });

  it("does not flag negated do-not-skip-tests language", async () => {
    const findings = await runTestingRules("do-not-skip-tests-agent");

    expect(findings.map((finding) => finding.id)).not.toContain(
      "test.skip.language",
    );
  });
});
