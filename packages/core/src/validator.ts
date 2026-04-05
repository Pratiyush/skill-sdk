import { basename } from "node:path";
import { SKILL_NAME_REGEX, SPEC_LIMITS } from "@skillscraft/spec";
import type {
  ParsedSkill,
  ValidationResult,
  ValidationError,
} from "@skillscraft/spec";

/**
 * Validate a parsed skill against the agentskills.io specification.
 *
 * @param skill - A parsed skill from `parseSkill()`.
 * @returns Validation result with errors and warnings.
 */
export function validateSkill(skill: ParsedSkill): ValidationResult {
  const errors: ValidationError[] = [];
  const { frontmatter, dirPath } = skill;

  // --- name field (required) ---
  if (!frontmatter.name) {
    errors.push({
      field: "name",
      message: "The `name` field is required.",
      severity: "error",
      rule: "name.required",
    });
  } else {
    if (typeof frontmatter.name !== "string") {
      errors.push({
        field: "name",
        message: "The `name` field must be a string.",
        severity: "error",
        rule: "name.type",
      });
    } else {
      if (frontmatter.name.length > SPEC_LIMITS.NAME_MAX_LENGTH) {
        errors.push({
          field: "name",
          message: `Name exceeds ${SPEC_LIMITS.NAME_MAX_LENGTH} characters (got ${frontmatter.name.length}).`,
          severity: "error",
          rule: "name.maxLength",
        });
      }

      if (!SKILL_NAME_REGEX.test(frontmatter.name)) {
        errors.push({
          field: "name",
          message:
            "Name must contain only lowercase letters, numbers, and hyphens. " +
            "Must not start/end with a hyphen or contain consecutive hyphens.",
          severity: "error",
          rule: "name.format",
        });
      }

      // name must match parent directory
      const dirName = basename(dirPath);
      if (frontmatter.name !== dirName) {
        errors.push({
          field: "name",
          message: `Name "${frontmatter.name}" does not match parent directory "${dirName}".`,
          severity: "error",
          rule: "name.matchesDirectory",
        });
      }
    }
  }

  // --- description field (required) ---
  if (!frontmatter.description) {
    errors.push({
      field: "description",
      message: "The `description` field is required.",
      severity: "error",
      rule: "description.required",
    });
  } else {
    if (typeof frontmatter.description !== "string") {
      errors.push({
        field: "description",
        message: "The `description` field must be a string.",
        severity: "error",
        rule: "description.type",
      });
    } else {
      if (frontmatter.description.length > SPEC_LIMITS.DESCRIPTION_MAX_LENGTH) {
        errors.push({
          field: "description",
          message: `Description exceeds ${SPEC_LIMITS.DESCRIPTION_MAX_LENGTH} characters (got ${frontmatter.description.length}).`,
          severity: "error",
          rule: "description.maxLength",
        });
      }
    }
  }

  // --- compatibility field (optional) ---
  if (frontmatter.compatibility !== undefined) {
    if (typeof frontmatter.compatibility !== "string") {
      errors.push({
        field: "compatibility",
        message: "The `compatibility` field must be a string.",
        severity: "error",
        rule: "compatibility.type",
      });
    } else if (
      frontmatter.compatibility.length > SPEC_LIMITS.COMPATIBILITY_MAX_LENGTH
    ) {
      errors.push({
        field: "compatibility",
        message: `Compatibility exceeds ${SPEC_LIMITS.COMPATIBILITY_MAX_LENGTH} characters (got ${frontmatter.compatibility.length}).`,
        severity: "error",
        rule: "compatibility.maxLength",
      });
    }
  }

  // --- metadata field (optional) ---
  if (frontmatter.metadata !== undefined) {
    if (
      typeof frontmatter.metadata !== "object" ||
      frontmatter.metadata === null ||
      Array.isArray(frontmatter.metadata)
    ) {
      errors.push({
        field: "metadata",
        message: "The `metadata` field must be a key-value object.",
        severity: "error",
        rule: "metadata.type",
      });
    } else {
      for (const [key, value] of Object.entries(frontmatter.metadata)) {
        if (typeof key !== "string") {
          errors.push({
            field: `metadata.${key}`,
            message: "Metadata keys must be strings.",
            severity: "error",
            rule: "metadata.keyType",
          });
        }
        if (typeof value !== "string") {
          errors.push({
            field: `metadata.${key}`,
            message: `Metadata value for "${key}" must be a string (got ${typeof value}).`,
            severity: "error",
            rule: "metadata.valueType",
          });
        }
      }
    }
  }

  // --- license field (optional) ---
  if (frontmatter.license !== undefined && typeof frontmatter.license !== "string") {
    errors.push({
      field: "license",
      message: "The `license` field must be a string.",
      severity: "error",
      rule: "license.type",
    });
  }

  // --- allowed-tools field (optional) ---
  if (
    frontmatter["allowed-tools"] !== undefined &&
    typeof frontmatter["allowed-tools"] !== "string"
  ) {
    errors.push({
      field: "allowed-tools",
      message: "The `allowed-tools` field must be a space-delimited string.",
      severity: "error",
      rule: "allowed-tools.type",
    });
  }

  // --- unknown fields (warning) ---
  const knownFields = new Set([
    "name",
    "description",
    "license",
    "compatibility",
    "metadata",
    "allowed-tools",
  ]);
  for (const key of Object.keys(frontmatter)) {
    if (!knownFields.has(key)) {
      errors.push({
        field: key,
        message: `Unknown frontmatter field "${key}". This is not part of the Agent Skills specification.`,
        severity: "warning",
        rule: "frontmatter.unknownField",
      });
    }
  }

  return {
    valid: errors.filter((e) => e.severity === "error").length === 0,
    errors,
    skillPath: skill.filePath,
  };
}
