import path from "node:path";

import { DEFAULT_IGNORED_DIRECTORIES } from "../config/defaults.js";

export function shouldIgnorePath(relativePath: string): boolean {
  const parts = relativePath.split(/[\\/]+/).filter(Boolean);
  return parts.some((part) =>
    (DEFAULT_IGNORED_DIRECTORIES as readonly string[]).includes(part),
  );
}

export function toRelativePath(rootPath: string, absolutePath: string): string {
  return path.relative(rootPath, absolutePath).split(path.sep).join("/");
}
