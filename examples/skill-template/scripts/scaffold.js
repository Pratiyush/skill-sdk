#!/usr/bin/env node

/**
 * scaffold.js — Generate a new Agent Skill directory with best-practice structure.
 *
 * Usage:
 *   node scaffold.js --name my-skill --desc "Short description" [--dirs scripts,references,assets,tests] [--out ./output]
 */

const { mkdirSync, writeFileSync, existsSync } = require("node:fs");
const { join } = require("node:path");
const { parseArgs } = require("node:util");

const NAME_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

const TEMPLATES = {
  "scripts/run.sh": `#!/usr/bin/env bash
set -euo pipefail

# TODO: Implement your script logic here
echo "Running skill script..."
`,

  "references/GUIDE.md": `# Reference Guide

## Overview

This document provides reference material for the skill.

## Usage

Describe how agents should use the reference material here.
`,

  "assets/.gitkeep": "",

  "tests/scenarios.json": `[
  {
    "name": "basic-usage",
    "input": "Example user request",
    "expectedOutput": "Expected agent response pattern",
    "tags": ["smoke"]
  }
]
`,
};

function generateSkillMd(name, desc, dirs, opts = {}) {
  const frontmatter = [`name: ${name}`];
  frontmatter.push(`description: >`);
  frontmatter.push(`  ${desc}`);

  if (opts.license) frontmatter.push(`license: ${opts.license}`);
  if (opts.compatibility)
    frontmatter.push(`compatibility: ${opts.compatibility}`);
  if (opts.allowedTools)
    frontmatter.push(`allowed-tools: ${opts.allowedTools}`);

  const body = `# ${name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")}

## When to use this skill

${desc}

## Instructions

1. Read the user's request carefully
2. Identify the specific task they need help with
3. Provide a clear, step-by-step response

## Gotchas

- TODO: Add known limitations and edge cases
- Keep the SKILL.md body under 500 lines for optimal agent performance
`;

  return `---\n${frontmatter.join("\n")}\n---\n\n${body}`;
}

function main() {
  const { values } = parseArgs({
    options: {
      name: { type: "string" },
      desc: { type: "string", default: "Use when the user needs help with this task." },
      dirs: { type: "string", default: "" },
      out: { type: "string", default: "." },
      license: { type: "string", default: "MIT" },
      compatibility: { type: "string", default: "" },
      "allowed-tools": { type: "string", default: "" },
    },
  });

  if (!values.name) {
    console.error("Error: --name is required");
    console.error(
      'Usage: node scaffold.js --name my-skill --desc "Description" [--dirs scripts,references,assets,tests]'
    );
    process.exit(1);
  }

  if (!NAME_REGEX.test(values.name)) {
    console.error(
      `Error: Invalid skill name "${values.name}". Must match ${NAME_REGEX}`
    );
    console.error(
      "Use lowercase letters, digits, and hyphens. No leading/trailing hyphens."
    );
    process.exit(1);
  }

  const outDir = join(values.out, values.name);
  if (existsSync(outDir)) {
    console.error(`Error: Directory "${outDir}" already exists. Use a different name or remove it first.`);
    process.exit(1);
  }

  const dirs = values.dirs
    ? values.dirs.split(",").map((d) => d.trim())
    : [];

  // Create skill directory
  mkdirSync(outDir, { recursive: true });

  // Write SKILL.md
  const skillMd = generateSkillMd(values.name, values.desc, dirs, {
    license: values.license,
    compatibility: values.compatibility,
    allowedTools: values["allowed-tools"],
  });
  writeFileSync(join(outDir, "SKILL.md"), skillMd);
  console.log(`  Created ${values.name}/SKILL.md`);

  // Create optional directories and template files
  for (const dir of dirs) {
    const dirPath = join(outDir, dir);
    mkdirSync(dirPath, { recursive: true });

    // Find and write template files for this directory
    for (const [templatePath, content] of Object.entries(TEMPLATES)) {
      if (templatePath.startsWith(dir + "/")) {
        const filePath = join(outDir, templatePath);
        writeFileSync(filePath, content);
        console.log(`  Created ${values.name}/${templatePath}`);
      }
    }
  }

  console.log(`\nSkill "${values.name}" created at ${outDir}/`);
  console.log(`\nNext steps:`);
  console.log(`  1. Edit ${values.name}/SKILL.md with your instructions`);
  console.log(`  2. Run: skill validate ${outDir}/SKILL.md`);
  console.log(`  3. Run: skill lint ${outDir}/SKILL.md`);
}

main();
