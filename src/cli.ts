import { Command } from "commander";
import pc from "picocolors";

import { packageName, runScan } from "./index.js";

export function createCli(): Command {
  const program = new Command();

  program
    .name(packageName)
    .description("Local AI coding agent readiness signal scanner.")
    .version("0.1.0");

  program
    .command("scan")
    .description(
      "Scan a local repository and generate agent readiness signals.",
    )
    .option("--path <dir>", "repository path to scan", process.cwd())
    .option(
      "--out <dir>",
      "output directory for generated reports",
      ".agent-project-doctor",
    )
    .option(
      "--force",
      "overwrite known generated outputs inside the output directory",
      false,
    )
    .option("--json", "print machine-readable JSON to stdout", false)
    .action(
      async (options: {
        path: string;
        out: string;
        force: boolean;
        json: boolean;
      }) => {
        const report = await runScan(options);
        if (options.json) {
          console.log(
            JSON.stringify(
              {
                score: report.score,
                findingCount: report.findings.length,
                outDir: report.options.outDir,
                generatedFiles: [
                  "agent-doctor-report.html",
                  "agent-doctor-summary.md",
                  "AGENTS.generated.md",
                ],
              },
              null,
              2,
            ),
          );
          return;
        }

        console.log(pc.green("Agent Project Doctor scan complete."));
        console.log(`Score: ${report.score.score}/100 (${report.score.grade})`);
        console.log(`Findings: ${report.findings.length}`);
        console.log(`Output: ${report.options.outDir}`);
      },
    );

  return program;
}

export async function main(argv = process.argv): Promise<void> {
  await createCli().parseAsync(argv);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(pc.red(message));
  process.exitCode = 1;
});
