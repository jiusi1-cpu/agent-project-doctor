import path from "node:path";

import { rules } from "../../src/rules/registry.js";
import { safetyRules } from "../../src/rules/safetyRules.js";
import { scanRepository } from "../../src/scanner/scanRepository.js";

async function runSafetyRules(fixture: string) {
  const inventory = await scanRepository({
    rootPath: path.resolve("tests/fixtures", fixture),
  });
  return safetyRules.flatMap((rule) => rule.evaluate({ inventory }));
}

describe("safetyRules", () => {
  it("reports destructive and production language", async () => {
    const findings = await runSafetyRules("risky-agent-instructions");

    expect(findings.map((finding) => finding.id)).toEqual(
      expect.arrayContaining([
        "safety.destructive.language",
        "safety.production.language",
      ]),
    );
  });

  it("keeps registry at or above the MVP rule count", () => {
    expect(rules.length).toBeGreaterThanOrEqual(24);
  });
});
