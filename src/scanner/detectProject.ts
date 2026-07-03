import type { FileRecord, ProjectSignals } from "../reports/model.js";
import { readJsonSafe } from "./readJsonSafe.js";

interface PackageJson {
  scripts?: Record<string, string>;
}

function has(filesByPath: Map<string, FileRecord>, path: string): boolean {
  return filesByPath.has(path);
}

function detectPackageManager(
  filesByPath: Map<string, FileRecord>,
): string | undefined {
  if (has(filesByPath, "pnpm-lock.yaml")) return "pnpm";
  if (has(filesByPath, "yarn.lock")) return "yarn";
  if (has(filesByPath, "package-lock.json")) return "npm";
  if (has(filesByPath, "bun.lockb") || has(filesByPath, "bun.lock"))
    return "bun";
  if (has(filesByPath, "package.json")) return "npm";
  return undefined;
}

function runCommand(
  packageManager: string | undefined,
  scriptName: string,
): string {
  const manager = packageManager ?? "npm";
  if (scriptName === "test") return `${manager} test`;
  if (manager === "npm") return `npm run ${scriptName}`;
  return `${manager} run ${scriptName}`;
}

export function detectProject(
  files: FileRecord[],
  filesByPath: Map<string, FileRecord>,
): ProjectSignals {
  const ecosystems: string[] = [];
  const packageManager = detectPackageManager(filesByPath);
  const scripts: Record<string, string> = {};
  const testCommands: string[] = [];
  const buildCommands: string[] = [];
  const setupCommands: string[] = [];

  const packageRecord = filesByPath.get("package.json");
  if (packageRecord?.content) {
    ecosystems.push("node");
    const parsed = readJsonSafe<PackageJson>(packageRecord.content);
    Object.assign(scripts, parsed.value?.scripts ?? {});
    for (const scriptName of Object.keys(scripts)) {
      if (
        scriptName === "test" ||
        scriptName.startsWith("test:") ||
        ["vitest", "jest", "playwright"].includes(scriptName)
      ) {
        testCommands.push(runCommand(packageManager, scriptName));
      }
      if (scriptName === "build") {
        buildCommands.push(runCommand(packageManager, scriptName));
      }
    }
  }

  if (
    has(filesByPath, "pyproject.toml") ||
    has(filesByPath, "requirements.txt") ||
    has(filesByPath, "setup.py")
  ) {
    ecosystems.push("python");
  }
  if (has(filesByPath, "go.mod")) {
    ecosystems.push("go");
  }
  if (has(filesByPath, "Cargo.toml")) {
    ecosystems.push("rust");
  }

  if (
    files.some((file) => file.path === "package.json") &&
    !ecosystems.includes("node")
  ) {
    ecosystems.push("node");
  }

  return {
    ecosystems,
    packageManager,
    scripts,
    testCommands,
    buildCommands,
    setupCommands,
  };
}
