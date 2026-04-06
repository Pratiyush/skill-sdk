# /// script
# requires-python = ">=3.11"
# dependencies = ["jsonschema>=4.20"]
# ///
"""Validate a JSON file, optionally against a JSON Schema."""

import argparse
import json
import sys
from pathlib import Path


def validate_structure(data: object) -> list[dict]:
    """Basic structural checks when no schema is provided."""
    warnings: list[dict] = []
    if isinstance(data, dict):
        for key, val in data.items():
            if val is None:
                warnings.append({"path": f"$.{key}", "message": "Null value"})
            elif isinstance(val, str) and val.strip() == "":
                warnings.append({"path": f"$.{key}", "message": "Empty string"})
    elif isinstance(data, list):
        if len(data) == 0:
            warnings.append({"path": "$", "message": "Empty array"})
    return warnings


def validate_with_schema(data: object, schema: dict) -> list[dict]:
    """Validate data against a JSON Schema (draft-07)."""
    from jsonschema import Draft7Validator

    validator = Draft7Validator(schema)
    errors: list[dict] = []
    for error in sorted(validator.iter_errors(data), key=lambda e: list(e.path)):
        path = "$.%s" % ".".join(str(p) for p in error.absolute_path) if error.absolute_path else "$"
        errors.append({"path": path, "message": error.message})
    return errors


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate a JSON file, optionally against a schema")
    parser.add_argument("file", help="Path to the JSON file")
    parser.add_argument("--schema", help="Path to a JSON Schema file (draft-07)", default=None)
    parser.add_argument("--strict", action="store_true", help="Treat warnings as errors")
    args = parser.parse_args()

    path = Path(args.file)
    if not path.exists():
        result = {"file": args.file, "valid": False, "errors": [{"path": "", "message": f"File not found: {args.file}"}], "warnings": []}
        json.dump(result, sys.stdout, indent=2)
        print()
        sys.exit(1)

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        result = {"file": args.file, "valid": False, "errors": [{"path": "", "message": f"Invalid JSON: {e}"}], "warnings": []}
        json.dump(result, sys.stdout, indent=2)
        print()
        sys.exit(1)

    errors: list[dict] = []
    warnings: list[dict] = validate_structure(data)

    if args.schema:
        schema_path = Path(args.schema)
        if not schema_path.exists():
            result = {"file": args.file, "valid": False, "errors": [{"path": "", "message": f"Schema not found: {args.schema}"}], "warnings": []}
            json.dump(result, sys.stdout, indent=2)
            print()
            sys.exit(1)

        schema = json.loads(schema_path.read_text(encoding="utf-8"))
        errors = validate_with_schema(data, schema)

    if args.strict:
        errors.extend(warnings)
        warnings = []

    valid = len(errors) == 0
    result = {"file": args.file, "valid": valid, "errors": errors, "warnings": warnings}
    json.dump(result, sys.stdout, indent=2)
    print()
    sys.exit(0 if valid else 1)


if __name__ == "__main__":
    main()
