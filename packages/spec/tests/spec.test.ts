import { describe, it, expect } from "vitest";
import { SKILL_NAME_REGEX, SPEC_LIMITS } from "../src/constants.js";
import type { SkillFrontmatter } from "../src/types.js";

describe("SkillFrontmatter type", () => {
  it("has required fields: name and description", () => {
    // TypeScript compile-time check: this object satisfies SkillFrontmatter
    const fm: SkillFrontmatter = {
      name: "test-skill",
      description: "A test skill",
    };

    expect(fm.name).toBe("test-skill");
    expect(fm.description).toBe("A test skill");
  });

  it("supports optional fields", () => {
    const fm: SkillFrontmatter = {
      name: "test-skill",
      description: "A test skill",
      license: "MIT",
      compatibility: "Node 22+",
      metadata: { author: "tester" },
      "allowed-tools": "Read Edit Bash",
    };

    expect(fm.license).toBe("MIT");
    expect(fm.compatibility).toBe("Node 22+");
    expect(fm.metadata).toEqual({ author: "tester" });
    expect(fm["allowed-tools"]).toBe("Read Edit Bash");
  });
});

describe("SPEC_LIMITS constants", () => {
  it("has expected values", () => {
    expect(SPEC_LIMITS.NAME_MAX_LENGTH).toBe(64);
    expect(SPEC_LIMITS.NAME_MIN_LENGTH).toBe(1);
    expect(SPEC_LIMITS.DESCRIPTION_MAX_LENGTH).toBe(1024);
    expect(SPEC_LIMITS.DESCRIPTION_MIN_LENGTH).toBe(1);
    expect(SPEC_LIMITS.COMPATIBILITY_MAX_LENGTH).toBe(500);
    expect(SPEC_LIMITS.BODY_RECOMMENDED_MAX_TOKENS).toBe(5000);
    expect(SPEC_LIMITS.BODY_RECOMMENDED_MAX_LINES).toBe(500);
  });
});

describe("SKILL_NAME_REGEX", () => {
  it("matches valid names", () => {
    expect(SKILL_NAME_REGEX.test("my-skill")).toBe(true);
    expect(SKILL_NAME_REGEX.test("a")).toBe(true);
    expect(SKILL_NAME_REGEX.test("skill123")).toBe(true);
    expect(SKILL_NAME_REGEX.test("code-quality")).toBe(true);
    expect(SKILL_NAME_REGEX.test("a1b2c3")).toBe(true);
    expect(SKILL_NAME_REGEX.test("test-skill-name")).toBe(true);
  });

  it("rejects invalid names", () => {
    expect(SKILL_NAME_REGEX.test("-leading-hyphen")).toBe(false);
    expect(SKILL_NAME_REGEX.test("trailing-hyphen-")).toBe(false);
    expect(SKILL_NAME_REGEX.test("double--hyphen")).toBe(false);
    expect(SKILL_NAME_REGEX.test("UPPERCASE")).toBe(false);
    expect(SKILL_NAME_REGEX.test("has spaces")).toBe(false);
    expect(SKILL_NAME_REGEX.test("special!chars")).toBe(false);
    expect(SKILL_NAME_REGEX.test("")).toBe(false);
  });
});
