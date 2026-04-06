import { resolve, join } from "node:path";
import { existsSync } from "node:fs";
import { readdir, stat, mkdir, copyFile } from "node:fs/promises";
import {
  parseSkill,
  validateSkill,
  lintSkill,
  loadSkillIgnore,
  isIgnored,
} from "@skillscraft/core";

interface PublishOptions {
  dryRun?: boolean;
  outDir?: string;
}

export async function publishCommand(
  skillPath: string,
  options: PublishOptions
): Promise<void> {
  const { dryRun = false, outDir = ".skill-package" } = options;

  // Resolve source
  let sourceDir = resolve(skillPath);
  if (sourceDir.endsWith("SKILL.md")) {
    sourceDir = resolve(sourceDir, "..");
  }

  const skillMdPath = join(sourceDir, "SKILL.md");
  if (!existsSync(skillMdPath)) {
    console.error(`Error: No SKILL.md found in ${sourceDir}`);
    process.exit(1);
  }

  // Parse and validate
  console.log("Validating skill...");
  const skill = await parseSkill(skillMdPath);
  const validation = validateSkill(skill);

  if (!validation.valid) {
    console.error("Validation failed:");
    for (const err of validation.errors) {
      console.error(`  \u2717 [${err.severity}] ${err.message}`);
    }
    process.exit(1);
  }
  console.log("  \u2713 Validation passed");

  // Lint
  const lint = lintSkill(skill);
  if (!lint.passed) {
    console.log("  Lint warnings:");
    for (const d of lint.diagnostics) {
      console.log(`    \u26A0 [${d.severity}] ${d.message}`);
    }
  } else {
    console.log("  \u2713 Lint clean");
  }

  // Load .skillignore patterns
  const ignorePatterns = loadSkillIgnore(sourceDir);
  console.log(`  Loaded ${ignorePatterns.length} ignore pattern(s)`);

  // Collect files, applying .skillignore filter
  const allFiles = await collectFiles(sourceDir);
  const included = allFiles.filter((f) => !isIgnored(f.relativePath, ignorePatterns));
  const excluded = allFiles.filter((f) => isIgnored(f.relativePath, ignorePatterns));
  const totalSize = included.reduce((sum, f) => sum + f.size, 0);

  console.log(
    `\nPackage contents (${included.length} files, ${formatSize(totalSize)}):`
  );
  for (const f of included) {
    console.log(`  ${f.relativePath} (${formatSize(f.size)})`);
  }

  if (excluded.length > 0) {
    console.log(`\nExcluded by .skillignore (${excluded.length} files):`);
    for (const f of excluded) {
      console.log(`  - ${f.relativePath}`);
    }
  }

  if (dryRun) {
    console.log("\n[dry-run] Would publish skill: " + skill.frontmatter.name);
    console.log("[dry-run] No changes made.");
    return;
  }

  // Package to output directory — copy only included files
  const packageDir = resolve(outDir, skill.frontmatter.name);
  for (const f of included) {
    const destPath = join(packageDir, f.relativePath);
    await mkdir(join(destPath, ".."), { recursive: true });
    await copyFile(join(sourceDir, f.relativePath), destPath);
  }

  console.log(`\nPackaged "${skill.frontmatter.name}" to ${packageDir}/`);
  console.log("\nTo publish to npm as a skill package:");
  console.log(`  cd ${packageDir}`);
  console.log("  npm publish --access public");
  console.log("\nTo install in a project:");
  console.log(`  skill install ${packageDir} --target claude`);
}

async function collectFiles(
  dir: string,
  base?: string
): Promise<Array<{ relativePath: string; size: number }>> {
  const root = base || dir;
  const entries = await readdir(dir, { withFileTypes: true });
  const files: Array<{ relativePath: string; size: number }> = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.name === "node_modules" || entry.name === ".git") continue;

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath, root)));
    } else {
      const s = await stat(fullPath);
      files.push({
        relativePath: fullPath.slice(root.length + 1),
        size: s.size,
      });
    }
  }
  return files;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
