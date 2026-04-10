# @skillscraft/cli

CLI for building, validating, and linting Agent Skills against the Agent Skills specification.

## Installation

```bash
npm install -g @skillscraft/cli
```

This provides the `skill` command.

## Commands

### `skill init <name>`

Scaffold a new Agent Skill directory with a SKILL.md template.

```bash
skill init my-new-skill
skill init my-new-skill --template basic
```

**Options:**
- `-t, --template <template>` -- template to use (default: `basic`)

### `skill validate <path>`

Validate a skill against the Agent Skills specification.

```bash
skill validate ./my-skill/SKILL.md
skill validate ./my-skill/SKILL.md --strict
```

**Options:**
- `-s, --strict` -- treat warnings as errors

### `skill lint <path>`

Lint a skill for best practices.

```bash
skill lint ./my-skill/SKILL.md
skill lint ./my-skill/SKILL.md --fix
```

**Options:**
- `--fix` -- show fix suggestions

### `skill install <path>`

Install a skill for a specific agent or generically.

```bash
skill install ./my-skill
skill install ./my-skill --target claude --scope project
skill install ./my-skill --target copilot --scope user --force
```

**Options:**
- `-t, --target <target>` -- target agent: `claude`, `copilot`, `codex`, `generic` (default: `generic`)
- `-s, --scope <scope>` -- install scope: `project` or `user` (default: `project`)
- `-f, --force` -- overwrite existing installation

## License

Apache-2.0

## Links

- [Main repository](https://github.com/Pratiyush/skill-sdk)
- [Documentation](https://pratiyush.github.io/skill-sdk)
- [Marketplace](https://github.com/Pratiyush/agent-catalog)
