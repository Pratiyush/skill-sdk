---
name: extended-skill
description: Fixture for extended spec validation tests. Use when testing extended fields.
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

# Extended Skill

## Instructions

1. Used as a test fixture for extended spec validation
