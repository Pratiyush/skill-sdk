import { SPEC_LIMITS } from "@skillscraft/spec";
import type { ParsedSkill, LintRule, LintSeverity } from "@skillscraft/spec";
import type { LintDiagnostic, LintResult } from "@skillscraft/spec";

/** All built-in lint rules. */
export const LINT_RULES: LintRule[] = [
  {
    id: "context-budget",
    name: "Context Budget",
    description: `SKILL.md body should be under ${SPEC_LIMITS.BODY_RECOMMENDED_MAX_TOKENS} tokens (approx ${SPEC_LIMITS.BODY_RECOMMENDED_MAX_LINES} lines).`,
    severity: "warn",
  },
  {
    id: "description-quality",
    name: "Description Quality",
    description:
      'Description should explain both WHAT the skill does and WHEN to use it (look for "when" or "use when" or similar trigger phrases).',
    severity: "warn",
  },
  {
    id: "no-generic-instructions",
    name: "No Generic Instructions",
    description:
      'Flags vague instructions like "handle errors appropriately" or "follow best practices".',
    severity: "warn",
  },
  {
    id: "progressive-disclosure",
    name: "Progressive Disclosure",
    description:
      "Large skills should use references/ or scripts/ instead of putting everything inline.",
    severity: "warn",
  },
  {
    id: "defaults-over-menus",
    name: "Defaults Over Menus",
    description:
      "When multiple tools/approaches are listed, there should be a clear default rather than equal options.",
    severity: "warn",
  },
  {
    id: "gotchas-present",
    name: "Gotchas Section",
    description:
      "Complex skills benefit from a gotchas/caveats section listing non-obvious facts.",
    severity: "info",
  },
];

const GENERIC_PHRASES = [
  "handle errors appropriately",
  "follow best practices",
  "use proper error handling",
  "ensure security",
  "be careful with",
  "make sure to handle",
  "do the right thing",
];

const MENU_PATTERNS = [
  /you can use ([\w]+), ([\w]+), (?:or )?([\w]+)/i,
  /options include:?\s/i,
  /choose between/i,
  /either .+ or .+ or /i,
];

/**
 * Lint a parsed skill for best practices beyond spec compliance.
 *
 * @param skill - A parsed skill from `parseSkill()`.
 * @returns Lint result with diagnostics.
 */
export function lintSkill(skill: ParsedSkill): LintResult {
  const diagnostics: LintDiagnostic[] = [];
  const { frontmatter, body } = skill;
  const lines = body.split("\n");

  // --- context-budget ---
  // Rough token estimate: ~4 chars per token for English
  const estimatedTokens = Math.ceil(body.length / 4);
  if (estimatedTokens > SPEC_LIMITS.BODY_RECOMMENDED_MAX_TOKENS) {
    diagnostics.push({
      rule: "context-budget",
      message: `SKILL.md body is ~${estimatedTokens} tokens (recommended max: ${SPEC_LIMITS.BODY_RECOMMENDED_MAX_TOKENS}). Consider moving detailed content to references/.`,
      severity: "warn",
      fix: "Move reference material to separate files in references/ and load on demand.",
    });
  }

  if (lines.length > SPEC_LIMITS.BODY_RECOMMENDED_MAX_LINES) {
    diagnostics.push({
      rule: "context-budget",
      message: `SKILL.md body is ${lines.length} lines (recommended max: ${SPEC_LIMITS.BODY_RECOMMENDED_MAX_LINES}).`,
      severity: "warn",
    });
  }

  // --- description-quality ---
  const desc = frontmatter.description || "";
  const hasWhenClause =
    /\bwhen\b/i.test(desc) ||
    /\buse .*(for|if|when)\b/i.test(desc) ||
    /\btrigger/i.test(desc);
  if (!hasWhenClause) {
    diagnostics.push({
      rule: "description-quality",
      message:
        'Description should include when to use the skill (e.g., "Use when..." or "Trigger when...").',
      severity: "warn",
      fix: 'Add a "Use when..." clause to help agents decide when to activate this skill.',
    });
  }

  // --- no-generic-instructions ---
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    for (const phrase of GENERIC_PHRASES) {
      if (line.includes(phrase)) {
        diagnostics.push({
          rule: "no-generic-instructions",
          message: `Found generic instruction "${phrase}". Replace with specific, actionable guidance.`,
          severity: "warn",
          line: i + 1,
          fix: "Replace with a concrete instruction tied to your skill's purpose.",
        });
      }
    }
  }

  // --- progressive-disclosure ---
  if (
    lines.length > SPEC_LIMITS.BODY_RECOMMENDED_MAX_LINES &&
    !body.includes("references/") &&
    !body.includes("scripts/")
  ) {
    diagnostics.push({
      rule: "progressive-disclosure",
      message:
        "Large skill body with no references to external files. Consider splitting into references/ or scripts/.",
      severity: "warn",
      fix: "Move detailed reference material to separate files and reference them conditionally.",
    });
  }

  // --- defaults-over-menus ---
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of MENU_PATTERNS) {
      if (pattern.test(lines[i])) {
        diagnostics.push({
          rule: "defaults-over-menus",
          message:
            "Multiple options presented without a clear default. Pick a default and mention alternatives briefly.",
          severity: "warn",
          line: i + 1,
          fix: 'Use "Use X for this task. For Y, use Z instead." pattern.',
        });
        break;
      }
    }
  }

  // --- gotchas-present ---
  const hasGotchas =
    /## gotchas/i.test(body) ||
    /## caveats/i.test(body) ||
    /## known issues/i.test(body) ||
    /## common pitfalls/i.test(body);
  if (lines.length > 50 && !hasGotchas) {
    diagnostics.push({
      rule: "gotchas-present",
      message:
        'Consider adding a "## Gotchas" section with non-obvious environment-specific facts.',
      severity: "info",
      fix: "Add a gotchas section listing things the agent would get wrong without being told.",
    });
  }

  return {
    passed: diagnostics.filter((d) => d.severity === "error").length === 0,
    diagnostics,
    skillPath: skill.filePath,
  };
}
