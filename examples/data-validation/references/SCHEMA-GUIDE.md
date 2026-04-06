# Schema Guide

## JSON Schema (draft-07)

The `validate_json.py` script accepts any valid JSON Schema (draft-07) file via the `--schema` flag.

### Minimal schema example

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name"],
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string", "minLength": 1 },
    "email": { "type": "string", "format": "email" }
  }
}
```

### Common patterns

- **Required fields:** `"required": ["field1", "field2"]`
- **Type constraints:** `"type": "string"`, `"type": "integer"`, `"type": "array"`
- **String format:** `"format": "email"`, `"format": "date"`, `"format": "uri"`
- **Enum values:** `"enum": ["active", "inactive", "pending"]`
- **Array items:** `"items": { "type": "object", ... }`

## CSV validation

CSV validation does not use a schema file. It checks:
- Header row presence and uniqueness
- Empty values in any cell
- Duplicate rows (exact match across all columns)
