/**
 * Core Agent Skills types — mirrors the Agent Skills specification.
 */

/** Key-value metadata map (string keys, string values). */
export type SkillMetadata = Record<string, string>;

/** YAML frontmatter fields from SKILL.md. */
export interface SkillFrontmatter {
  /** 1-64 chars, lowercase alphanumeric + hyphens. Must match parent directory. */
  name: string;
  /** 1-1024 chars. Describes what the skill does and when to use it. */
  description: string;
  /** License name or reference to a bundled license file. */
  license?: string;
  /** Max 500 chars. Environment requirements (product, packages, network). */
  compatibility?: string;
  /** Arbitrary key-value pairs for additional metadata. */
  metadata?: SkillMetadata;
  /** Space-delimited list of pre-approved tools. Experimental. */
  "allowed-tools"?: string;
}

/** Full parsed SKILL.md representation. */
export interface ParsedSkill {
  /** Parsed YAML frontmatter. */
  frontmatter: SkillFrontmatter;
  /** Markdown body content (everything after frontmatter). */
  body: string;
  /** Absolute path to the SKILL.md file. */
  filePath: string;
  /** Absolute path to the skill directory. */
  dirPath: string;
}

/** Skill manifest — the complete skill package representation. */
export interface SkillManifest {
  /** Parsed skill definition. */
  skill: ParsedSkill;
  /** Files found in the skill directory. */
  files: SkillFile[];
  /** Whether the skill has a scripts/ directory. */
  hasScripts: boolean;
  /** Whether the skill has a references/ directory. */
  hasReferences: boolean;
  /** Whether the skill has an assets/ directory. */
  hasAssets: boolean;
}

/** A file within the skill directory. */
export interface SkillFile {
  /** Relative path from skill root. */
  relativePath: string;
  /** Absolute path. */
  absolutePath: string;
  /** File size in bytes. */
  size: number;
}
