# @skillscraft/spec

TypeScript types, constants, and JSON schemas for the [Agent Skills specification](https://agentskills.io).

## Installation

```bash
npm install @skillscraft/spec
```

## What it exports

**Core types** -- mirror the agentskills.io specification exactly:

- `SkillFrontmatter` -- YAML frontmatter fields (name, description, license, compatibility, metadata, allowed-tools)
- `ParsedSkill` -- full parsed SKILL.md (frontmatter + body + file paths)
- `SkillManifest` -- complete skill package (parsed skill + file listing + directory flags)
- `SkillFile`, `SkillMetadata`

**Extended types** -- optional enterprise-grade additions (security, testing, tool-binding, composition):

- `SecurityManifest`, `CapabilityDeclaration`
- `TestScenario`, `TestCase`, `TestAssertion`
- `ToolBinding`, `ToolDependency`
- `SkillComposition`, `SkillDependency`

**Result types** -- for validation and linting outputs:

- `ValidationResult`, `ValidationError`, `ValidationSeverity`
- `LintResult`, `LintDiagnostic`, `LintRule`, `LintSeverity`

**Constants:**

- `SPEC_LIMITS` -- field length limits from the specification (name, description, compatibility, body)
- `SKILL_NAME_REGEX` -- regex for valid skill names (lowercase alphanumeric + hyphens, 1-64 chars)

## Usage

```typescript
import type { SkillFrontmatter, ParsedSkill } from "@skillscraft/spec";
import { SPEC_LIMITS, SKILL_NAME_REGEX } from "@skillscraft/spec";

const frontmatter: SkillFrontmatter = {
  name: "my-skill",
  description: "A skill that does something useful.",
};

console.log(SPEC_LIMITS.NAME_MAX_LENGTH); // 64
console.log(SKILL_NAME_REGEX.test("my-skill")); // true
```

## License

Apache-2.0

## Links

- [Main repository](https://github.com/Pratiyush/agentic-skills-framework)
- [Agent Skills specification](https://agentskills.io)
