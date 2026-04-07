import { resolve, join } from "node:path";
import { existsSync, readdirSync } from "node:fs";
import { parseSkill, validateSkill, lintSkill } from "@skillscraft/core";

interface ValidateAllOptions {
  dir?: string;
  strict?: boolean;
  json?: boolean;
}

interface ValidateAllResult {
  path: string;
  valid: boolean;
  errors: Array<{ severity: string; message: string }>;
  lintDiagnostics: Array<{ severity: string; message: string }>;
  status: "passed" | "failed" | "warning";
}

/**
 * Discover all SKILL.md files in a directory tree (1 level deep).
 */
function discoverSkills(baseDir: string): string[] {
  if (!existsSync(baseDir)) return [];
  const entries = readdirSync(baseDir, { withFileTypes: true });
  const skills: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillMd = join(baseDir, entry.name, "SKILL.md");
    if (existsSync(skillMd)) {
      skills.push(skillMd);
    }
    // Also check one level deeper (for skills/skill/<name>/SKILL.md)
    const nestedDir = join(baseDir, entry.name);
    const nested = readdirSync(nestedDir, { withFileTypes: true });
    for (const sub of nested) {
      if (!sub.isDirectory()) continue;
      const nestedSkillMd = join(nestedDir, sub.name, "SKILL.md");
      if (existsSync(nestedSkillMd)) {
        skills.push(nestedSkillMd);
      }
    }
  }

  return [...new Set(skills)]; // deduplicate
}

export async function validateAllCommand(
  options: ValidateAllOptions
): Promise<void> {
  const rootDir = options.dir ? resolve(options.dir) : process.cwd();
  const strict = options.strict || false;
  const json = options.json || false;

  // Discover skills in skills/ and examples/
  const dirs = [join(rootDir, "skills"), join(rootDir, "examples")];
  const skillPaths: string[] = [];

  for (const dir of dirs) {
    skillPaths.push(...discoverSkills(dir));
  }

  if (skillPaths.length === 0) {
    if (json) {
      process.stdout.write(
        JSON.stringify(
          { passed: 0, failed: 0, warnings: 0, results: [] },
          null,
          2
        ) + "\n"
      );
    } else {
      console.log("No skills found in skills/ or examples/.");
    }
    return;
  }

  if (!json) {
    console.log(`Found ${skillPaths.length} skill(s). Validating...\n`);
  }

  let passed = 0;
  let failed = 0;
  let warnings = 0;
  const results: ValidateAllResult[] = [];

  for (const skillPath of skillPaths) {
    const relPath = skillPath.slice(rootDir.length + 1);

    try {
      const skill = await parseSkill(skillPath);
      const validation = validateSkill(skill);
      const lint = lintSkill(skill);

      const lintIssues = lint.diagnostics.length;

      let status: "passed" | "failed" | "warning" = "passed";

      if (!validation.valid) {
        failed++;
        status = "failed";
        if (!json) {
          console.log(`  \u2717 ${relPath}`);
          for (const err of validation.errors) {
            console.log(`    [${err.severity}] ${err.message}`);
          }
        }
      } else if (strict && lintIssues > 0) {
        failed++;
        status = "failed";
        if (!json) {
          console.log(`  \u2717 ${relPath} (lint issues in strict mode)`);
          for (const d of lint.diagnostics) {
            console.log(`    [${d.severity}] ${d.message}`);
          }
        }
      } else if (lintIssues > 0) {
        warnings++;
        passed++;
        status = "warning";
        if (!json) {
          console.log(`  \u2713 ${relPath} (${lintIssues} lint warning(s))`);
        }
      } else {
        passed++;
        if (!json) {
          console.log(`  \u2713 ${relPath}`);
        }
      }

      results.push({
        path: relPath,
        valid: validation.valid,
        errors: validation.errors.map((e) => ({
          severity: e.severity,
          message: e.message,
        })),
        lintDiagnostics: lint.diagnostics.map((d) => ({
          severity: d.severity,
          message: d.message,
        })),
        status,
      });
    } catch (err) {
      failed++;
      if (!json) {
        console.log(`  \u2717 ${relPath}`);
        console.log(`    Parse error: ${(err as Error).message}`);
      }
      results.push({
        path: relPath,
        valid: false,
        errors: [
          { severity: "error", message: `Parse error: ${(err as Error).message}` },
        ],
        lintDiagnostics: [],
        status: "failed",
      });
    }
  }

  if (json) {
    process.stdout.write(
      JSON.stringify(
        { passed, failed, warnings, results },
        null,
        2
      ) + "\n"
    );
  } else {
    console.log(`\n${passed} passed, ${failed} failed, ${warnings} with warnings`);
  }

  if (failed > 0) {
    process.exit(1);
  }
}
