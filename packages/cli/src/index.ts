import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { validateCommand } from "./commands/validate.js";
import { lintCommand } from "./commands/lint.js";

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

program.parse();
