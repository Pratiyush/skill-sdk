import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import type { SkillManifest, SkillFile } from "@skillscraft/spec";
import { parseSkill } from "./parser.js";

/** Normalize path separators to forward slashes for cross-platform consistency. */
function normalizeSep(p: string): string {
  return p.replace(/\\/g, "/");
}

/**
 * Load a complete skill manifest from a directory.
 *
 * @param dirPath - Path to the skill directory (must contain SKILL.md).
 * @returns Full skill manifest with file listing.
 */
export async function loadSkillManifest(dirPath: string): Promise<SkillManifest> {
  const skillMdPath = join(dirPath, "SKILL.md");
  const skill = await parseSkill(skillMdPath);
  const files = await listFiles(dirPath);

  return {
    skill,
    files,
    hasScripts: files.some((f) => f.relativePath.startsWith("scripts/")),
    hasReferences: files.some((f) => f.relativePath.startsWith("references/")),
    hasAssets: files.some((f) => f.relativePath.startsWith("assets/")),
  };
}

async function listFiles(dirPath: string): Promise<SkillFile[]> {
  const files: SkillFile[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".git") continue;
        await walk(fullPath);
      } else {
        const fileStat = await stat(fullPath);
        files.push({
          relativePath: normalizeSep(relative(dirPath, fullPath)),
          absolutePath: fullPath,
          size: fileStat.size,
        });
      }
    }
  }

  await walk(dirPath);
  return files;
}
