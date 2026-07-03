import path from "node:path";

import { documentationRules } from "../../src/rules/documentationRules.js";
import { scanRepository } from "../../src/scanner/scanRepository.js";

async function runDocumentationRules(fixture: string) {
  const inventory = await scanRepository({
    rootPath: path.resolve("tests/fixtures", fixture),
  });
  return documentationRules.flatMap((rule) => rule.evaluate({ inventory }));
}

describe("documentationRules", () => {
  it("reports missing README", async () => {
    const findings = await runDocumentationRules("empty-repo");

    expect(findings.map((finding) => finding.id)).toContain(
      "docs.readme.missing",
    );
  });

  it("reports missing contribution and license guidance", async () => {
    const findings = await runDocumentationRules("minimal-node");

    expect(findings.map((finding) => finding.id)).toEqual(
      expect.arrayContaining([
        "docs.contributing.missing",
        "docs.license.missing",
      ]),
    );
  });
});
