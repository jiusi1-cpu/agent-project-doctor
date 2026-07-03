import path from "node:path";

import type { ProjectInventory } from "../reports/model.js";
import { detectProject } from "./detectProject.js";
import { collectFileInventory } from "./fileInventory.js";

export interface ScanRepositoryInput {
  rootPath: string;
}

function createFilesByPath(
  files: ProjectInventory["files"],
): Map<string, ProjectInventory["files"][number]> {
  return new Map(files.map((file) => [file.path, file]));
}

export async function scanRepository(
  input: ScanRepositoryInput,
): Promise<ProjectInventory> {
  const rootPath = path.resolve(input.rootPath);
  const files = await collectFileInventory(rootPath);
  const filesByPath = createFilesByPath(files);
  const signals = detectProject(files, filesByPath);

  return {
    rootPath,
    files,
    filesByPath,
    signals,
    warnings: [],
  };
}
