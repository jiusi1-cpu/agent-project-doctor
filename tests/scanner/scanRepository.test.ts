import fs from "node:fs";
import path from "node:path";

import { scanRepository } from "../../src/scanner/scanRepository.js";

const fixturePath = (name: string) => path.resolve("tests/fixtures", name);

describe("scanRepository", () => {
  it("returns safe inventory while ignoring dependency and git directories", async () => {
    const inventory = await scanRepository({
      rootPath: fixturePath("minimal-node"),
    });

    expect(inventory.filesByPath.has("package.json")).toBe(true);
    expect(inventory.filesByPath.has("README.md")).toBe(true);
    expect(
      inventory.files.some((file) => file.path.includes("node_modules")),
    ).toBe(false);
  });

  it("reads allowlisted documentation but does not read ordinary source content", async () => {
    const inventory = await scanRepository({
      rootPath: fixturePath("minimal-node"),
    });

    expect(inventory.filesByPath.get("README.md")?.content).toContain(
      "Minimal Node",
    );
    const source = inventory.filesByPath.get("src/index.ts");
    expect(source).toMatchObject({
      contentRead: false,
      reasonContentNotRead: "not_allowlisted",
    });
    expect(source?.content).toBeUndefined();
  });

  it("detects env files without reading env values", async () => {
    const inventory = await scanRepository({
      rootPath: fixturePath("minimal-node"),
    });

    const envFile = inventory.filesByPath.get(".env");
    expect(envFile).toMatchObject({
      contentRead: false,
      reasonContentNotRead: "env_value_protected",
    });
    expect(envFile?.content).toBeUndefined();
  });

  it("parses package metadata without executing package scripts", async () => {
    const rootPath = fixturePath("no-script-execution");
    const marker = path.join(rootPath, "script-was-run.txt");
    fs.rmSync(marker, { force: true });

    const inventory = await scanRepository({ rootPath });

    expect(inventory.filesByPath.has("package.json")).toBe(true);
    expect(inventory.signals.scripts).toMatchObject({
      build: expect.stringContaining("script-was-run.txt"),
      test: expect.stringContaining("script-was-run.txt"),
    });
    expect(fs.existsSync(marker)).toBe(false);
  });
});
