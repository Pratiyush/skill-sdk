import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { join } from "node:path";
import { validateCommand } from "../src/commands/validate.js";
import { lintCommand } from "../src/commands/lint.js";

const EXAMPLES = join(import.meta.dirname, "..", "..", "..", "examples");

describe("--json output for CLI commands", () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let writtenChunks: string[];

  beforeEach(() => {
    writtenChunks = [];
    stdoutSpy = vi
      .spyOn(process.stdout, "write")
      .mockImplementation((chunk: string | Uint8Array) => {
        writtenChunks.push(
          typeof chunk === "string" ? chunk : Buffer.from(chunk).toString()
        );
        return true;
      });
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it("validate --json outputs valid JSON with expected shape", async () => {
    const skillPath = join(EXAMPLES, "basic-skill");

    await validateCommand(skillPath, { json: true });

    // Should write JSON to stdout
    expect(writtenChunks.length).toBeGreaterThan(0);
    const output = writtenChunks.join("");
    const parsed = JSON.parse(output);

    expect(parsed).toHaveProperty("valid");
    expect(parsed).toHaveProperty("errors");
    expect(parsed).toHaveProperty("warnings");
    expect(parsed).toHaveProperty("path");
    expect(parsed.valid).toBe(true);
    expect(Array.isArray(parsed.errors)).toBe(true);
    expect(Array.isArray(parsed.warnings)).toBe(true);

    // Console.log should not have been called (all output through stdout)
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it("lint --json outputs valid JSON with expected shape", async () => {
    const skillPath = join(EXAMPLES, "basic-skill");

    await lintCommand(skillPath, { json: true });

    expect(writtenChunks.length).toBeGreaterThan(0);
    const output = writtenChunks.join("");
    const parsed = JSON.parse(output);

    expect(parsed).toHaveProperty("passed");
    expect(parsed).toHaveProperty("diagnostics");
    expect(parsed).toHaveProperty("path");
    expect(Array.isArray(parsed.diagnostics)).toBe(true);

    // Console.log should not have been called when --json is set
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });
});
