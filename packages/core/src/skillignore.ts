import { readFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import type { SkillFile } from "@skillscraft/spec";

/** Default patterns when no .skillignore exists. */
const DEFAULT_PATTERNS = [
  "CODEOWNERS",
  "CHANGELOG.md",
  "CHANGELOG",
  "RELEASE-NOTES.md",
  "CONTRIBUTING.md",
  "CONTRIBUTORS.md",
  "LICENSE-HEADER",
  ".github/",
  ".git/",
  ".gitignore",
  "node_modules/",
  "coverage/",
  "*.log",
  "*.tsbuildinfo",
  ".DS_Store",
  ".turbo/",
  ".env",
  ".env.*",
  "examples/",
  "__tests__/",
  "*.test.*",
  "*.spec.*",
  "jest.config.*",
  "vitest.config.*",
];

/** Files that can never be ignored. */
const PROTECTED_FILES = ["SKILL.md"];

/**
 * Parse a .skillignore file content into pattern list.
 * Follows .gitignore syntax: one pattern per line, # comments, blank lines ignored.
 */
export function parseSkillIgnore(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

/**
 * Load .skillignore patterns from a skill directory.
 * Falls back to DEFAULT_PATTERNS if no .skillignore exists.
 */
export function loadSkillIgnore(skillDir: string): string[] {
  const ignorePath = join(skillDir, ".skillignore");
  if (existsSync(ignorePath)) {
    const content = readFileSync(ignorePath, "utf-8");
    return parseSkillIgnore(content);
  }
  return [...DEFAULT_PATTERNS];
}

/**
 * Check if a relative file path matches any ignore pattern.
 * Supports: exact match, directory trailing slash, * glob, .* prefix glob.
 */
export function isIgnored(relativePath: string, patterns: string[]): boolean {
  // Normalize to forward slashes for cross-platform consistency
  const normalized = relativePath.replace(/\\/g, "/");

  // Protected files are never ignored
  const name = basename(normalized);
  if (PROTECTED_FILES.includes(name)) return false;

  // Also never ignore .skillignore itself from source reads
  if (name === ".skillignore") return false;

  for (const pattern of patterns) {
    if (matchPattern(normalized, pattern)) return true;
  }
  return false;
}

/**
 * Filter a list of SkillFiles, removing ignored ones.
 */
export function filterFiles(
  files: SkillFile[],
  patterns: string[]
): SkillFile[] {
  return files.filter((f) => !isIgnored(f.relativePath, patterns));
}

/**
 * Match a relative path against a single pattern.
 *
 * Pattern types:
 * - "dir/"         → matches any path starting with "dir/"
 * - "*.ext"        → matches any file ending with ".ext"
 * - "*.ext.*"      → matches any file with ".ext." in the name
 * - ".prefix"      → exact match on basename
 * - ".prefix.*"    → matches files starting with ".prefix."
 * - "exact"        → exact match on basename or full relative path
 */
function matchPattern(relativePath: string, pattern: string): boolean {
  // Directory pattern: "dir/" matches anything under that directory
  if (pattern.endsWith("/")) {
    const dirName = pattern.slice(0, -1);
    if (
      relativePath === dirName ||
      relativePath.startsWith(dirName + "/") ||
      relativePath.includes("/" + dirName + "/")
    ) {
      return true;
    }
    // Also match if any path segment equals dirName
    const segments = relativePath.split("/");
    if (segments.some((s, i) => i < segments.length - 1 && s === dirName)) {
      return true;
    }
    return false;
  }

  const fileName = basename(relativePath);

  // Glob pattern: "*.ext" or "*.ext.*"
  if (pattern.startsWith("*")) {
    const suffix = pattern.slice(1); // e.g., ".log" or ".test.*"
    if (suffix.endsWith(".*")) {
      // "*.test.*" → check if file contains ".test."
      const middle = suffix.slice(0, -2); // ".test"
      return fileName.includes(middle);
    }
    if (suffix.startsWith(".")) {
      // "*.log" → check file ends with ".log"
      return fileName.endsWith(suffix);
    }
    return false;
  }

  // Dot-prefix glob: ".env.*" → matches .env.local, .env.production, etc.
  if (pattern.endsWith(".*")) {
    const prefix = pattern.slice(0, -2); // ".env"
    return fileName === prefix || fileName.startsWith(prefix + ".");
  }

  // Exact match on basename or full path
  return fileName === pattern || relativePath === pattern;
}
