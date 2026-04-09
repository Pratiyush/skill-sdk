import { Command } from "commander";
import { initCommand } from "./commands/init.js";

// Injected by tsup at build time — see tsup.config.ts
declare const __CLI_VERSION__: string;
import { validateCommand } from "./commands/validate.js";
import { lintCommand } from "./commands/lint.js";
import { installCommand } from "./commands/install.js";
import { uninstallCommand } from "./commands/uninstall.js";
import { listCommand } from "./commands/list.js";
import { publishCommand } from "./commands/publish.js";
import { validateAllCommand } from "./commands/validate-all.js";

const program = new Command();

program
  .name("skill")
  .description("CLI for building, validating, and linting Agent Skills")
  .version(__CLI_VERSION__);

program
  .command("init <name>")
  .description("Scaffold a new Agent Skill")
  .option("-t, --template <template>", "Template to use", "basic")
  .action(initCommand);

program
  .command("validate <path>")
  .description("Validate a skill against the Agent Skills specification")
  .option("-s, --strict", "Enable strict mode (treat warnings as errors)")
  .option("--json", "Output result as JSON")
  .action(validateCommand);

program
  .command("lint <path>")
  .description("Lint a skill for best practices")
  .option("--fix", "Show fix suggestions")
  .option("--json", "Output result as JSON")
  .action(lintCommand);

program
  .command("install <path>")
  .description("Install a skill for a specific agent or generically")
  .option(
    "-t, --target <target>",
    "Target agent: claude, copilot, codex, cursor, windsurf, aider, goose, gemini, junie, roo-code, opencode, amp, open-claw, generic",
    "generic"
  )
  .option("-s, --scope <scope>", "Install scope: project or user", "project")
  .option("-f, --force", "Overwrite existing installation")
  .option("--skip-validation", "Skip skill validation during install")
  .action(installCommand);

program
  .command("uninstall <name>")
  .description("Uninstall a previously installed skill")
  .option(
    "-t, --target <target>",
    "Target agent: claude, copilot, codex, cursor, windsurf, aider, goose, gemini, junie, roo-code, opencode, amp, open-claw, generic",
    "generic"
  )
  .option("-s, --scope <scope>", "Uninstall scope: project or user", "project")
  .action(uninstallCommand);

program
  .command("list")
  .description("List installed skills")
  .option("-t, --target <target>", "Filter by target: claude, copilot, codex, generic")
  .option("-s, --scope <scope>", "Filter by scope: project or user")
  .option("--json", "Output result as JSON")
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
  .option("--json", "Output result as JSON")
  .action(validateAllCommand);

program.parse();
