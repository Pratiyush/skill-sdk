import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import type { ParsedSkill, SkillFrontmatter } from "@skillscraft/spec";

const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

/**
 * Parse a SKILL.md file into structured data.
 *
 * @param filePath - Absolute or relative path to the SKILL.md file.
 * @returns Parsed skill with frontmatter and body.
 * @throws If the file cannot be read or has no valid frontmatter.
 */
export async function parseSkill(filePath: string): Promise<ParsedSkill> {
  const absolutePath = resolve(filePath);
  // Strip UTF-8 BOM if present (some editors add it automatically)
  const content = (await readFile(absolutePath, "utf-8")).replace(/^\uFEFF/, "");

  const match = content.match(FRONTMATTER_REGEX);
  if (!match) {
    throw new Error(
      `No valid YAML frontmatter found in ${absolutePath}. ` +
        `SKILL.md must start with --- followed by YAML frontmatter and another ---.`
    );
  }

  const [, yamlContent, body] = match;

  let frontmatter: SkillFrontmatter;
  try {
    frontmatter = parseYaml(yamlContent) as SkillFrontmatter;
  } catch (err) {
    throw new Error(
      `Invalid YAML in frontmatter of ${absolutePath}: ${(err as Error).message}`
    );
  }

  if (!frontmatter || typeof frontmatter !== "object") {
    throw new Error(`Frontmatter in ${absolutePath} is not a valid YAML object.`);
  }

  return {
    frontmatter,
    body: body.trim(),
    filePath: absolutePath,
    dirPath: dirname(absolutePath),
  };
}
