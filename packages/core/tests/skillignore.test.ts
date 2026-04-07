import { describe, it, expect } from "vitest";
import { join } from "node:path";
import type { SkillFile } from "@skillscraft/spec";
import {
  parseSkillIgnore,
  loadSkillIgnore,
  isIgnored,
  filterFiles,
} from "../src/skillignore.js";

const FIXTURES = join(import.meta.dirname, "fixtures");

// valid-skill fixture has no .skillignore, so loadSkillIgnore(...) returns DEFAULT_PATTERNS.
const DEFAULT_PATTERNS = loadSkillIgnore(join(FIXTURES, "valid-skill"));

describe("parseSkillIgnore", () => {
  it("parses patterns, skipping comments and blank lines", () => {
    const content = "# comment\n*.log\nfoo/";
    const result = parseSkillIgnore(content);

    expect(result).toEqual(["*.log", "foo/"]);
  });

  it("trims whitespace from lines", () => {
    const content = "  *.log  \n  foo/  ";
    const result = parseSkillIgnore(content);

    expect(result).toEqual(["*.log", "foo/"]);
  });

  it("skips fully blank lines", () => {
    const content = "\n*.log\n\n\nfoo/\n\n";
    const result = parseSkillIgnore(content);

    expect(result).toEqual(["*.log", "foo/"]);
  });

  it("returns an empty array for an all-comment file", () => {
    const content = "# header\n# another comment\n";
    const result = parseSkillIgnore(content);

    expect(result).toEqual([]);
  });
});

describe("loadSkillIgnore", () => {
  it("loads patterns from .skillignore if present", () => {
    const patterns = loadSkillIgnore(join(FIXTURES, "skill-with-ignore"));

    expect(patterns).toContain("secret.txt");
    expect(patterns).toContain("examples/");
  });

  it("returns DEFAULT_PATTERNS when no .skillignore exists", () => {
    const patterns = loadSkillIgnore(join(FIXTURES, "valid-skill"));

    // DEFAULT_PATTERNS includes common meta files and build artifacts
    expect(patterns).toContain("CHANGELOG.md");
    expect(patterns).toContain("*.log");
    expect(patterns).toContain("node_modules/");
    expect(patterns).toContain("examples/");
  });

  it("returns a fresh copy of DEFAULT_PATTERNS (not shared reference)", () => {
    const a = loadSkillIgnore(join(FIXTURES, "valid-skill"));
    const b = loadSkillIgnore(join(FIXTURES, "valid-skill"));

    a.push("extra-mutation");
    expect(b).not.toContain("extra-mutation");
  });
});

describe("isIgnored", () => {
  it("matches CHANGELOG.md against DEFAULT_PATTERNS", () => {
    expect(isIgnored("CHANGELOG.md", DEFAULT_PATTERNS)).toBe(true);
  });

  it("never ignores SKILL.md, even if it appears in patterns", () => {
    expect(isIgnored("SKILL.md", ["SKILL.md"])).toBe(false);
  });

  it("ignores files under examples/ via DEFAULT_PATTERNS", () => {
    expect(isIgnored("examples/usage.md", DEFAULT_PATTERNS)).toBe(true);
  });

  it("does not ignore scripts/run.sh via DEFAULT_PATTERNS", () => {
    expect(isIgnored("scripts/run.sh", DEFAULT_PATTERNS)).toBe(false);
  });

  it("matches *.log glob", () => {
    expect(isIgnored("debug.log", ["*.log"])).toBe(true);
    expect(isIgnored("debug.txt", ["*.log"])).toBe(false);
  });

  it("matches directory pattern foo/", () => {
    expect(isIgnored("foo/bar.txt", ["foo/"])).toBe(true);
    expect(isIgnored("foo", ["foo/"])).toBe(true);
    expect(isIgnored("bar/baz.txt", ["foo/"])).toBe(false);
  });

  it("matches exact file name pattern", () => {
    expect(isIgnored("secret.txt", ["secret.txt"])).toBe(true);
    expect(isIgnored("public.txt", ["secret.txt"])).toBe(false);
  });

  it("does not ignore .skillignore itself", () => {
    expect(isIgnored(".skillignore", DEFAULT_PATTERNS)).toBe(false);
  });
});

describe("filterFiles", () => {
  it("filters out ignored files from a SkillFile list", () => {
    const files: SkillFile[] = [
      { relativePath: "SKILL.md", absolutePath: "/tmp/SKILL.md", size: 100 },
      {
        relativePath: "secret.txt",
        absolutePath: "/tmp/secret.txt",
        size: 10,
      },
      {
        relativePath: "public.txt",
        absolutePath: "/tmp/public.txt",
        size: 10,
      },
      {
        relativePath: "examples/usage.md",
        absolutePath: "/tmp/examples/usage.md",
        size: 20,
      },
      {
        relativePath: "scripts/run.sh",
        absolutePath: "/tmp/scripts/run.sh",
        size: 30,
      },
    ];
    const patterns = ["secret.txt", "examples/"];
    const filtered = filterFiles(files, patterns);

    const filteredPaths = filtered.map((f) => f.relativePath);
    expect(filteredPaths).toContain("SKILL.md");
    expect(filteredPaths).toContain("public.txt");
    expect(filteredPaths).toContain("scripts/run.sh");
    expect(filteredPaths).not.toContain("secret.txt");
    expect(filteredPaths).not.toContain("examples/usage.md");
  });

  it("returns an empty array when all files match patterns", () => {
    const files: SkillFile[] = [
      { relativePath: "a.log", absolutePath: "/tmp/a.log", size: 1 },
      { relativePath: "b.log", absolutePath: "/tmp/b.log", size: 1 },
    ];
    const filtered = filterFiles(files, ["*.log"]);

    expect(filtered).toHaveLength(0);
  });

  it("preserves file order of surviving entries", () => {
    const files: SkillFile[] = [
      { relativePath: "a.txt", absolutePath: "/tmp/a.txt", size: 1 },
      { relativePath: "b.log", absolutePath: "/tmp/b.log", size: 1 },
      { relativePath: "c.txt", absolutePath: "/tmp/c.txt", size: 1 },
    ];
    const filtered = filterFiles(files, ["*.log"]);

    expect(filtered.map((f) => f.relativePath)).toEqual(["a.txt", "c.txt"]);
  });
});
