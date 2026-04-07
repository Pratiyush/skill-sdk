/**
 * Spec constants — limits and patterns from the Agent Skills specification.
 */

/** Regex for valid skill names: 1-64 chars, lowercase alphanumeric + hyphens, no leading/trailing/consecutive hyphens. */
export const SKILL_NAME_REGEX = /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){0,62}[a-z0-9]?$/;

export const SPEC_LIMITS = {
  /** Maximum length of the name field. */
  NAME_MAX_LENGTH: 64,
  /** Minimum length of the name field. */
  NAME_MIN_LENGTH: 1,
  /** Maximum length of the description field. */
  DESCRIPTION_MAX_LENGTH: 1024,
  /** Minimum length of the description field. */
  DESCRIPTION_MIN_LENGTH: 1,
  /** Maximum length of the compatibility field. */
  COMPATIBILITY_MAX_LENGTH: 500,
  /** Recommended max tokens for SKILL.md body. */
  BODY_RECOMMENDED_MAX_TOKENS: 5000,
  /** Recommended max lines for SKILL.md. */
  BODY_RECOMMENDED_MAX_LINES: 500,
} as const;
