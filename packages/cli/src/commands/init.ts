import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

interface InitOptions {
  template: string;
}

const TEMPLATES: Record<string, { files: Record<string, string>; dirs: string[] }> = {
  basic: {
    dirs: [],
    files: {
      "SKILL.md": `---
name: {{name}}
description: Describe what this skill does and when to use it.
---

# {{name}}

## When to use this skill

Describe the trigger conditions here.

## Instructions

Step-by-step instructions for the agent.

1. First, do this
2. Then, do that
3. Finally, verify the result
`,
    },
  },
  "with-scripts": {
    dirs: ["scripts"],
    files: {
      "SKILL.md": `---
name: {{name}}
description: Describe what this skill does and when to use it.
---

# {{name}}

## When to use this skill

Describe the trigger conditions here.

## Instructions

1. Run the setup script: \`scripts/setup.sh\`
2. Follow the output instructions
3. Verify results
`,
      "scripts/setup.sh": `#!/bin/bash
# Setup script for {{name}}
echo "Running {{name}} setup..."
`,
    },
  },
  "with-references": {
    dirs: ["references", "assets"],
    files: {
      "SKILL.md": `---
name: {{name}}
description: Describe what this skill does and when to use it.
---

# {{name}}

## When to use this skill

Describe the trigger conditions here.

## Instructions

1. Read the [reference guide](references/REFERENCE.md) for context
2. Follow the step-by-step instructions below
3. Verify against the checklist

## Quick reference

See [references/REFERENCE.md](references/REFERENCE.md) for detailed documentation.
`,
      "references/REFERENCE.md": `# {{name}} Reference

Detailed reference documentation goes here.
Move content here that the agent only needs in specific situations.
`,
    },
  },
};

export async function initCommand(
  name: string,
  options: InitOptions
): Promise<void> {
  const template = TEMPLATES[options.template];
  if (!template) {
    console.error(
      `Unknown template: ${options.template}. Available: ${Object.keys(TEMPLATES).join(", ")}`
    );
    process.exit(1);
  }

  const skillDir = join(process.cwd(), name);

  try {
    await mkdir(skillDir, { recursive: true });

    for (const dir of template.dirs) {
      await mkdir(join(skillDir, dir), { recursive: true });
    }

    for (const [filePath, content] of Object.entries(template.files)) {
      const fullPath = join(skillDir, filePath);
      const rendered = content.replaceAll("{{name}}", name);
      await writeFile(fullPath, rendered, "utf-8");
    }

    console.log(`\n  Skill created: ${name}/`);
    console.log(`  Template: ${options.template}\n`);
    console.log("  Files:");
    console.log(`    ${name}/SKILL.md`);
    for (const filePath of Object.keys(template.files)) {
      if (filePath !== "SKILL.md") {
        console.log(`    ${name}/${filePath}`);
      }
    }
    console.log("\n  Next steps:");
    console.log(`    1. Edit ${name}/SKILL.md with your skill instructions`);
    console.log(`    2. Run: skill validate ${name}`);
    console.log(`    3. Run: skill lint ${name}\n`);
  } catch (err) {
    console.error(`Failed to create skill: ${(err as Error).message}`);
    process.exit(1);
  }
}
