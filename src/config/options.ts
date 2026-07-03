import path from "node:path";

import { DEFAULT_OUTPUT_DIRECTORY } from "./defaults.js";

export interface ScanOptions {
  path?: string;
  out?: string;
  force?: boolean;
  json?: boolean;
}

export interface NormalizedScanOptions {
  rootPath: string;
  outDir: string;
  force: boolean;
  json: boolean;
}

export function normalizeScanOptions(
  options: ScanOptions = {},
): NormalizedScanOptions {
  const rootPath = path.resolve(options.path ?? process.cwd());
  const out = options.out ?? DEFAULT_OUTPUT_DIRECTORY;
  const outDir = path.isAbsolute(out)
    ? path.resolve(out)
    : path.resolve(rootPath, out);

  return {
    rootPath,
    outDir,
    force: options.force ?? false,
    json: options.json ?? false,
  };
}
