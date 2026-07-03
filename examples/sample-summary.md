# Agent Project Doctor Summary

Scanned path: `C:\Users\35834\Documents\Codex\2026-07-03\github-agent\work\agent-project-doctor\tests\fixtures\agent-ready-node`
Generated at: `2026-07-03T03:49:43.179Z`
Score: **57/100**
Grade: **C**

> This is a local best-effort readiness signal scan, not a security certification.

## Severity Counts

- high: 1
- medium: 2
- low: 4
- info: 1

## Findings

## HIGH Findings

### Production deploy language detected

- Severity: `high`
- Category: `safety`
- Message: Docs or agent instructions mention production deployment.
- Recommendation: Require explicit approval and staging guidance before production deploys.
- Evidence: production deploy phrase

## MEDIUM Findings

### Secret handling guidance is weak

- Severity: `medium`
- Category: `safety`
- Message: Docs mention secrets or environment files without clear handling guidance.
- Recommendation: Add guidance to avoid committing or printing secrets.
- Evidence: secret-related wording

### CI workflow is missing

- Severity: `medium`
- Category: `ci`
- Message: No GitHub Actions workflow was detected.
- Recommendation: Add a workflow that runs validation commands.
- Evidence: .github/workflows not found

## LOW Findings

### License file is missing

- Severity: `low`
- Category: `documentation`
- Message: No license file was detected.
- Recommendation: Add a license file so agents and contributors know reuse terms.
- Evidence: LICENSE* not found

### Test directory is missing

- Severity: `low`
- Category: `testing`
- Message: No common test directory was detected.
- Recommendation: Add tests under tests/, test/, spec/, or **tests**.
- Evidence: No common test directory found

### CI test signal is missing

- Severity: `low`
- Category: `testing`
- Message: No CI workflow with an obvious test command was detected.
- Recommendation: Add or document CI validation so agents know expected checks.
- Evidence: .github/workflows test command not found

### .gitignore is missing

- Severity: `low`
- Category: `environment`
- Message: No .gitignore file was detected.
- Recommendation: Add .gitignore and include .env patterns.
- Evidence: .gitignore not found

## INFO Findings

### Cursor rules detected

- Severity: `info`
- Category: `agent`
- Message: Cursor rules exist.
- Recommendation: Summarize shared guidance in AGENTS.md for cross-agent use.
- Evidence: .cursor/rules/

## Recommended Next Actions

1. Review high and medium findings first.
2. Review AGENTS.generated.md before copying guidance into AGENTS.md.
3. Run the repository's own validation commands manually when you decide it is safe.
