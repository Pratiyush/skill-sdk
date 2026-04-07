---
name: skill-with-extended
description: Demonstrates extended spec features. Use when learning about security, testing, composition.
security:
  capabilities:
    - read-fs
    - write-fs
  network:
    allowed:
      - api.github.com
testing:
  scenarios:
    - name: basic-usage
      input: "test input"
      expectedOutput: "expected"
composition:
  dependencies: []
---

# Skill With Extended

This example skill demonstrates the extended spec features that are
100% optional and backward-compatible with the base Agent Skills spec.

## When to use this skill

Use this skill as a reference when you want to learn how to declare:

- `security`: Capabilities, credentials, and network access policies
- `testing`: Test scenarios for automated verification
- `composition`: Skill dependencies and replacement chains
- `tools`: Tool dependencies and bindings

## Instructions

1. Review the frontmatter above to see all extended fields in action
2. Copy and adapt the structure to your own skill's needs
3. Remember: all extended fields are optional

## Gotchas

- This is an example — replace all content with your own instructions
- Extended fields are validated only when present
- Unknown fields outside the schema still produce warnings
