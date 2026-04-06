---
name: release-notes
description: >
  Maintain project release notes, changelogs, and framework phase updates.
  Use when the user asks to generate a changelog, draft release notes,
  update CHANGELOG.md, or track framework phase transitions.
license: MIT
compatibility: Node.js 22+ or Python 3.11+
metadata:
  author: skillscraft
  version: "1.0"
  category: project-management
allowed-tools: Bash Read Edit Write
---

# Release Notes

## When to use this skill

Activate when the user wants to:
- Generate release notes from recent git history
- Update or create a CHANGELOG.md following Keep a Changelog format
- Draft a GitHub release body from merged PRs
- Track framework development phase transitions (alpha, beta, RC, GA)
- Summarize what changed between two git tags or commits

## Instructions

### Generating a changelog entry

1. Identify the version range — ask the user or infer from `git describe --tags`
2. Run the changelog generator script:
   ```
   node scripts/generate-changelog.js --from <tag-or-sha> --to HEAD
   ```
3. Review the grouped output (Added, Changed, Fixed, Removed)
4. Insert the new entry at the top of CHANGELOG.md, below the `## [Unreleased]` section
5. If CHANGELOG.md doesn't exist, create it from the template in `references/CHANGELOG-TEMPLATE.md`

### Drafting release notes

1. Run the same script with `--format github`:
   ```
   node scripts/generate-changelog.js --from <tag> --to HEAD --format github
   ```
2. The output is markdown suitable for a GitHub release body
3. Add a one-sentence summary at the top highlighting the most impactful change

### Tracking phase updates

1. Read the current phase from the project's package.json `version` field or a `PHASE.md` file
2. Phase progression follows: `alpha` -> `beta` -> `rc` -> `stable`
3. When updating phase, also:
   - Update the version field in package.json (e.g., `1.0.0-beta.1`)
   - Add a CHANGELOG entry noting the phase transition
   - List any breaking changes that landed since the last phase

## Commit classification

The script classifies commits by conventional commit prefixes:

| Prefix | Section |
|--------|---------|
| `feat:` | Added |
| `fix:` | Fixed |
| `refactor:` | Changed |
| `docs:` | Documentation |
| `chore:` | Maintenance |
| `BREAKING CHANGE` | Breaking |
| Other | Other |

## Output format

The script outputs structured JSON or markdown:

```json
{
  "version": "0.9.1",
  "date": "2026-04-06",
  "sections": {
    "added": ["New gallery page with search and filters"],
    "fixed": ["Corrected nav links on specification page"],
    "changed": ["Updated CI to skip empty test packages"]
  }
}
```

## Gotchas

- Always verify the `--from` tag exists before running — use `git tag -l` to list
- Merge commits are skipped by default; only first-parent commits are classified
- If the repo uses squash merges, PR titles become the commit messages — ensure they follow conventional commits
- The `--format github` flag adds emoji prefixes and contributor @mentions
- Phase transitions should always bump the pre-release segment, never the major/minor/patch
