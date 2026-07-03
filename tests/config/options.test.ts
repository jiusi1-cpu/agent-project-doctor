import path from "node:path";

import {
  DEFAULT_IGNORED_DIRECTORIES,
  DEFAULT_MAX_TEXT_FILE_BYTES,
} from "../../src/config/defaults.js";
import { normalizeScanOptions } from "../../src/config/options.js";

describe("normalizeScanOptions", () => {
  it("resolves the scan path and default output directory to absolute paths", () => {
    const cwd = path.resolve("tests/fixtures/minimal-node");

    const options = normalizeScanOptions({ path: cwd });

    expect(options.rootPath).toBe(cwd);
    expect(options.outDir).toBe(path.join(cwd, ".agent-project-doctor"));
    expect(options.force).toBe(false);
    expect(options.json).toBe(false);
  });

  it("resolves an explicit relative output directory against the scan path", () => {
    const cwd = path.resolve("tests/fixtures/minimal-node");

    const options = normalizeScanOptions({
      path: cwd,
      out: "tmp/report",
      force: true,
      json: true,
    });

    expect(options.outDir).toBe(path.join(cwd, "tmp/report"));
    expect(options.force).toBe(true);
    expect(options.json).toBe(true);
  });
});

describe("defaults", () => {
  it("keeps scanner safety defaults centralized", () => {
    expect(DEFAULT_MAX_TEXT_FILE_BYTES).toBe(256_000);
    expect(DEFAULT_IGNORED_DIRECTORIES).toEqual(
      expect.arrayContaining([
        ".git",
        "node_modules",
        "dist",
        "build",
        ".next",
        ".turbo",
        "coverage",
        ".agent-project-doctor",
      ]),
    );
  });
});
