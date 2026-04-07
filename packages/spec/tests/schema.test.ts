import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const schemaPath = resolve(__dirname, "../schemas/skill.schema.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

describe("skill.schema.json", () => {
  it("has required properties: name and description", () => {
    expect(schema.required).toEqual(["name", "description"]);
  });

  it("sets additionalProperties to false", () => {
    expect(schema.additionalProperties).toBe(false);
  });

  it("defines all SkillFrontmatter properties", () => {
    const keys = Object.keys(schema.properties);
    expect(keys).toContain("name");
    expect(keys).toContain("description");
    expect(keys).toContain("license");
    expect(keys).toContain("compatibility");
    expect(keys).toContain("metadata");
    expect(keys).toContain("allowed-tools");
  });

  it("enforces name constraints from SPEC_LIMITS", () => {
    const name = schema.properties.name;
    expect(name.type).toBe("string");
    expect(name.minLength).toBe(1);
    expect(name.maxLength).toBe(64);
    expect(name.pattern).toBeDefined();
  });

  it("enforces description constraints from SPEC_LIMITS", () => {
    const desc = schema.properties.description;
    expect(desc.type).toBe("string");
    expect(desc.minLength).toBe(1);
    expect(desc.maxLength).toBe(1024);
  });

  it("enforces compatibility maxLength from SPEC_LIMITS", () => {
    expect(schema.properties.compatibility.maxLength).toBe(500);
  });

  it("name pattern rejects consecutive hyphens", () => {
    const pattern = new RegExp(schema.properties.name.pattern);
    expect(pattern.test("my-skill")).toBe(true);
    expect(pattern.test("a-b-c")).toBe(true);
    expect(pattern.test("double--hyphen")).toBe(false);
    expect(pattern.test("-leading")).toBe(false);
    expect(pattern.test("trailing-")).toBe(false);
  });
});
