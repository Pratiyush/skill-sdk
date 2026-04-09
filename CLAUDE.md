# Project Rules — Agentic Skills Framework

## Build & Tooling

- Use latest GPG for commit signing (`brew install gnupg` or system package manager)
- pnpm version is pinned via `packageManager` field — update it when upgrading pnpm
- Minimum Node version is 20.0.0 — do not raise without justification
- Run `pnpm build && pnpm test && pnpm typecheck` before pushing

## Code Quality

- All packages use strict TypeScript (`tsconfig.json` → `strict: true`)
- ESLint 9+ flat config — run `pnpm lint` before committing
- Prettier formatting is enforced — run `pnpm format` before committing
- Test coverage target: 75% lines/functions/statements, 70% branches

## Testing

- Use vitest for unit tests, Playwright for e2e tests
- Normalize file paths in tests with `.replace(/\\/g, "/")` for Windows compatibility
- Test fixtures live in `packages/core/tests/fixtures/`

## Versioning & Release

- All three packages (`spec`, `core`, `cli`) version together via changesets (fixed mode)
- Update CHANGELOG.md with every release
- Use `pnpm changeset` to create changesets for PRs

## CLI Commands

- CLI binary is `skill` — commands: init, validate, lint, install, uninstall, list, publish, validate-all
- Install command supports `--skip-validation` for WIP skills
- validateSkill() accepts optional severity config: `validateSkill(skill, { rules: { "rule.id": "warning" } })`

## GitHub Pages

- Docs live in `docs/` and deploy via `.github/workflows/pages.yml`
- Update docs when adding/changing CLI commands or spec features

## PR Workflow

- Create GitHub issues before implementing fixes
- Branch naming: `fix/`, `feat/`, `chore/` prefixes
- Let CI pipeline pass before merging
- Update changelog and release notes with every PR
