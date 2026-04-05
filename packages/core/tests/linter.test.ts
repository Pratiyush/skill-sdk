import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { parseSkill } from "../src/parser.js";
import { lintSkill, LINT_RULES } from "../src/linter.js";

const FIXTURES = join(import.meta.dirname, "fixtures");

describe("lintSkill", () => {
  it("passes a well-formed skill", async () => {
    const skill = await parseSkill(join(FIXTURES, "valid-skill/SKILL.md"));
    const result = lintSkill(skill);

    expect(result.passed).toBe(true);
    expect(result.diagnostics.filter((d) => d.severity === "error")).toHaveLength(0);
  });

  it("warns when description lacks 'when' clause", async () => {
    const { writeFile, mkdtemp, rm, mkdir } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const dir = await mkdtemp(join(tmpdir(), "skillcraft-lint-"));
    const skillDir = join(dir, "no-when");
    await mkdir(skillDir);
    await writeFile(
      join(skillDir, "SKILL.md"),
      "---\nname: no-when\ndescription: Does something useful.\n---\n\n# Instructions\n\nDo stuff."
    );

    const skill = await parseSkill(join(skillDir, "SKILL.md"));
    const result = lintSkill(skill);

    expect(
      result.diagnostics.some((d) => d.rule === "description-quality")
    ).toBe(true);

    await rm(dir, { recursive: true });
  });

  it("flags generic instructions", async () => {
    const { writeFile, mkdtemp, rm, mkdir } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const dir = await mkdtemp(join(tmpdir(), "skillcraft-lint-"));
    const skillDir = join(dir, "generic");
    await mkdir(skillDir);
    await writeFile(
      join(skillDir, "SKILL.md"),
      '---\nname: generic\ndescription: Test skill. Use when testing.\n---\n\n# Instructions\n\nHandle errors appropriately.\nFollow best practices for authentication.'
    );

    const skill = await parseSkill(join(skillDir, "SKILL.md"));
    const result = lintSkill(skill);

    const genericDiags = result.diagnostics.filter(
      (d) => d.rule === "no-generic-instructions"
    );
    expect(genericDiags.length).toBeGreaterThanOrEqual(2);

    await rm(dir, { recursive: true });
  });

  it("exports all lint rules", () => {
    expect(LINT_RULES.length).toBeGreaterThan(0);
    for (const rule of LINT_RULES) {
      expect(rule.id).toBeTruthy();
      expect(rule.name).toBeTruthy();
      expect(rule.description).toBeTruthy();
    }
  });
});
