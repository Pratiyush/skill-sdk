---
name: project-maintenance
description: >
  Maintain project health by enforcing PR checklists, tracking open issues,
  verifying release readiness, and ensuring framework phases are up to date.
  Use when reviewing PRs, creating issues, preparing releases, or auditing project state.
license: MIT
compatibility: Node.js 22+ with gh CLI installed
metadata:
  author: skillscraft
  version: "1.0"
  category: project-management
allowed-tools: Bash Read Write Edit
---

# Project Maintenance

## When to use this skill

Activate when the user wants to:
- Review a PR against the project checklist before merging
- Create a well-structured GitHub issue from a bug report or feature request
- Check if the project is release-ready (all checks green, issues triaged, changelog updated)
- Audit the project for stale issues, missing labels, or incomplete PRs
- Verify framework development phase compliance (alpha/beta/RC/stable)

## Instructions

### PR Review Checklist

When reviewing a PR, run through every item. Report pass/fail for each:

```
node scripts/pr-checklist.js --pr <number>
```

The script checks:

1. **Title** — follows conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`)
2. **Description** — has a `## Summary` section with at least one bullet point
3. **Tests** — CI status is green; no skipped required checks
4. **Build** — `pnpm build` succeeds with no new warnings
5. **Lint** — `pnpm lint` passes (no new violations)
6. **Typecheck** — `pnpm typecheck` passes
7. **Changelog** — CHANGELOG.md updated if the PR is user-facing
8. **Breaking changes** — flagged in title with `!` or in description with `BREAKING CHANGE`
9. **Labels** — PR has at least one label (bug, enhancement, documentation, etc.)
10. **Reviewers** — at least one reviewer assigned
11. **Branch** — source branch name is descriptive (not `patch-1` or `main`)
12. **Files** — no secrets, .env files, or large binaries committed

Output a markdown table with status for each item and an overall verdict.

### Issue Creation

When creating an issue, use this structure:

```
node scripts/create-issue.js --title "<title>" --type <bug|feature|task> [--labels "label1,label2"] [--assignee "@user"]
```

The script generates a well-formed issue body:

**Bug template:**
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Severity assessment

**Feature template:**
- Problem statement
- Proposed solution
- Acceptance criteria
- Priority classification

**Task template:**
- Description
- Subtasks checklist
- Dependencies
- Definition of done

### Release Readiness Check

Run the full release audit:

```
node scripts/release-check.js [--version <semver>]
```

This checks:
1. All GitHub Actions workflows are green on the default branch
2. No open P0/P1 issues blocking the release
3. CHANGELOG.md has an entry for the target version
4. Package versions are consistent across the monorepo
5. All packages build successfully
6. All tests pass (unit + e2e)
7. No `TODO` or `FIXME` comments referencing the current milestone
8. Dependencies are up to date (no critical security advisories)
9. README and docs reference the correct version numbers
10. Git tag doesn't already exist for the target version

### Project Health Audit

Run periodically to catch drift:

```
node scripts/health-audit.js
```

Checks:
- Issues older than 30 days without activity → flag as stale
- PRs older than 7 days without review → flag for attention
- Issues without labels → flag for triage
- Milestone progress → report completion percentage
- Dependency freshness → list outdated packages
- Test coverage trends → warn if declining

### OS Framework Phase Compliance

The project follows the Open Source Framework pipeline. Each phase has entry gates and deliverables:

```
0 CAPTURE → 1 VALIDATE → 1.5 STEERING → 2 BRAND → 3 STRUCTURE
→ 4 CONTENT → 5 CONTRIBUTION → 5.5 PRE-LAUNCH QA → 6 LAUNCH → 7 GROW → 8 MAINTAIN
```

| Phase | Name | Entry Gate | Deliverable |
|-------|------|-----------|-------------|
| 0 | Capture | Raw idea exists | Idea brief |
| 1 | Validate | Brief written | Scorecard (/25): BUILD or KILL |
| 1.5 | Project Steering | Score >= 20 | Steering doc with technical constraints |
| 2 | Brand | Steering approved | README header, LICENSE, npm name reserved |
| 3 | Structure | Brand defined | Repo layout, file schema, tasks.md |
| 4 | Content | Structure committed | Source code or .md files |
| 5 | Contribution | Content complete | PR/issue templates, CONTRIBUTING.md, CI |
| 5.5 | Pre-Launch QA | CI green | QA report, link audit, adversarial review |
| 6 | Launch | QA passed | Live repo, Reddit/HN/X posts |
| 7 | Grow | Launched | Stars, forks, contributors |
| 8 | Maintain | Growing | Monthly verification, merge PRs |

When checking phase compliance:
1. Read `_progress.md` or infer current phase from repo state
2. Verify all entry gates for the current phase are met
3. Check that the previous phase's deliverables exist
4. Report any gaps blocking phase advancement

### Version Phase Mapping

| Version Pattern | Release Phase | Requirements |
|----------------|--------------|--------------|
| `0.9.x` | Pre-production | API may change, marked prerelease on GitHub |
| `1.0.0` | Production | Stable API, first non-prerelease |
| `x.y.z-alpha.N` | Alpha | Core features working, known bugs OK |
| `x.y.z-beta.N` | Beta | Feature-complete, no P0 bugs, docs started |
| `x.y.z-rc.N` | RC | All tests green, docs complete, no P0/P1 bugs |

### Task Tracking Rules

After completing ANY task:
1. Mark it `[x]` in tasks.md IMMEDIATELY
2. Update `_progress.md` with current phase status
3. Update CHANGELOG.md for user-facing changes
4. Each task = one commit, each commit = verified before push

### PR Rules (from OS Framework)

- Each PR: ONE category or ONE structural change (never both)
- PR title: conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`)
- PR body: list of changes with `## Summary` section
- All content verified before PR
- VERY SMALL PRs preferred — one intent per PR

## Output format

All scripts output structured JSON with a summary:

```json
{
  "check": "pr-checklist",
  "target": "#42",
  "passed": 10,
  "failed": 2,
  "warnings": 1,
  "items": [
    { "name": "Title format", "status": "pass" },
    { "name": "Tests green", "status": "fail", "detail": "CI check 'typecheck' is pending" }
  ],
  "verdict": "NEEDS_WORK"
}
```

Verdicts: `READY` (all pass), `NEEDS_WORK` (any fail), `WARNING` (no fails but has warnings)

## Gotchas

- Requires `gh` CLI to be authenticated (`gh auth status`)
- PR checks use the GitHub API — rate limits apply (5000 req/hr for authenticated users)
- The release check assumes conventional commits for changelog classification
- Health audit only checks the default branch, not feature branches
- Phase compliance reads `package.json` version — ensure it's updated before checking
- Issue templates are opinionated — adjust the scripts for your team's conventions
