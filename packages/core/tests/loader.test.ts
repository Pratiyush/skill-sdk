import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { join } from "node:path";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { loadSkillManifest } from "../src/loader.js";
import { filterFiles, loadSkillIgnore } from "../src/skillignore.js";

const FIXTURES = join(import.meta.dirname, "fixtures");

describe("loadSkillManifest", () => {
  it("loads a valid skill directory", async () => {
    const manifest = await loadSkillManifest(join(FIXTURES, "valid-skill"));

    expect(manifest.skill.frontmatter.name).toBe("valid-skill");
    expect(manifest.skill.body).toContain("# Valid Skill");
    expect(Array.isArray(manifest.files)).toBe(true);
    expect(manifest.files.length).toBeGreaterThan(0);

    const hasSkillMd = manifest.files.some(
      (f) => f.relativePath === "SKILL.md"
    );
    expect(hasSkillMd).toBe(true);
  });

  it("returns frontmatter, body, files list, and directory flags", async () => {
    const manifest = await loadSkillManifest(join(FIXTURES, "valid-skill"));

    expect(manifest).toHaveProperty("skill");
    expect(manifest).toHaveProperty("files");
    expect(manifest).toHaveProperty("hasScripts");
    expect(manifest).toHaveProperty("hasReferences");
    expect(manifest).toHaveProperty("hasAssets");

    expect(typeof manifest.hasScripts).toBe("boolean");
    expect(typeof manifest.hasReferences).toBe("boolean");
    expect(typeof manifest.hasAssets).toBe("boolean");

    // valid-skill only has SKILL.md, so no subdirs
    expect(manifest.hasScripts).toBe(false);
    expect(manifest.hasReferences).toBe(false);
    expect(manifest.hasAssets).toBe(false);
  });

  it("reports file size for each file in the manifest", async () => {
    const manifest = await loadSkillManifest(join(FIXTURES, "valid-skill"));

    for (const file of manifest.files) {
      expect(typeof file.size).toBe("number");
      expect(file.size).toBeGreaterThan(0);
      expect(file.absolutePath).toBeTruthy();
      expect(file.relativePath).toBeTruthy();
    }
  });

  describe("with scripts, references, assets directories", () => {
    let tempDir: string;
    let skillDir: string;

    beforeAll(async () => {
      tempDir = await mkdtemp(join(tmpdir(), "skillcraft-loader-test-"));
      skillDir = join(tempDir, "full-skill");
      await mkdir(skillDir);
      await mkdir(join(skillDir, "scripts"));
      await mkdir(join(skillDir, "references"));
      await mkdir(join(skillDir, "assets"));

      await writeFile(
        join(skillDir, "SKILL.md"),
        "---\nname: full-skill\ndescription: A skill with scripts, references, and assets subdirectories.\n---\n\n# Full Skill\n"
      );
      await writeFile(join(skillDir, "scripts", "run.sh"), "#!/bin/bash\necho hi\n");
      await writeFile(join(skillDir, "references", "docs.md"), "# Reference\n");
      await writeFile(join(skillDir, "assets", "image.txt"), "fake image bytes\n");
    });

    afterAll(async () => {
      await rm(tempDir, { recursive: true, force: true });
    });

    it("sets hasScripts, hasReferences, hasAssets to true", async () => {
      const manifest = await loadSkillManifest(skillDir);

      expect(manifest.hasScripts).toBe(true);
      expect(manifest.hasReferences).toBe(true);
      expect(manifest.hasAssets).toBe(true);
    });

    it("includes nested files in the files list", async () => {
      const manifest = await loadSkillManifest(skillDir);

      const paths = manifest.files.map((f) => f.relativePath).sort();
      expect(paths).toContain("SKILL.md");
      expect(paths.some((p) => p.startsWith("scripts/"))).toBe(true);
      expect(paths.some((p) => p.startsWith("references/"))).toBe(true);
      expect(paths.some((p) => p.startsWith("assets/"))).toBe(true);
    });
  });

  describe("with .skillignore integration", () => {
    it("filters out ignored files when combined with filterFiles", async () => {
      const manifest = await loadSkillManifest(
        join(FIXTURES, "skill-with-ignore")
      );
      const patterns = loadSkillIgnore(join(FIXTURES, "skill-with-ignore"));
      const filtered = filterFiles(manifest.files, patterns);

      const filteredPaths = filtered.map((f) => f.relativePath);

      // SKILL.md must remain (protected)
      expect(filteredPaths).toContain("SKILL.md");
      // public.txt remains
      expect(filteredPaths).toContain("public.txt");
      // scripts/run.sh remains
      expect(filteredPaths.some((p) => p === "scripts/run.sh")).toBe(true);
      // secret.txt filtered out
      expect(filteredPaths).not.toContain("secret.txt");
      // examples/usage.md filtered out
      expect(
        filteredPaths.some((p) => p.startsWith("examples/"))
      ).toBe(false);
    });
  });
});
