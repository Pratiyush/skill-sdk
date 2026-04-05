/**
 * Extended specification types — security, testing, tool-binding, composition.
 * These extend the base agentskills.io spec with enterprise-grade features.
 * 100% backward-compatible: all extended fields are optional.
 */

// --- Security Model ---

export interface SecurityManifest {
  /** Capabilities this skill requires. */
  capabilities: CapabilityDeclaration[];
  /** Whether this skill requires network access. */
  requiresNetwork?: boolean;
  /** Whether this skill modifies files. */
  modifiesFiles?: boolean;
  /** Whether this skill executes shell commands. */
  executesCommands?: boolean;
  /** Maximum scope of file system access. */
  fileSystemScope?: "skill-directory" | "workspace" | "system";
}

export interface CapabilityDeclaration {
  /** Capability identifier (e.g., "file:read", "shell:execute", "network:http"). */
  capability: string;
  /** Why this capability is needed. */
  reason: string;
  /** Whether the skill can function without this capability. */
  optional?: boolean;
}

// --- Testing Standard ---

export interface TestScenario {
  /** Unique name for this test scenario. */
  name: string;
  /** Description of what this scenario tests. */
  description: string;
  /** Test cases within this scenario. */
  cases: TestCase[];
}

export interface TestCase {
  /** Test case name. */
  name: string;
  /** Input prompt or context to provide to the agent. */
  input: string;
  /** Assertions to check against the agent's output. */
  assertions: TestAssertion[];
  /** Expected behavior description (for human review). */
  expectedBehavior?: string;
}

export interface TestAssertion {
  /** Type of assertion. */
  type: "contains" | "not-contains" | "matches-regex" | "file-created" | "file-modified" | "command-executed" | "custom";
  /** Value to check (string, regex pattern, file path, etc.). */
  value: string;
  /** Human-readable description of what this assertion checks. */
  description?: string;
}

// --- Tool Binding ---

export interface ToolBinding {
  /** Tools this skill depends on. */
  dependencies: ToolDependency[];
}

export interface ToolDependency {
  /** Tool name or pattern (e.g., "Bash", "Read", "Bash(git:*)"). */
  tool: string;
  /** Whether the skill requires this tool or can degrade gracefully. */
  required: boolean;
  /** What the tool is used for. */
  purpose: string;
  /** Minimum version if applicable. */
  minVersion?: string;
}

// --- Composition ---

export interface SkillComposition {
  /** Skills this skill depends on. */
  dependencies: SkillDependency[];
  /** Skills that should not be active at the same time. */
  conflicts?: string[];
  /** Suggested order when chaining with other skills. */
  executionOrder?: "before" | "after" | "independent";
}

export interface SkillDependency {
  /** Name of the required skill. */
  skillName: string;
  /** Why this skill is needed. */
  reason: string;
  /** Whether the skill can function without this dependency. */
  optional?: boolean;
}
