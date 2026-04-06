---
name: code-quality
description: >
  Analyze Java source files for code quality issues including style violations,
  complexity warnings, and common anti-patterns.
  Use when reviewing Java code, running quality checks, or preparing for code review.
license: Apache-2.0
compatibility: Requires Java 17+ (JEP 330 single-file execution)
metadata:
  author: skillscraft
  version: "1.0"
  category: code-quality
  language: java
---

# Code Quality

## When to use this skill

Activate when the user wants to:
- Review Java source files for style and quality issues
- Run pre-commit quality checks on Java code
- Detect common anti-patterns before code review

## Instructions

1. For style checks, run:
   ```
   java scripts/CheckStyle.java <source-file-or-directory>
   ```
2. For anti-pattern detection, run:
   ```
   java scripts/FindPatterns.java <source-file>
   ```
3. Parse the JSON output from each script
4. Combine results and present findings sorted by severity (error > warning > info)
5. For custom rules, pass the config file: `java scripts/CheckStyle.java --rules assets/default-rules.json <path>`

## Output format

Scripts output JSON to stdout:

```json
{
  "file": "MyClass.java",
  "issues": [
    {
      "line": 15,
      "rule": "method-too-long",
      "severity": "warning",
      "message": "Method 'processData' has 65 lines (max: 50)"
    }
  ],
  "summary": { "errors": 0, "warnings": 1, "info": 0 }
}
```

## Default rules

The default ruleset is in `assets/default-rules.json`. Copy it and modify thresholds to customize. Key defaults:
- Max method length: 50 lines
- Max line width: 120 characters
- Max file length: 500 lines
- Cyclomatic complexity threshold: 10

## Gotchas

- Java 17+ is required for single-file source execution (JEP 330)
- Scripts scan `.java` files only — other file types are skipped
- Directory mode scans recursively but skips `build/`, `target/`, and hidden directories
- The `assets/default-rules.json` can be modified but the schema must remain unchanged
