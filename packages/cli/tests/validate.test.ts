import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { parseSkill, validateSkill } from "@skillscraft/core";

const EXAMPLES = join(import.meta.dirname, "..", "..", "..", "examples");

describe("validate command logic", () => {
  it("valid skill returns no errors", async () => {
    const skill = await parseSkill(join(EXAMPLES, "basic-skill", "SKILL.md"));
    const result = validateSkill(skill);

    expect(result.valid).toBe(true);
    const errors = result.errors.filter((e) => e.severity === "error");
    expect(errors).toHaveLength(0);
  });

  it("invalid skill (missing name) returns errors", async () => {
    // Create a fake parsed skill with missing name to test validation
    const skill = await parseSkill(join(EXAMPLES, "basic-skill", "SKILL.md"));
    // Override the frontmatter to simulate missing name
    const invalidSkill = {
      ...skill,
      frontmatter: {
        ...skill.frontmatter,
        name: "",
      },
    };

    const result = validateSkill(invalidSkill);

    expect(result.valid).toBe(false);
    const nameErrors = result.errors.filter((e) => e.field === "name");
    expect(nameErrors.length).toBeGreaterThan(0);
    expect(nameErrors.some((e) => e.rule === "name.required")).toBe(true);
  });

  it("non-existent file throws", async () => {
    const fakePath = join(EXAMPLES, "does-not-exist", "SKILL.md");

    await expect(parseSkill(fakePath)).rejects.toThrow();
  });
});
