<div align="center">

# Agentic Skills Framework

**The TypeScript toolkit for building, validating, and shipping Agent Skills.**

[![npm version](https://img.shields.io/badge/npm-pre--release-orange?style=flat-square)](https://www.npmjs.com/package/@skillscraft/core)
[![CI](https://img.shields.io/github/actions/workflow/status/Pratiyush/agentic-skills-framework/ci.yml?style=flat-square)](https://github.com/Pratiyush/agentic-skills-framework/actions)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

Build, validate, lint, and publish Agent Skills that work across
**Claude Code, GitHub Copilot, Cursor, OpenAI Codex, Gemini CLI, VS Code**, and 25+ more agents.

</div>

## Why?

The Agent Skills specification defines a simple, open format for giving AI agents new capabilities. It's adopted by **33+ agent products** — but the ecosystem lacks TypeScript tooling.

**Agentic Skills Framework** fills that gap with three layers:

| Layer | Package | What it does |
|-------|---------|-------------|
| **Spec** | `@skillscraft/spec` | TypeScript types and JSON schemas for the Agent Skills specification |
| **Core** | `@skillscraft/core` | Parse, validate, and lint SKILL.md files |
| **CLI** | `@skillscraft/cli` | `skill init`, `skill validate`, `skill lint`, `skill install`, `skill uninstall` commands |

## Install

```bash
# CLI (recommended for most users)
npm install -g @skillscraft/cli

# SDK (for programmatic use)
npm install @skillscraft/core
```

## Quick Start

```bash
# Scaffold a new skill
skill init my-skill

# Validate against the spec
skill validate my-skill

# Lint for best practices
skill lint my-skill --fix
```

## CLI Commands

### `skill init <name>`

Scaffold a new Agent Skill from a template.

```bash
skill init my-skill                    # Basic template
skill init my-skill -t with-scripts    # With scripts/ directory
skill init my-skill -t with-references # With references/ directory
```

### `skill validate <path>`

Validate a skill against the Agent Skills specification.

```bash
skill validate ./my-skill              # Validate a skill directory
skill validate ./my-skill --strict     # Treat warnings as errors
```

### `skill lint <path>`

Lint a skill for best practices (beyond spec compliance).

```bash
skill lint ./my-skill                  # Check best practices
skill lint ./my-skill --fix            # Show fix suggestions
```

**Lint rules:**

| Rule | Severity | What it checks |
|------|----------|---------------|
| `context-budget` | warn | Body under 5000 tokens |
| `description-quality` | warn | Includes "when to use" trigger |
| `no-generic-instructions` | warn | Flags vague phrases |
| `progressive-disclosure` | warn | Uses references/ for large skills |
| `defaults-over-menus` | warn | Clear default over option menus |
| `gotchas-present` | info | Suggests gotchas section |

> **`--strict` mode**: When `--strict` is passed to `skill validate` or `skill validate-all`, all `warn`-level lint diagnostics are promoted to errors and will fail the check. Use this in CI pipelines.

### `skill list`

List installed skills.

```bash
skill list                              # List all installed skills
skill list -t claude                    # Filter by target agent
skill list -s user --json               # JSON output, user scope only
```

### `skill install <path>`

Install a skill for a specific agent.

```bash
skill install ./my-skill                          # Install for generic agent
skill install ./my-skill -t claude                 # Install for Claude Code
skill install github:owner/repo/path -t copilot    # Install from GitHub
skill install ./my-skill --skip-validation          # Skip validation (WIP skills)
```

### `skill uninstall <name>`

Remove a previously installed skill.

```bash
skill uninstall my-skill                # Uninstall from generic agent
skill uninstall my-skill -t claude      # Uninstall from Claude Code
skill uninstall my-skill -s user        # Uninstall from user scope
```

### `skill publish <path>`

Package and prepare a skill for publishing.

```bash
skill publish ./my-skill                # Package for npm
skill publish ./my-skill --dry-run      # Preview without changes
skill publish ./my-skill -o ./out       # Custom output directory
```

### `skill validate-all`

Validate all skills in a directory tree.

```bash
skill validate-all                      # Validate skills/ and examples/
skill validate-all -d ./my-skills       # Custom root directory
skill validate-all --strict --json      # Strict mode with JSON output
```

## Programmatic API

```typescript
import { parseSkill, validateSkill, lintSkill } from "@skillscraft/core";

// Parse a SKILL.md file
const skill = await parseSkill("./my-skill/SKILL.md");

// Validate against spec
const validation = validateSkill(skill);
if (!validation.valid) {
  console.log(validation.errors);
}

// Validate with custom severity overrides
const result = validateSkill(skill, {
  rules: { "metadata.valueType": "warning" }
});

// Lint for best practices
const lint = lintSkill(skill);
for (const d of lint.diagnostics) {
  console.log(`[${d.severity}] ${d.rule}: ${d.message}`);
}
```

## Packages

| Package | Description | npm |
|---------|-------------|-----|
| [`@skillscraft/spec`](packages/spec) | TypeScript types + JSON schemas | [![npm](https://img.shields.io/badge/npm-pre--release-orange?style=flat-square)](https://www.npmjs.com/package/@skillscraft/spec) |
| [`@skillscraft/core`](packages/core) | Parser, validator, linter | [![npm](https://img.shields.io/badge/npm-pre--release-orange?style=flat-square)](https://www.npmjs.com/package/@skillscraft/core) |
| [`@skillscraft/cli`](packages/cli) | CLI tool | [![npm](https://img.shields.io/badge/npm-pre--release-orange?style=flat-square)](https://www.npmjs.com/package/@skillscraft/cli) |

## Compatible Agents

Skills built with this framework work with any agent that supports the Agent Skills format:

Claude Code, GitHub Copilot, Cursor, OpenAI Codex, VS Code, Gemini CLI, JetBrains Junie, OpenHands, Goose, Roo Code, Amp, Letta, TRAE, Kiro, and more.

## Specification

The Agent Skills specification defines a portable format for giving AI agents new capabilities. See the [full specification reference](https://pratiyush.github.io/agentic-skills-framework/specification.html).

### Adopters

Skills built with this format are supported by: Claude Code, GitHub Copilot, Cursor, OpenAI Codex, VS Code, Gemini CLI, JetBrains Junie, Windsurf, Goose, Roo Code, Amp, OpenCode, Aider, Open-Claw, and more. See the [install command](https://pratiyush.github.io/agentic-skills-framework/tutorial.html) for the full target list.

## Marketplace

Browse and install production skills from [SkillsCraft Hub](https://github.com/Pratiyush/skillscraft-hub).

## Links

- [Specification Reference](https://pratiyush.github.io/agentic-skills-framework/specification.html)
- [Concepts Guide](https://pratiyush.github.io/agentic-skills-framework/concepts.html)
- [SDK Tutorial](https://pratiyush.github.io/agentic-skills-framework/tutorial.html)
- [Documentation Site](https://pratiyush.github.io/agentic-skills-framework)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[Apache-2.0](LICENSE)
