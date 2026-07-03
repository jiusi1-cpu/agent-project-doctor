# AGENTS.generated.md

> Generated draft. Review this file before copying any guidance into AGENTS.md.

## Project Overview

- Detected ecosystems: node
- Package manager: npm

## Repository Map

- `.cursor/rules/project.md`
- `AGENTS.md`
- `README.md`
- `package.json`

## Setup Commands

- No setup command detected yet

## Build Commands

- `npm run build`

## Test / Validation Commands

- `npm test`

## Safety Rules

- Do not edit secrets or environment files without explicit confirmation.
- Do not deploy to production without explicit confirmation.
- Do not run destructive commands such as `rm -rf`, `git reset --hard`, or force push without explicit confirmation.
- Do not assume unknown setup, build, test, deploy, lint, or format commands exist.

## Files Agents Should Avoid Editing Without Confirmation

- `.env` and other secret-bearing files.
- Lockfiles unless dependency changes are intentional.
- Generated outputs and build artifacts.

## Reporting Expectations

- Summarize changed files.
- Report validation commands that were actually run.
- If validation was not run, say so directly.
