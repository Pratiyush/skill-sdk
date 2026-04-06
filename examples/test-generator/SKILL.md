---
name: test-generator
description: >
  Generate test file stubs and boilerplate from source code analysis.
  Use when the user asks to create tests, add test coverage, or scaffold
  test files for existing source code.
license: Apache-2.0
compatibility: Requires Deno 2.0+
metadata:
  author: skillscraft
  version: "1.0"
  category: testing
---

# Test Generator

## When to use this skill

Activate when the user wants to:
- Create test files for existing source code
- Scaffold test stubs with correct imports and structure
- Add test coverage to an untested module

## Instructions

1. Analyze the source file to extract function and class signatures:
   ```
   deno run --allow-read scripts/analyze-source.ts <source-file>
   ```
2. Review the JSON output to understand the public API
3. Generate test stubs:
   ```
   deno run --allow-read --allow-write scripts/generate-stubs.ts <source-file> --output <test-file> --framework vitest
   ```
   Supported frameworks: `vitest` (default), `jest`, `mocha`
4. Fill in the generated test bodies with meaningful assertions
5. Run the tests to verify the stubs compile and the structure is correct

## Output format

The analysis script outputs:

```json
{
  "file": "utils.ts",
  "functions": [
    { "name": "formatDate", "params": ["date: Date", "locale?: string"], "returnType": "string", "async": false, "exported": true }
  ],
  "classes": [
    { "name": "UserService", "methods": ["getById", "create", "delete"], "exported": true }
  ]
}
```

## Gotchas

- Deno 2.0+ is required — these scripts do not run under Node.js
- Analysis uses regex-based parsing, not a full TypeScript compiler — some edge cases may be missed
- Generated tests are stubs with placeholder assertions (`expect(...).toBeDefined()`) — fill in real logic
- For framework-specific patterns (mocking, setup/teardown), read `references/TESTING-PATTERNS.md`
