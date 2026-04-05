---
name: skill-with-scripts
description: Example skill that bundles executable scripts. Use when demonstrating script-based skills.
compatibility: Requires bash
---

# Skill with Scripts

## When to use this skill

Use this when you need to run automated tasks via bundled scripts.

## Instructions

1. Run the analysis script: `scripts/analyze.sh`
2. Review the output
3. Apply fixes based on the results

## Gotchas

- Scripts require bash — will not work on Windows without WSL
- The analyze script reads from the current working directory
