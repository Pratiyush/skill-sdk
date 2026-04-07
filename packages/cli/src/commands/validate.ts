import { resolve, join } from "node:path";
import { stat } from "node:fs/promises";
import { parseSkill, validateSkill } from "@skillscraft/core";

interface ValidateOptions {
  strict?: boolean;
  json?: boolean;
}

export async function validateCommand(
  path: string,
  options: ValidateOptions
): Promise<void> {
  const skillPath = resolve(path);

  // Determine SKILL.md path
  let skillMdPath: string;
  const pathStat = await stat(skillPath).catch(() => null);

  if (pathStat?.isDirectory()) {
    skillMdPath = join(skillPath, "SKILL.md");
  } else {
    skillMdPath = skillPath;
  }

  try {
    const skill = await parseSkill(skillMdPath);
    const result = validateSkill(skill);

    const errors = result.errors.filter((e) => e.severity === "error");
    const warnings = result.errors.filter((e) => e.severity === "warning");

    if (options.json) {
      const jsonResult = {
        valid: result.valid,
        errors,
        warnings,
        path: skillMdPath,
      };
      process.stdout.write(JSON.stringify(jsonResult, null, 2) + "\n");
      if (errors.length > 0 || (options.strict && warnings.length > 0)) {
        process.exit(1);
      }
      return;
    }

    if (errors.length === 0 && warnings.length === 0) {
      console.log(`\n  ✓ ${skillMdPath} is valid\n`);
      return;
    }

    if (errors.length > 0) {
      console.log(`\n  ✗ ${errors.length} error(s) found:\n`);
      for (const err of errors) {
        console.log(`    ERROR [${err.rule}] ${err.field}: ${err.message}`);
      }
    }

    if (warnings.length > 0) {
      console.log(`\n  ⚠ ${warnings.length} warning(s):\n`);
      for (const warn of warnings) {
        console.log(`    WARN  [${warn.rule}] ${warn.field}: ${warn.message}`);
      }
    }

    console.log();

    if (errors.length > 0 || (options.strict && warnings.length > 0)) {
      process.exit(1);
    }
  } catch (err) {
    if (options.json) {
      const jsonResult = {
        valid: false,
        errors: [
          {
            field: "file",
            message: (err as Error).message,
            severity: "error" as const,
            rule: "parse.error",
          },
        ],
        warnings: [],
        path: skillMdPath,
      };
      process.stdout.write(JSON.stringify(jsonResult, null, 2) + "\n");
    } else {
      console.error(`\n  ✗ ${(err as Error).message}\n`);
    }
    process.exit(1);
  }
}
