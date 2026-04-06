#!/usr/bin/env node

/**
 * create-issue.js — Generate well-structured GitHub issues from templates.
 *
 * Usage:
 *   node create-issue.js --title "Issue title" --type <bug|feature|task> [--labels "label1,label2"] [--assignee "@user"] [--dry-run]
 *
 * Requires: gh CLI authenticated
 */

const { execSync } = require("node:child_process");
const { parseArgs } = require("node:util");

const TEMPLATES = {
  bug: (title) => `## Bug Report

### Description
${title}

### Steps to Reproduce
1.
2.
3.

### Expected Behavior
<!-- What should happen? -->

### Actual Behavior
<!-- What actually happens? -->

### Environment
- OS:
- Node.js:
- Package version:

### Severity
- [ ] P0 — Blocker (production broken)
- [ ] P1 — Critical (major feature broken)
- [ ] P2 — Major (workaround exists)
- [ ] P3 — Minor (cosmetic/low impact)

### Additional Context
<!-- Screenshots, logs, related issues -->
`,

  feature: (title) => `## Feature Request

### Problem Statement
${title}

### Proposed Solution
<!-- How should this work? -->

### Acceptance Criteria
- [ ]
- [ ]
- [ ]

### Alternatives Considered
<!-- What other approaches were considered? -->

### Priority
- [ ] P0 — Required for launch
- [ ] P1 — Important, schedule soon
- [ ] P2 — Nice to have
- [ ] P3 — Future consideration

### Additional Context
<!-- Mockups, related features, user feedback -->
`,

  task: (title) => `## Task

### Description
${title}

### Subtasks
- [ ]
- [ ]
- [ ]

### Dependencies
<!-- What needs to be done first? -->

### Definition of Done
- [ ] Implementation complete
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] PR reviewed and merged

### Notes
<!-- Additional context -->
`,
};

function main() {
  const { values } = parseArgs({
    options: {
      title: { type: "string" },
      type: { type: "string", default: "task" },
      labels: { type: "string", default: "" },
      assignee: { type: "string", default: "" },
      "dry-run": { type: "boolean", default: false },
    },
  });

  if (!values.title) {
    console.error("Error: --title is required");
    process.exit(1);
  }

  const type = values.type;
  if (!TEMPLATES[type]) {
    console.error(`Error: --type must be one of: ${Object.keys(TEMPLATES).join(", ")}`);
    process.exit(1);
  }

  const body = TEMPLATES[type](values.title);

  if (values["dry-run"]) {
    console.log("=== DRY RUN ===");
    console.log(`Title: ${values.title}`);
    console.log(`Type: ${type}`);
    console.log(`Labels: ${values.labels || "(none)"}`);
    console.log(`Assignee: ${values.assignee || "(none)"}`);
    console.log(`\nBody:\n${body}`);
    return;
  }

  let cmd = `gh issue create --title "${values.title.replace(/"/g, '\\"')}"`;
  cmd += ` --body "${body.replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
  if (values.labels) {
    values.labels.split(",").forEach((l) => {
      cmd += ` --label "${l.trim()}"`;
    });
  }
  if (values.assignee) cmd += ` --assignee "${values.assignee.replace("@", "")}"`;

  try {
    const result = execSync(cmd, { encoding: "utf-8" }).trim();
    console.log(JSON.stringify({ created: true, url: result, type, title: values.title }));
  } catch (e) {
    console.error(`Error creating issue: ${e.message}`);
    process.exit(1);
  }
}

main();
