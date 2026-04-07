import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { parseSkill } from "../src/parser.js";
import { validateSkill } from "../src/validator.js";

const FIXTURES = join(import.meta.dirname, "fixtures");

describe("validateSkill", () => {
  it("validates a valid skill without errors", async () => {
    const skill = await parseSkill(join(FIXTURES, "valid-skill/SKILL.md"));
    const result = validateSkill(skill);

    expect(result.valid).toBe(true);
    expect(result.errors.filter((e) => e.severity === "error")).toHaveLength(0);
  });

  it("catches invalid name format", async () => {
    const skill = await parseSkill(join(FIXTURES, "invalid-skill/SKILL.md"));
    const result = validateSkill(skill);

    expect(result.valid).toBe(false);
    const nameErrors = result.errors.filter((e) => e.field === "name");
    expect(nameErrors.length).toBeGreaterThan(0);
    expect(nameErrors.some((e) => e.rule === "name.format")).toBe(true);
  });

  it("catches empty description", async () => {
    const skill = await parseSkill(join(FIXTURES, "invalid-skill/SKILL.md"));
    const result = validateSkill(skill);

    const descErrors = result.errors.filter((e) => e.field === "description");
    expect(descErrors.some((e) => e.rule === "description.required")).toBe(true);
  });

  it("catches compatibility exceeding max length", async () => {
    const skill = await parseSkill(join(FIXTURES, "invalid-skill/SKILL.md"));
    const result = validateSkill(skill);

    const compatErrors = result.errors.filter(
      (e) => e.rule === "compatibility.maxLength"
    );
    expect(compatErrors.length).toBe(1);
  });

  it("warns on unknown frontmatter fields", async () => {
    const skill = await parseSkill(join(FIXTURES, "invalid-skill/SKILL.md"));
    const result = validateSkill(skill);

    const unknownWarnings = result.errors.filter(
      (e) => e.rule === "frontmatter.unknownField"
    );
    expect(unknownWarnings.length).toBeGreaterThan(0);
    expect(unknownWarnings[0].severity).toBe("warning");
  });

  it("catches name not matching directory", async () => {
    const skill = await parseSkill(join(FIXTURES, "invalid-skill/SKILL.md"));
    const result = validateSkill(skill);

    const dirErrors = result.errors.filter(
      (e) => e.rule === "name.matchesDirectory"
    );
    expect(dirErrors.length).toBe(1);
  });

  it("validates a skill with extended fields (security, testing, composition) successfully", async () => {
    const skill = await parseSkill(join(FIXTURES, "extended-skill/SKILL.md"));
    const result = validateSkill(skill);

    // No errors should be raised for well-formed extended fields
    const errors = result.errors.filter((e) => e.severity === "error");
    expect(errors).toHaveLength(0);
    expect(result.valid).toBe(true);

    // No "unknown field" warnings for extended fields either
    const unknownWarnings = result.errors.filter(
      (e) =>
        e.rule === "frontmatter.unknownField" &&
        ["security", "testing", "composition", "tools"].includes(e.field)
    );
    expect(unknownWarnings).toHaveLength(0);
  });
});
