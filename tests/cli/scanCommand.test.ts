import fs from "node:fs";
import path from "node:path";

import { GENERATED_OUTPUT_FILES } from "../../src/config/defaults.js";
import { runScan } from "../../src/index.js";

const fixturePath = (name: string) => path.resolve("tests/fixtures", name);
const tmpPath = (name: string) => path.resolve("tmp/tests", name);

describe("runScan", () => {
  beforeEach(() => {
    fs.rmSync(path.resolve("tmp/tests"), { recursive: true, force: true });
  });

  it("writes the three known generated files", async () => {
    const outDir = tmpPath("minimal");

    const report = await runScan({
      path: fixturePath("minimal-node"),
      out: outDir,
      force: true,
    });

    expect(report.score.score).toBeLessThan(100);
    for (const fileName of GENERATED_OUTPUT_FILES) {
      expect(fs.existsSync(path.join(outDir, fileName))).toBe(true);
    }
  });

  it("protects existing outputs without force", async () => {
    const outDir = tmpPath("protected");

    await runScan({
      path: fixturePath("minimal-node"),
      out: outDir,
      force: true,
    });

    await expect(
      runScan({ path: fixturePath("minimal-node"), out: outDir }),
    ).rejects.toThrow(/already exists/);
  });

  it("does not execute package scripts while scanning", async () => {
    const rootPath = fixturePath("no-script-execution");
    const marker = path.join(rootPath, "script-was-run.txt");
    fs.rmSync(marker, { force: true });

    await runScan({ path: rootPath, out: tmpPath("no-script"), force: true });

    expect(fs.existsSync(marker)).toBe(false);
  });
});
