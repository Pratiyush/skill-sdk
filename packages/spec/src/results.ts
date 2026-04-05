/**
 * Validation and linting result types.
 */

export type ValidationSeverity = "error" | "warning";

export interface ValidationError {
  /** Which field or aspect failed validation. */
  field: string;
  /** Human-readable error message. */
  message: string;
  /** Error or warning. */
  severity: ValidationSeverity;
  /** Spec rule reference (e.g., "name.format", "description.length"). */
  rule: string;
}

export interface ValidationResult {
  /** Whether the skill passes validation (no errors; warnings are OK). */
  valid: boolean;
  /** List of validation errors and warnings. */
  errors: ValidationError[];
  /** Path to the validated skill. */
  skillPath: string;
}

export type LintSeverity = "error" | "warn" | "info";

export interface LintRule {
  /** Rule identifier (e.g., "context-budget", "description-quality"). */
  id: string;
  /** Human-readable rule name. */
  name: string;
  /** What this rule checks. */
  description: string;
  /** Default severity. */
  severity: LintSeverity;
}

export interface LintDiagnostic {
  /** Rule that triggered this diagnostic. */
  rule: string;
  /** Human-readable message. */
  message: string;
  /** Severity level. */
  severity: LintSeverity;
  /** Line number in SKILL.md (if applicable). */
  line?: number;
  /** Suggestion for fixing. */
  fix?: string;
}

export interface LintResult {
  /** Whether the skill passes linting (no errors; warnings/info are OK). */
  passed: boolean;
  /** List of diagnostics. */
  diagnostics: LintDiagnostic[];
  /** Path to the linted skill. */
  skillPath: string;
}
