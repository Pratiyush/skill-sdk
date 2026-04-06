# Agent Skills Spec Cheatsheet

## Frontmatter Fields

| Field | Required | Max Length | Notes |
|-------|----------|-----------|-------|
| `name` | Yes | 64 chars | lowercase, digits, hyphens only |
| `description` | Yes | 1024 chars | Include "Use when" for best lint score |
| `license` | No | — | SPDX identifier (e.g., MIT, Apache-2.0) |
| `compatibility` | No | 500 chars | Runtime requirements |
| `metadata` | No | — | Key-value pairs (author, version, category) |
| `allowed-tools` | No | — | Space-separated tool names |

## Directory Structure

```
skill-name/
  SKILL.md        # Required — frontmatter + instructions
  scripts/        # Optional — executable automation
  references/     # Optional — reference documentation
  assets/         # Optional — static files, templates
  tests/          # Optional — test scenarios (extended spec)
```

## Name Rules

- Regex: `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`
- 1-64 characters
- No uppercase, underscores, or spaces

## Lint Best Practices

1. Start description with action verb or "Use when"
2. Include a `## Gotchas` section in the body
3. Keep body under 500 lines
4. Add `compatibility` if scripts need specific runtimes
5. Use `allowed-tools` to declare which agent tools are needed
6. Include `## When to use this skill` section
7. Add `license` field for published skills
