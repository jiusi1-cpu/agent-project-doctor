import path from "node:path";

import { detectProject } from "../../src/scanner/detectProject.js";
import { scanRepository } from "../../src/scanner/scanRepository.js";

describe("detectProject", () => {
  it("detects Node scripts and package manager from inventory", async () => {
    const inventory = await scanRepository({
      rootPath: path.resolve("tests/fixtures/mixed-ecosystem"),
    });

    const signals = detectProject(inventory.files, inventory.filesByPath);

    expect(signals.ecosystems).toEqual(
      expect.arrayContaining(["node", "python", "go", "rust"]),
    );
    expect(signals.packageManager).toBe("pnpm");
    expect(signals.testCommands).toEqual(["pnpm test", "pnpm run test:unit"]);
    expect(signals.buildCommands).toEqual(["pnpm run build"]);
  });

  it("reports Node for a package manifest even when no test script exists", async () => {
    const inventory = await scanRepository({
      rootPath: path.resolve("tests/fixtures/no-script-execution"),
    });

    const signals = detectProject(inventory.files, inventory.filesByPath);

    expect(signals.ecosystems).toContain("node");
    expect(signals.testCommands).toEqual(["npm test"]);
  });
});
