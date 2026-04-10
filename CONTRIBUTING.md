# Contributing to Agentic Skills Framework

Thanks for your interest in contributing! This guide covers how to contribute code, report issues, and submit skill templates.

## Getting Started

```bash
# Clone and install
git clone https://github.com/Pratiyush/skill-sdk.git
cd skill-sdk
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

**Requirements:** Node.js >= 20, pnpm >= 10

## Project Structure

```
packages/
├── spec/   → @skillscraft/spec  (types + JSON schemas)
├── core/   → @skillscraft/core  (parser, validator, linter)
└── cli/    → @skillscraft/cli   (CLI commands)
```

Dependency chain: `cli → core → spec`

## How to Contribute

### Bug Fixes

1. Fork and create a branch: `git checkout -b fix/description`
2. Write a failing test first
3. Fix the bug
4. Run `pnpm test` to verify
5. Submit a PR with one logical change

### New Lint Rules

1. Add the rule definition to `packages/core/src/linter.ts` (LINT_RULES array)
2. Add detection logic in the `lintSkill()` function
3. Add test cases in `packages/core/tests/linter.test.ts`
4. Update the lint rules table in `README.md`

### New CLI Commands

1. Create a new file in `packages/cli/src/commands/`
2. Register it in `packages/cli/src/index.ts`
3. Add tests
4. Update the CLI section in `README.md`

### Skill Templates

Add templates in `packages/cli/src/commands/init.ts` under the `TEMPLATES` object. Each template needs:
- A unique name
- List of directories to create
- Map of files with their content (use `{{name}}` placeholder)

## Skill Creation Guidelines

Based on the Agent Skills specification and best practices.

### SKILL.md Format

Every skill is a directory with a `SKILL.md` file:

```
my-skill/
├── SKILL.md          # Required: metadata + instructions
├── scripts/          # Optional: executable code
├── references/       # Optional: documentation
└── assets/           # Optional: templates, resources
```

### Required Frontmatter

```yaml
---
name: my-skill           # 1-64 chars, lowercase + hyphens, must match directory
description: What this does and when to use it.  # 1-1024 chars
---
```

### Optional Frontmatter

```yaml
---
name: my-skill
description: What this does and when to use it.
license: Apache-2.0
compatibility: Requires Python 3.14+ and uv
metadata:
  author: your-org
  version: "1.0"
allowed-tools: Bash(git:*) Read    # Experimental
---
```

### Name Rules

- 1-64 characters
- Lowercase letters, numbers, and hyphens only
- No leading/trailing hyphens
- No consecutive hyphens (`--`)
- Must match the parent directory name

### Writing Good Descriptions

The description should explain both **what** the skill does and **when** to use it:

```yaml
# Good
description: Extract PDF text, fill forms, merge files. Use when handling PDFs.

# Bad
description: Helps with PDFs.
```

### Writing Good Instructions

**Do:**
- Start with real expertise, not generic LLM output
- Provide defaults, not option menus
- Include a gotchas section for non-obvious facts
- Use templates for structured output
- Add validation loops for multi-step workflows

**Don't:**
- Write generic advice ("handle errors appropriately")
- Include knowledge the agent already has
- Put everything inline — use progressive disclosure
- Present multiple tools as equal options without a default

### Progressive Disclosure

Keep `SKILL.md` under 500 lines / 5000 tokens. For larger skills:

1. Put core instructions in `SKILL.md`
2. Move detailed references to `references/`
3. Tell the agent **when** to load each file

```markdown
See [the API reference](references/api.md) if the API returns a non-200 status.
```

### Validation

Use `@skillscraft/cli` to check your skills:

```bash
skill validate ./my-skill    # Check spec compliance
skill lint ./my-skill --fix  # Check best practices
```

## PR Guidelines

- **One logical change per PR** — don't mix features and fixes
- Tests must pass: `pnpm test`
- Build must succeed: `pnpm build`
- Follow existing code style

## Code of Conduct

Be respectful and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).
