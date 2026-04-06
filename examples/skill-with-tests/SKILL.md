---
name: skill-with-tests
description: >
  Example skill demonstrating the test scenario format from the extended specification.
  Use when learning how to write and evaluate skill test cases.
license: Apache-2.0
metadata:
  author: skillscraft
  version: "1.0"
---

# Skill with Tests

## When to use this skill

Use this as a reference when adding test scenarios to your own skills. The `tests/` directory contains structured test cases that follow the `TestScenario` format from `@skillscraft/spec`.

## Instructions

1. Read `tests/scenarios.json` to see the test format
2. Each scenario has a `name`, `description`, and array of `cases`
3. Each case provides an `input` prompt and `assertions` to check the output
4. Assertion types: `contains`, `not-contains`, `matches-regex`, `file-created`, `file-modified`, `command-executed`, `custom`
5. Use this pattern in your own skills to make them testable

## Test scenario structure

```json
{
  "name": "scenario-name",
  "description": "What this scenario tests",
  "cases": [
    {
      "name": "case-name",
      "input": "User prompt to test with",
      "assertions": [
        { "type": "contains", "value": "expected output text" }
      ],
      "expectedBehavior": "Human-readable description"
    }
  ]
}
```

## Gotchas

- Assertions check the agent's text output, not internal state
- The `matches-regex` type uses JavaScript regex syntax
- `file-created` and `file-modified` assertions check the filesystem after the skill runs
- Test scenarios are declarative — you need a test runner to execute them
