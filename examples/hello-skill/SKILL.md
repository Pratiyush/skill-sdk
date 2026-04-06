---
name: hello-skill
description: >
  Generate friendly greeting messages in multiple languages.
  Use when the user asks for a hello message, welcome text,
  or localized greeting.
license: MIT
compatibility: Node.js 22+ or any JavaScript runtime
metadata:
  author: skillscraft
  version: "1.0"
  category: utilities
  tags: greeting localization i18n
allowed-tools: Bash Read
---

# Hello Skill

## When to use this skill

Activate when the user wants to:
- Generate a greeting message in a specific language
- Create welcome text for an application or document
- Translate "hello" into multiple languages

## Instructions

1. Ask the user which language they need (or default to English)
2. Run the greeting script:
   ```
   node scripts/greet.js --lang <language-code>
   ```
3. If the language is not supported, check `references/LANGUAGES.md`
   for the full list and suggest the closest match
4. For custom templates, use the assets in `assets/templates/`

## Output format

The script outputs JSON:

```json
{
  "language": "es",
  "greeting": "Hola, mundo!",
  "formal": "Buenos dias, estimado usuario."
}
```

## Gotchas

- Language codes follow ISO 639-1 (e.g., "en", "es", "ja", "de")
- The script defaults to English if an unknown code is passed
- Formal greetings are only available for: en, es, fr, de, ja
- Keep messages under 200 characters for chat compatibility
- See `references/LANGUAGES.md` for the complete supported list
