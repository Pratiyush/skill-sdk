import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { parseSkill } from "../src/parser.js";

const FIXTURES = join(import.meta.dirname, "fixtures");

describe("parseSkill", () => {
  it("parses a valid SKILL.md", async () => {
    const skill = await parseSkill(join(FIXTURES, "valid-skill/SKILL.md"));

    expect(skill.frontmatter.name).toBe("valid-skill");
    expect(skill.frontmatter.description).toContain("valid test skill");
    expect(skill.frontmatter.license).toBe("MIT");
    expect(skill.frontmatter.compatibility).toBe("Requires Node.js 22+");
    expect(skill.frontmatter.metadata).toEqual({ author: "test", version: "1.0" });
    expect(skill.body).toContain("# Valid Skill");
    expect(skill.dirPath).toContain("valid-skill");
  });

  it("throws on missing file", async () => {
    await expect(
      parseSkill(join(FIXTURES, "nonexistent/SKILL.md"))
    ).rejects.toThrow();
  });

  it("throws on missing frontmatter", async () => {
    // Create a temp file without frontmatter
    const { writeFile, mkdtemp, rm } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const dir = await mkdtemp(join(tmpdir(), "skillcraft-test-"));
    const file = join(dir, "SKILL.md");
    await writeFile(file, "# No frontmatter here\nJust content.");

    await expect(parseSkill(file)).rejects.toThrow("No valid YAML frontmatter");
    await rm(dir, { recursive: true });
  });

  it("parses frontmatter with allowed-tools", async () => {
    const { writeFile, mkdtemp, rm } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const dir = await mkdtemp(join(tmpdir(), "skillcraft-test-"));
    const skillDir = join(dir, "test-skill");
    const { mkdir } = await import("node:fs/promises");
    await mkdir(skillDir);
    const file = join(skillDir, "SKILL.md");
    await writeFile(
      file,
      '---\nname: test-skill\ndescription: Test.\nallowed-tools: Bash(git:*) Read\n---\n\nContent.'
    );

    const skill = await parseSkill(file);
    expect(skill.frontmatter["allowed-tools"]).toBe("Bash(git:*) Read");
    await rm(dir, { recursive: true });
  });
});
