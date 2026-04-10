# @skillscraft/core

Parse, validate, and lint Agent Skills against the Agent Skills specification.

## Installation

```bash
npm install @skillscraft/core
```

## What it exports

- `parseSkill(filePath)` -- parse a SKILL.md file into a `ParsedSkill` object (frontmatter + body)
- `validateSkill(skill)` -- validate a parsed skill against the specification, returning errors and warnings
- `lintSkill(skill)` -- lint a parsed skill for best practices (description quality, body length, naming)
- `loadSkillManifest(dirPath)` -- load a full skill manifest from a directory (skill + files + directory flags)
- `LINT_RULES` -- the set of built-in lint rules

All types from `@skillscraft/spec` are re-exported for convenience.

## Usage

### Parse a skill

```typescript
import { parseSkill } from "@skillscraft/core";

const skill = await parseSkill("/path/to/my-skill/SKILL.md");
console.log(skill.frontmatter.name); // "my-skill"
console.log(skill.body); // markdown body content
```

### Validate a skill

```typescript
import { parseSkill, validateSkill } from "@skillscraft/core";

const skill = await parseSkill("/path/to/my-skill/SKILL.md");
const result = validateSkill(skill);

if (result.valid) {
  console.log("Skill is valid.");
} else {
  result.errors.forEach((e) => console.error(e.message));
}
```

### Lint a skill

```typescript
import { parseSkill, lintSkill } from "@skillscraft/core";

const skill = await parseSkill("/path/to/my-skill/SKILL.md");
const result = lintSkill(skill);

result.diagnostics.forEach((d) =>
  console.log(`[${d.severity}] ${d.message}`)
);
```

## License

Apache-2.0

## Links

- [Main repository](https://github.com/Pratiyush/skill-sdk)
- [Documentation](https://pratiyush.github.io/skill-sdk)
