import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const DEFAULT_REGISTRY = "https://pratiyush.github.io/agent-catalog";

interface RegistryConfig {
  registry: string;
}

/**
 * Resolve the skill registry URL.
 * Priority: SKILL_REGISTRY env var > ~/.skillrc > .skillrc > default
 */
export function resolveRegistry(): string {
  // 1. Environment variable
  if (process.env.SKILL_REGISTRY) {
    return process.env.SKILL_REGISTRY.replace(/\/+$/, "");
  }

  // 2. User-level config
  const userRc = join(homedir(), ".skillrc");
  if (existsSync(userRc)) {
    const config = parseRcFile(userRc);
    if (config.registry) return config.registry;
  }

  // 3. Project-level config
  const projectRc = join(process.cwd(), ".skillrc");
  if (existsSync(projectRc)) {
    const config = parseRcFile(projectRc);
    if (config.registry) return config.registry;
  }

  // 4. Default
  return DEFAULT_REGISTRY;
}

function parseRcFile(filePath: string): RegistryConfig {
  try {
    const content = readFileSync(filePath, "utf-8");

    // Try JSON first
    if (content.trim().startsWith("{")) {
      return JSON.parse(content);
    }

    // Simple key=value format
    const config: RegistryConfig = { registry: "" };
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=").trim();
      if (key.trim() === "registry") {
        config.registry = value.replace(/\/+$/, "");
      }
    }
    return config;
  } catch {
    return { registry: "" };
  }
}
