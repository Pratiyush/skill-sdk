import { resolve, join, dirname } from "node:path";
import { existsSync, readdirSync, mkdtempSync } from "node:fs";
import { mkdir, copyFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { execSync } from "node:child_process";
import { parseSkill, validateSkill, loadSkillIgnore, isIgnored } from "@skillscraft/core";

/**
 * Target agent install paths.
 * Expanded coverage for 15+ agents.
 */
const TARGET_PATHS: Record<string, Record<string, string>> = {
  claude: {
    project: ".claude/skills",
    user: join(homedir(), ".claude", "skills"),
  },
  "claude-code": {
    project: ".claude/skills",
    user: join(homedir(), ".claude", "skills"),
  },
  copilot: {
    project: ".github/skills",
    user: "",
  },
  codex: {
    project: ".codex/skills",
    user: "",
  },
  cursor: {
    project: ".cursor/skills",
    user: join(homedir(), ".cursor", "skills"),
  },
  windsurf: {
    project: ".windsurf/skills",
    user: join(homedir(), ".windsurf", "skills"),
  },
  aider: {
    project: ".aider/skills",
    user: join(homedir(), ".aider", "skills"),
  },
  goose: {
    project: ".goose/skills",
    user: join(homedir(), ".goose", "skills"),
  },
  gemini: {
    project: ".gemini/skills",
    user: join(homedir(), ".gemini", "skills"),
  },
  "gemini-cli": {
    project: ".gemini/skills",
    user: join(homedir(), ".gemini", "skills"),
  },
  junie: {
    project: ".junie/skills",
    user: "",
  },
  "roo-code": {
    project: ".roo/skills",
    user: join(homedir(), ".roo", "skills"),
  },
  opencode: {
    project: ".opencode/skills",
    user: join(homedir(), ".opencode", "skills"),
  },
  amp: {
    project: ".amp/skills",
    user: join(homedir(), ".amp", "skills"),
  },
  "open-claw": {
    project: ".openclaw/skills",
    user: join(homedir(), ".openclaw", "skills"),
  },
  generic: {
    project: ".agents/skills",
    user: join(homedir(), ".agents", "skills"),
  },
};

/**
 * Resolve remote sources (github:owner/repo/path, https://github.com/...) to a local directory.
 * Returns the local path to a temp clone containing the skill.
 */
function resolveRemoteSource(source: string): string {
  // Parse github:owner/repo/path/to/skill or https://github.com/owner/repo/tree/branch/path
  let owner: string;
  let repo: string;
  let subpath: string;
  let branch = "HEAD";

  if (source.startsWith("github:")) {
    // github:owner/repo/path/to/skill
    const rest = source.slice("github:".length);
    const parts = rest.split("/");
    if (parts.length < 2) {
      throw new Error(
        `Invalid github: source "${source}". Expected: github:owner/repo[/path/to/skill]`
      );
    }
    owner = parts[0];
    repo = parts[1];
    subpath = parts.slice(2).join("/");
  } else if (source.startsWith("https://github.com/")) {
    // https://github.com/owner/repo/tree/branch/path/to/skill
    const url = new URL(source);
    const parts = url.pathname.replace(/^\//, "").split("/");
    if (parts.length < 2) {
      throw new Error(`Invalid GitHub URL "${source}"`);
    }
    owner = parts[0];
    repo = parts[1].replace(/\.git$/, "");
    if (parts[2] === "tree" && parts[3]) {
      branch = parts[3];
      subpath = parts.slice(4).join("/");
    } else {
      subpath = parts.slice(2).join("/");
    }
  } else {
    throw new Error(`Unsupported remote source: ${source}`);
  }

  const tmpDir = mkdtempSync(join(tmpdir(), "skillscraft-"));
  const cloneUrl = `https://github.com/${owner}/${repo}.git`;

  console.log(`Fetching ${owner}/${repo} (${branch})...`);
  try {
    execSync(
      `git clone --depth 1 --branch ${branch === "HEAD" ? "master" : branch} "${cloneUrl}" "${tmpDir}"`,
      { stdio: ["ignore", "pipe", "pipe"] }
    );
  } catch {
    // Fallback: try main branch
    try {
      execSync(`git clone --depth 1 "${cloneUrl}" "${tmpDir}"`, {
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (e) {
      throw new Error(
        `Failed to clone ${cloneUrl}: ${(e as Error).message}`
      );
    }
  }

  const resolvedPath = subpath ? join(tmpDir, subpath) : tmpDir;
  if (!existsSync(resolvedPath)) {
    throw new Error(
      `Path "${subpath}" not found in ${owner}/${repo}`
    );
  }
  return resolvedPath;
}

interface InstallOptions {
  target: string;
  scope: string;
  force?: boolean;
  skipValidation?: boolean;
}

export async function installCommand(
  skillPath: string,
  options: InstallOptions
): Promise<void> {
  const { target = "generic", scope = "project", force = false, skipValidation = false } = options;

  // Detect remote source (github: or https://github.com/...)
  let sourceDir: string;
  const isRemote =
    skillPath.startsWith("github:") ||
    skillPath.startsWith("https://github.com/");

  if (isRemote) {
    try {
      sourceDir = resolveRemoteSource(skillPath);
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  } else {
    sourceDir = resolve(skillPath);
  }

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
  if (!skipValidation) {
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
  } else {
    try {
      const skill = await parseSkill(join(sourceDir, "SKILL.md"));
      skillName = skill.frontmatter.name;
    } catch (err) {
      console.error(`Error: Failed to parse skill: ${(err as Error).message}`);
      process.exit(1);
    }
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
