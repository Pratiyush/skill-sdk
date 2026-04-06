import { resolve, join, dirname } from "node:path";
import { existsSync, readdirSync, statSync } from "node:fs";
import { mkdir, copyFile } from "node:fs/promises";
import { homedir } from "node:os";
import { parseSkill, validateSkill, loadSkillIgnore, isIgnored } from "@skillscraft/core";

/** Target agent install paths. */
const TARGET_PATHS: Record<string, Record<string, string>> = {
  claude: {
    project: ".claude/skills",
    user: join(homedir(), ".claude", "skills"),
  },
  copilot: {
    project: ".github/skills",
    user: "", // no user scope
  },
  codex: {
    project: ".codex/skills",
    user: "", // no user scope
  },
  generic: {
    project: ".agents/skills",
    user: join(homedir(), ".agents", "skills"),
  },
};

interface InstallOptions {
  target: string;
  scope: string;
  force?: boolean;
}

export async function installCommand(
  skillPath: string,
  options: InstallOptions
): Promise<void> {
  const { target = "generic", scope = "project", force = false } = options;

  // Resolve source path
  let sourceDir = resolve(skillPath);

  // If user passed a SKILL.md file directly, use its parent
  if (sourceDir.endsWith("SKILL.md")) {
    sourceDir = resolve(sourceDir, "..");
  }

  if (!existsSync(join(sourceDir, "SKILL.md"))) {
    console.error(`Error: No SKILL.md found in ${sourceDir}`);
    console.error("Provide a path to a skill directory containing SKILL.md.");
    process.exit(1);
  }

  // Validate the skill
  let skillName: string;
  try {
    const skill = await parseSkill(join(sourceDir, "SKILL.md"));
    const result = validateSkill(skill);

    skillName = skill.frontmatter.name;

    if (!result.valid) {
      console.error("Error: Skill has validation errors:");
      for (const err of result.errors) {
        console.error(`  - [${err.severity}] ${err.message}`);
      }
      console.error("\nFix validation errors before installing.");
      process.exit(1);
    }
  } catch (err) {
    console.error(`Error: Failed to parse skill: ${(err as Error).message}`);
    process.exit(1);
  }

  // Determine target directory
  if (!TARGET_PATHS[target]) {
    console.error(
      `Error: Unknown target "${target}". Use: claude, copilot, codex, or generic.`
    );
    process.exit(1);
  }

  const targetConfig = TARGET_PATHS[target];

  if (scope === "user" && !targetConfig.user) {
    console.error(
      `Warning: ${target} does not support user-scope installation. Using project scope.`
    );
  }

  const useUserScope = scope === "user" && targetConfig.user;
  const baseDir = useUserScope ? targetConfig.user : targetConfig.project;
  const destDir = join(baseDir, skillName);

  // Check for existing installation
  if (existsSync(destDir) && !force) {
    console.error(`Error: Skill already installed at ${destDir}`);
    console.error("Use --force to overwrite.");
    process.exit(1);
  }

  // Load .skillignore and copy only non-ignored files
  try {
    const ignorePatterns = loadSkillIgnore(sourceDir);
    const files = walkDir(sourceDir, sourceDir);
    const included = files.filter((f) => !isIgnored(f, ignorePatterns));

    for (const relPath of included) {
      const srcPath = join(sourceDir, relPath);
      const dstPath = join(destDir, relPath);
      await mkdir(dirname(dstPath), { recursive: true });
      await copyFile(srcPath, dstPath);
    }
  } catch (err) {
    console.error(
      `Error: Failed to install skill: ${(err as Error).message}`
    );
    process.exit(1);
  }

  console.log(`Installed "${skillName}" for ${target} (${scope} scope)`);
  console.log(`  Source: ${sourceDir}`);
  console.log(`  Target: ${destDir}`);

  // Show target-specific tips
  if (target === "claude") {
    console.log(
      `\nThe skill will be discovered automatically by Claude Code.`
    );
  } else if (target === "copilot") {
    console.log(
      `\nCommit the .github/skills/ directory for Copilot to discover the skill.`
    );
  } else if (target === "codex") {
    console.log(
      `\nThe skill will be available in the .codex/skills/ directory.`
    );
  } else {
    console.log(
      `\nInstalled to the generic .agents/skills/ location, compatible with any agent.`
    );
  }
}

/** Recursively walk a directory and return relative file paths. */
function walkDir(dir: string, root: string): string[] {
  const results: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    if (entry.isDirectory()) {
      results.push(...walkDir(full, root));
    } else {
      results.push(full.slice(root.length + 1));
    }
  }
  return results;
}
