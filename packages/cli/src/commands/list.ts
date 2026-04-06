import { join } from "node:path";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";

/** Target agent install paths — mirrors install.ts. */
const TARGET_PATHS: Record<string, Record<string, string>> = {
  claude: {
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
  generic: {
    project: ".agents/skills",
    user: join(homedir(), ".agents", "skills"),
  },
};

interface ListOptions {
  target?: string;
  scope?: string;
}

function scanDir(dir: string): Array<{ name: string; description: string; path: string }> {
  if (!existsSync(dir)) return [];
  const entries = readdirSync(dir, { withFileTypes: true });
  const skills: Array<{ name: string; description: string; path: string }> = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillMd = join(dir, entry.name, "SKILL.md");
    if (!existsSync(skillMd)) continue;

    const content = readFileSync(skillMd, "utf-8");
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    let name = entry.name;
    let description = "";

    if (match) {
      const nameMatch = match[1].match(/^name:\s*(.+)$/m);
      const descMatch = match[1].match(/^description:\s*[>|]?\s*\n?\s*(.+)$/m);
      if (nameMatch) name = nameMatch[1].trim();
      if (descMatch) description = descMatch[1].trim();
    }

    skills.push({ name, description, path: join(dir, entry.name) });
  }

  return skills;
}

export async function listCommand(options: ListOptions): Promise<void> {
  const targets = options.target ? [options.target] : Object.keys(TARGET_PATHS);
  const scopes = options.scope ? [options.scope] : ["project", "user"];

  let totalFound = 0;

  for (const target of targets) {
    const config = TARGET_PATHS[target];
    if (!config) {
      console.error(`Unknown target: ${target}`);
      continue;
    }

    for (const scope of scopes) {
      const dir = scope === "user" ? config.user : config.project;
      if (!dir) continue;

      const skills = scanDir(dir);
      if (skills.length === 0) continue;

      totalFound += skills.length;
      console.log(`\n${target} (${scope}):`);
      console.log(`  Path: ${dir}`);

      for (const skill of skills) {
        const desc = skill.description ? ` — ${skill.description}` : "";
        console.log(`  - ${skill.name}${desc}`);
      }
    }
  }

  if (totalFound === 0) {
    console.log("No installed skills found.");
    console.log("\nInstall a skill with:");
    console.log("  skill install <path> --target claude");
  } else {
    console.log(`\n${totalFound} skill(s) found.`);
  }
}
