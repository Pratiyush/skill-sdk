import { test, expect } from "@playwright/test";

test.describe("Specification Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/specification.html");
  });

  test("renders all spec sections", async ({ page }) => {
    const sections = ["file-format", "frontmatter", "name-rules", "directory-structure", "validation-rules", "lint-rules", "extended-spec", "constants"];
    for (const id of sections) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  test("TOC links point to correct sections", async ({ page }) => {
    const tocLinks = page.locator(".toc a");
    const count = await tocLinks.count();
    expect(count).toBe(8);

    // Click first TOC link and verify scroll target exists
    await tocLinks.first().click();
    await expect(page.locator("#file-format")).toBeVisible();
  });

  test("frontmatter table has all 6 fields", async ({ page }) => {
    const rows = page.locator("#frontmatter table tbody tr");
    await expect(rows).toHaveCount(6);
  });

  test("validation rules table has all rules", async ({ page }) => {
    const rows = page.locator("#validation-rules table tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(14);
  });

  test("lint rules table has all 6 rules", async ({ page }) => {
    const rows = page.locator("#lint-rules table tbody tr");
    await expect(rows).toHaveCount(6);
  });

  test("extended spec section has 4 interfaces", async ({ page }) => {
    const headings = page.locator("#extended-spec h3");
    await expect(headings).toHaveCount(4);
  });

  test("constants table has name regex", async ({ page }) => {
    const regexCell = page.locator("#constants table").getByText("Name regex");
    await expect(regexCell).toBeVisible();
  });

  test("name rules shows valid and invalid examples", async ({ page }) => {
    await expect(page.locator("#name-rules").getByText("code-review", { exact: true })).toBeVisible();
    await expect(page.locator("#name-rules").getByText("Code-Review", { exact: true })).toBeVisible();
  });

  test("code blocks are styled correctly", async ({ page }) => {
    const codeBlocks = page.locator(".code-block");
    const count = await codeBlocks.count();
    expect(count).toBeGreaterThan(3);
  });
});
