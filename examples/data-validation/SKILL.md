---
name: data-validation
description: >
  Validate CSV and JSON data files against schemas and quality rules.
  Use when the user asks to check data quality, validate a dataset,
  or verify file contents match an expected schema.
license: Apache-2.0
compatibility: Requires Python 3.11+ and uv
metadata:
  author: skillscraft
  version: "1.0"
  category: data
allowed-tools: Bash Read
---

# Data Validation

## When to use this skill

Activate when the user wants to:
- Check a CSV file for missing headers, type mismatches, or duplicates
- Validate JSON against a schema
- Run data quality checks before a pipeline or import

## Instructions

1. Identify the file type (CSV or JSON) from the user's request
2. For CSV files, run:
   ```
   uv run scripts/validate_csv.py <file-path>
   ```
3. For JSON files, run:
   ```
   uv run scripts/validate_json.py <file-path> --schema <schema-path>
   ```
   Omit `--schema` if no schema is provided — the script checks structural integrity only.
4. Parse the JSON output from stdout
5. Report findings grouped by severity: errors first, then warnings

## Output format

Both scripts output JSON to stdout:

```json
{
  "file": "data.csv",
  "valid": false,
  "errors": [
    { "line": 3, "column": "age", "message": "Expected integer, got 'abc'" }
  ],
  "warnings": [
    { "line": 7, "column": "email", "message": "Empty value" }
  ],
  "summary": { "rows": 100, "errors": 1, "warnings": 1 }
}
```

## Gotchas

- Python 3.11+ is required — scripts use `tomllib` and modern type hints
- Use `uv run` (not `pip install`) to execute scripts with inline dependencies
- CSV files must have a header row — headerless files are rejected
- JSON schema validation uses JSON Schema draft-07
- For custom schema formats, read `references/SCHEMA-GUIDE.md`
