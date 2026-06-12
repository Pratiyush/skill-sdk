import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { mkdir, cp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";

const EXAMPLES = join(import.meta.dirname, "..", "..", "..", "examples");

/**
 * Simulate the install logic from the install command
 * without calling process.exit() or console output.
 *
 * This mirrors the core path-calculation and copy logic
 * from packages/cli/src/commands/install.ts.
 */

const TARGET_PATHS: Record<string, Record<string, string>> = {
  claude: {
    project: ".claude/skills",
    user: "",
  },
  copilot: {
    project: ".github/skills",
    user: "",
  },
  codex: {
    project: ".codex/skills",
    user: "",
  },
  "open-claw": {
    project: ".openclaw/skills",
    user: "",
  },
  generic: {
    project: ".agents/skills",
    user: "",
  },
};

interface InstallTestOptions {
  target: string;
  scope: string;
  force?: boolean;
}

/**
 * Compute the destination directory for an install operation.
 * This extracts the path-calculation logic from the install command
 * so we can test it without process.exit side-effects.
 */
function computeDestDir(
  baseProjectDir: string,
  skillName: string,
  options: InstallTestOptions
): string {
  const { target = "generic", scope = "project" } = options;
  const targetConfig = TARGET_PATHS[target];
  if (!targetConfig) {
    throw new Error(`Unknown target "${target}"`);
  }
  const useUserScope = scope === "user" && targetConfig.user;
  const baseDir = useUserScope ? targetConfig.user : targetConfig.project;
  return join(baseProjectDir, baseDir, skillName);
}

/** Simulate the install: validate, create dir, and copy. */
async function simulateInstall(
  sourceDir: string,
  destDir: string,
  force: boolean
): Promise<void> {
  if (existsSync(destDir) && !force) {
    throw new Error(`Skill already installed at ${destDir}`);
  }
  await mkdir(destDir, { recursive: true });
  await cp(sourceDir, destDir, { recursive: true });
}

describe("install command logic", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `skill-install-test-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    if (existsSync(tempDir)) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("creates target directory with correct files", async () => {
    const sourceDir = join(EXAMPLES, "basic-skill");
    const destDir = computeDestDir(tempDir, "basic-skill", {
      target: "generic",
      scope: "project",
    });

    await simulateInstall(sourceDir, destDir, false);

    expect(existsSync(destDir)).toBe(true);
    expect(existsSync(join(destDir, "SKILL.md"))).toBe(true);
  });

  it("respects --target flag for path calculation", () => {
    const claudeDest = computeDestDir(tempDir, "my-skill", {
      target: "claude",
      scope: "project",
    });
    expect(claudeDest).toBe(join(tempDir, ".claude/skills", "my-skill"));

    const copilotDest = computeDestDir(tempDir, "my-skill", {
      target: "copilot",
      scope: "project",
    });
    expect(copilotDest).toBe(join(tempDir, ".github/skills", "my-skill"));

    const codexDest = computeDestDir(tempDir, "my-skill", {
      target: "codex",
      scope: "project",
    });
    expect(codexDest).toBe(join(tempDir, ".codex/skills", "my-skill"));

    const openClawDest = computeDestDir(tempDir, "my-skill", {
      target: "open-claw",
      scope: "project",
    });
    expect(openClawDest).toBe(join(tempDir, ".openclaw/skills", "my-skill"));

    const genericDest = computeDestDir(tempDir, "my-skill", {
      target: "generic",
      scope: "project",
    });
    expect(genericDest).toBe(join(tempDir, ".agents/skills", "my-skill"));
  });

  it("errors if destination exists without --force", async () => {
    const sourceDir = join(EXAMPLES, "basic-skill");
    const destDir = computeDestDir(tempDir, "basic-skill", {
      target: "generic",
      scope: "project",
    });

    // First install succeeds
    await simulateInstall(sourceDir, destDir, false);
    expect(existsSync(destDir)).toBe(true);

    // Second install without --force should throw
    await expect(simulateInstall(sourceDir, destDir, false)).rejects.toThrow(
      /already installed/
    );

    // With --force, it should succeed
    await expect(
      simulateInstall(sourceDir, destDir, true)
    ).resolves.toBeUndefined();
  });
});
