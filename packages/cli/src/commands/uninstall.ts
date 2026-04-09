import { resolve, join } from "node:path";
import { existsSync, rmSync } from "node:fs";
import { homedir } from "node:os";

const TARGET_PATHS: Record<string, Record<string, string>> = {
  claude: { project: ".claude/skills", user: join(homedir(), ".claude", "skills") },
  "claude-code": { project: ".claude/skills", user: join(homedir(), ".claude", "skills") },
  copilot: { project: ".github/skills", user: "" },
  codex: { project: ".codex/skills", user: "" },
  cursor: { project: ".cursor/skills", user: join(homedir(), ".cursor", "skills") },
  windsurf: { project: ".windsurf/skills", user: join(homedir(), ".windsurf", "skills") },
  aider: { project: ".aider/skills", user: join(homedir(), ".aider", "skills") },
  goose: { project: ".goose/skills", user: join(homedir(), ".goose", "skills") },
  gemini: { project: ".gemini/skills", user: join(homedir(), ".gemini", "skills") },
  "gemini-cli": { project: ".gemini/skills", user: join(homedir(), ".gemini", "skills") },
  junie: { project: ".junie/skills", user: "" },
  "roo-code": { project: ".roo/skills", user: join(homedir(), ".roo", "skills") },
  opencode: { project: ".opencode/skills", user: join(homedir(), ".opencode", "skills") },
  amp: { project: ".amp/skills", user: join(homedir(), ".amp", "skills") },
  "open-claw": { project: ".openclaw/skills", user: join(homedir(), ".openclaw", "skills") },
  generic: { project: ".agents/skills", user: join(homedir(), ".agents", "skills") },
};

interface UninstallOptions {
  target: string;
  scope: string;
}

export async function uninstallCommand(
  name: string,
  options: UninstallOptions
): Promise<void> {
  const { target = "generic", scope = "project" } = options;

  if (!TARGET_PATHS[target]) {
    console.error(
      `Error: Unknown target "${target}". Use: claude, copilot, codex, cursor, windsurf, aider, goose, gemini, junie, roo-code, opencode, amp, open-claw, generic.`
    );
    process.exit(1);
  }

  const targetConfig = TARGET_PATHS[target];
  const useUserScope = scope === "user" && targetConfig.user;
  const baseDir = useUserScope ? targetConfig.user : targetConfig.project;
  const skillDir = join(baseDir, name);

  if (!existsSync(skillDir)) {
    console.error(`Error: Skill "${name}" not found at ${skillDir}`);
    console.error(
      `Check the --target (${target}) and --scope (${scope}) options.`
    );
    process.exit(1);
  }

  try {
    rmSync(skillDir, { recursive: true, force: true });
    console.log(`Uninstalled "${name}" from ${target} (${scope} scope)`);
    console.log(`  Removed: ${skillDir}`);
  } catch (err) {
    console.error(
      `Error: Failed to uninstall skill: ${(err as Error).message}`
    );
    process.exit(1);
  }
}
