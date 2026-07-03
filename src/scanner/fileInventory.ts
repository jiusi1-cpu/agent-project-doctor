import fs from "node:fs/promises";
import path from "node:path";

import { DEFAULT_MAX_TEXT_FILE_BYTES } from "../config/defaults.js";
import type { FileRecord } from "../reports/model.js";
import { shouldIgnorePath, toRelativePath } from "./ignore.js";

const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".cs",
]);

function isEnvValueFile(relativePath: string): boolean {
  return path.posix.basename(relativePath) === ".env";
}

function isAllowlistedTextFile(relativePath: string): boolean {
  const normalized = relativePath.split(path.sep).join("/");
  const basename = path.posix.basename(normalized);

  if (/^(README|CONTRIBUTING|LICENSE|SECURITY)(\..*)?$/i.test(basename))
    return true;
  if (
    ["AGENTS.md", "CLAUDE.md", ".clinerules", ".gitignore", ".npmrc"].includes(
      basename,
    )
  )
    return true;
  if (/^\.env\.(example|sample|template)$/i.test(basename)) return true;
  if (
    [
      "package.json",
      "pyproject.toml",
      "requirements.txt",
      "Cargo.toml",
      "go.mod",
    ].includes(basename)
  )
    return true;
  if (normalized.startsWith(".cursor/rules/")) return true;
  if (normalized.startsWith(".github/workflows/")) return true;

  return false;
}

async function walk(
  rootPath: string,
  currentPath: string,
  files: string[],
): Promise<void> {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(currentPath, entry.name);
    const relativePath = toRelativePath(rootPath, absolutePath);
    if (shouldIgnorePath(relativePath)) continue;
    if (entry.isSymbolicLink()) continue;

    if (entry.isDirectory()) {
      await walk(rootPath, absolutePath, files);
      continue;
    }

    if (entry.isFile()) {
      files.push(absolutePath);
    }
  }
}

export async function collectFileInventory(
  rootPath: string,
): Promise<FileRecord[]> {
  const absoluteFiles: string[] = [];
  await walk(rootPath, rootPath, absoluteFiles);

  const records: FileRecord[] = [];
  for (const absolutePath of absoluteFiles.sort()) {
    const relativePath = toRelativePath(rootPath, absolutePath);
    const stats = await fs.stat(absolutePath);
    const extension = path.extname(relativePath);
    const record: FileRecord = {
      path: relativePath,
      size: stats.size,
      extension,
      contentRead: false,
    };

    if (isEnvValueFile(relativePath)) {
      record.reasonContentNotRead = "env_value_protected";
    } else if (
      SOURCE_EXTENSIONS.has(extension) &&
      !isAllowlistedTextFile(relativePath)
    ) {
      record.reasonContentNotRead = "not_allowlisted";
    } else if (!isAllowlistedTextFile(relativePath)) {
      record.reasonContentNotRead = "not_allowlisted";
    } else if (stats.size > DEFAULT_MAX_TEXT_FILE_BYTES) {
      record.reasonContentNotRead = "file_too_large";
    } else {
      record.content = await fs.readFile(absolutePath, "utf8");
      record.contentRead = true;
    }

    records.push(record);
  }

  return records;
}
