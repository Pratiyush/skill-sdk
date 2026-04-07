import { join } from "node:path";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { parseSkill } from "@skillscraft/core";

/** Target agent install paths — mirrors install.ts. */
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

interface ListOptions {
  target?: string;
  scope?: string;
  json?: boolean;
}

async function scanDir(
  dir: string
): Promise<Array<{ name: string; description: string; path: string }>> {
  if (!existsSync(dir)) return [];
  const entries = readdirSync(dir, { withFileTypes: true });
  const skills: Array<{ name: string; description: string; path: string }> = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillMd = join(dir, entry.name, "SKILL.md");
    if (!existsSync(skillMd)) continue;

    // Use the shared parser — handles block scalars, multiline strings, etc.
    try {
      const parsed = await parseSkill(skillMd);
      skills.push({
        name: parsed.frontmatter.name || entry.name,
        description: (parsed.frontmatter.description || "").replace(/\n/g, " ").trim(),
        path: join(dir, entry.name),
      });
    } catch {
      // Skip unparseable skills
      skills.push({ name: entry.name, description: "", path: join(dir, entry.name) });
    }
  }

  return skills;
}

export async function listCommand(options: ListOptions): Promise<void> {
  const targets = options.target ? [options.target] : Object.keys(TARGET_PATHS);
  const scopes = options.scope ? [options.scope] : ["project", "user"];

  const collectedSkills: Array<{
    name: string;
    description: string;
    target: string;
    scope: string;
    path: string;
  }> = [];

  let totalFound = 0;

  for (const target of targets) {
    const config = TARGET_PATHS[target];
    if (!config) {
      if (!options.json) {
        console.error(`Unknown target: ${target}`);
      }
      continue;
    }

    for (const scope of scopes) {
      const dir = scope === "user" ? config.user : config.project;
      if (!dir) continue;

      const skills = await scanDir(dir);
      if (skills.length === 0) continue;

      totalFound += skills.length;

      if (options.json) {
        for (const skill of skills) {
          collectedSkills.push({
            name: skill.name,
            description: skill.description,
            target,
            scope,
            path: skill.path,
          });
        }
      } else {
        console.log(`\n${target} (${scope}):`);
        console.log(`  Path: ${dir}`);

        for (const skill of skills) {
          const desc = skill.description ? ` — ${skill.description}` : "";
          console.log(`  - ${skill.name}${desc}`);
        }
      }
    }
  }

  if (options.json) {
    process.stdout.write(
      JSON.stringify({ skills: collectedSkills }, null, 2) + "\n"
    );
    return;
  }

  if (totalFound === 0) {
    console.log("No installed skills found.");
    console.log("\nInstall a skill with:");
    console.log("  skill install <path> --target claude");
  } else {
    console.log(`\n${totalFound} skill(s) found.`);
  }
}
