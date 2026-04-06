# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.9.x   | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, email **pratiyush1@gmail.com** with:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

You will receive a response within 48 hours. We will work with you to understand and address the issue before any public disclosure.

## Scope

This policy covers:

- `@skillscraft/spec` — type definitions and constants
- `@skillscraft/core` — parser, validator, linter, loader
- `@skillscraft/cli` — command-line tool
- Skills in the `skills/` directory

## Security Considerations for Skills

Skills can contain executable scripts. When installing or using skills:

- Always validate skills before installation (`skill validate`)
- Review scripts before execution
- Never install skills from untrusted sources without review
- The `.skillignore` system excludes dev files from deployable packages but does not provide sandboxing
