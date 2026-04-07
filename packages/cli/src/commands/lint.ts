import { resolve, join } from "node:path";
import { stat } from "node:fs/promises";
import { parseSkill, lintSkill } from "@skillscraft/core";

interface LintOptions {
  fix?: boolean;
  json?: boolean;
}

const SEVERITY_ICONS: Record<string, string> = {
  error: "✗",
  warn: "⚠",
  info: "ℹ",
};

export async function lintCommand(
  path: string,
  options: LintOptions
): Promise<void> {
  const skillPath = resolve(path);

  let skillMdPath: string;
  const pathStat = await stat(skillPath).catch(() => null);

  if (pathStat?.isDirectory()) {
    skillMdPath = join(skillPath, "SKILL.md");
  } else {
    skillMdPath = skillPath;
  }

  try {
    const skill = await parseSkill(skillMdPath);
    const result = lintSkill(skill);

    if (options.json) {
      const jsonResult = {
        passed: result.passed,
        diagnostics: result.diagnostics,
        path: skillMdPath,
      };
      process.stdout.write(JSON.stringify(jsonResult, null, 2) + "\n");
      const errorCount = result.diagnostics.filter(
        (d) => d.severity === "error"
      ).length;
      if (errorCount > 0) {
        process.exit(1);
      }
      return;
    }

    if (result.diagnostics.length === 0) {
      console.log(`\n  ✓ ${skillMdPath} passes all lint rules\n`);
      return;
    }

    const grouped = {
      error: result.diagnostics.filter((d) => d.severity === "error"),
      warn: result.diagnostics.filter((d) => d.severity === "warn"),
      info: result.diagnostics.filter((d) => d.severity === "info"),
    };

    console.log(`\n  Lint results for ${skillMdPath}:\n`);

    for (const [severity, diagnostics] of Object.entries(grouped)) {
      if (diagnostics.length === 0) continue;
      for (const d of diagnostics) {
        const icon = SEVERITY_ICONS[severity] || "•";
        const loc = d.line ? `:${d.line}` : "";
        console.log(
          `    ${icon} [${d.rule}]${loc} ${d.message}`
        );
        if (options.fix && d.fix) {
          console.log(`      → Fix: ${d.fix}`);
        }
      }
    }

    const counts = [
      grouped.error.length > 0 ? `${grouped.error.length} error(s)` : null,
      grouped.warn.length > 0 ? `${grouped.warn.length} warning(s)` : null,
      grouped.info.length > 0 ? `${grouped.info.length} info` : null,
    ]
      .filter(Boolean)
      .join(", ");

    console.log(`\n  ${counts}\n`);

    if (grouped.error.length > 0) {
      process.exit(1);
    }
  } catch (err) {
    if (options.json) {
      const jsonResult = {
        passed: false,
        diagnostics: [
          {
            rule: "parse.error",
            message: (err as Error).message,
            severity: "error" as const,
          },
        ],
        path: skillMdPath,
      };
      process.stdout.write(JSON.stringify(jsonResult, null, 2) + "\n");
    } else {
      console.error(`\n  ✗ ${(err as Error).message}\n`);
    }
    process.exit(1);
  }
}
