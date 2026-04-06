import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { validateCommand } from "./commands/validate.js";
import { lintCommand } from "./commands/lint.js";
import { installCommand } from "./commands/install.js";
import { listCommand } from "./commands/list.js";
import { publishCommand } from "./commands/publish.js";
import { validateAllCommand } from "./commands/validate-all.js";

const program = new Command();

program
  .name("skill")
  .description("CLI for building, validating, and linting Agent Skills")
  .version("0.9.0");

program
  .command("init <name>")
  .description("Scaffold a new Agent Skill")
  .option("-t, --template <template>", "Template to use", "basic")
  .action(initCommand);

program
  .command("validate <path>")
  .description("Validate a skill against the agentskills.io specification")
  .option("-s, --strict", "Enable strict mode (treat warnings as errors)")
  .action(validateCommand);

program
  .command("lint <path>")
  .description("Lint a skill for best practices")
  .option("--fix", "Show fix suggestions")
  .action(lintCommand);

program
  .command("install <path>")
  .description("Install a skill for a specific agent or generically")
  .option("-t, --target <target>", "Target agent: claude, copilot, codex, generic", "generic")
  .option("-s, --scope <scope>", "Install scope: project or user", "project")
  .option("-f, --force", "Overwrite existing installation")
  .action(installCommand);

program
  .command("list")
  .description("List installed skills")
  .option("-t, --target <target>", "Filter by target: claude, copilot, codex, generic")
  .option("-s, --scope <scope>", "Filter by scope: project or user")
  .action(listCommand);

program
  .command("publish <path>")
  .description("Package and prepare a skill for publishing")
  .option("--dry-run", "Preview what would be published without making changes")
  .option("-o, --out-dir <dir>", "Output directory for the package", ".skill-package")
  .action(publishCommand);

program
  .command("validate-all")
  .description("Validate all skills in skills/ and examples/ directories")
  .option("-d, --dir <path>", "Root directory to search", ".")
  .option("-s, --strict", "Treat lint warnings as errors")
  .action(validateAllCommand);

program.parse();
