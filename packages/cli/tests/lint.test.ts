import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { parseSkill, lintSkill } from "@skillscraft/core";

const EXAMPLES = join(import.meta.dirname, "..", "..", "..", "examples");

describe("lint command logic", () => {
  it("clean skill returns no diagnostics", async () => {
    const skill = await parseSkill(join(EXAMPLES, "basic-skill", "SKILL.md"));
    const result = lintSkill(skill);

    // basic-skill is a short, well-formed skill — no lint issues expected
    expect(result.passed).toBe(true);
    expect(
      result.diagnostics.filter((d) => d.severity === "error")
    ).toHaveLength(0);
  });

  it('skill missing "Gotchas" section gets lint warning', async () => {
    const skill = await parseSkill(join(EXAMPLES, "basic-skill", "SKILL.md"));

    // Remove the Gotchas section from the body and make it long enough to trigger the rule
    // The gotchas-present rule only fires for skills with > 50 lines
    const longBody = Array.from(
      { length: 60 },
      (_, i) => `Line ${i + 1}: some content here`
    ).join("\n");

    const modifiedSkill = {
      ...skill,
      body: longBody,
    };

    const result = lintSkill(modifiedSkill);

    const gotchaDiag = result.diagnostics.filter(
      (d) => d.rule === "gotchas-present"
    );
    expect(gotchaDiag.length).toBe(1);
    expect(gotchaDiag[0].severity).toBe("info");
  });
});
