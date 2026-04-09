export { parseSkill } from "./parser.js";
export { validateSkill } from "./validator.js";
export type { ValidateOptions } from "./validator.js";
export { lintSkill, LINT_RULES } from "./linter.js";
export { loadSkillManifest } from "./loader.js";
export {
  parseSkillIgnore,
  loadSkillIgnore,
  filterFiles,
  isIgnored,
} from "./skillignore.js";

// Re-export types for convenience
export type {
  ParsedSkill,
  SkillFrontmatter,
  SkillManifest,
  ValidationResult,
  ValidationError,
  LintResult,
  LintRule,
} from "@skillscraft/spec";
