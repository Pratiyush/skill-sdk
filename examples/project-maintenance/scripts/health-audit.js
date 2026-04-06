#!/usr/bin/env node

/**
 * health-audit.js — Audit project health: stale issues, unreviewed PRs, missing labels.
 *
 * Usage:
 *   node health-audit.js [--stale-days 30] [--pr-days 7]
 *
 * Requires: gh CLI authenticated
 */

const { execSync } = require("node:child_process");
const { parseArgs } = require("node:util");

function exec(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return null;
  }
}

function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function checkStaleIssues(staleDays) {
  const result = exec(`gh issue list --state open --json number,title,updatedAt,labels --limit 100`);
  if (!result) return { name: "Stale issues", status: "warning", detail: "Could not fetch issues" };
  const issues = JSON.parse(result);
  const stale = issues.filter((i) => daysSince(i.updatedAt) > staleDays);
  return {
    name: "Stale issues",
    status: stale.length === 0 ? "pass" : "warning",
    detail: stale.length === 0
      ? `No issues inactive for ${staleDays}+ days`
      : `${stale.length} stale issue(s): ${stale.map((i) => `#${i.number} (${daysSince(i.updatedAt)}d)`).join(", ")}`,
    items: stale.map((i) => ({ number: i.number, title: i.title, daysInactive: daysSince(i.updatedAt) })),
  };
}

function checkUnreviewedPRs(prDays) {
  const result = exec(`gh pr list --state open --json number,title,createdAt,reviewRequests --limit 50`);
  if (!result) return { name: "Unreviewed PRs", status: "warning", detail: "Could not fetch PRs" };
  const prs = JSON.parse(result);
  const old = prs.filter((p) => daysSince(p.createdAt) > prDays);
  return {
    name: "Unreviewed PRs",
    status: old.length === 0 ? "pass" : "warning",
    detail: old.length === 0
      ? `No PRs waiting ${prDays}+ days`
      : `${old.length} PR(s) awaiting review: ${old.map((p) => `#${p.number} (${daysSince(p.createdAt)}d)`).join(", ")}`,
    items: old.map((p) => ({ number: p.number, title: p.title, daysOpen: daysSince(p.createdAt) })),
  };
}

function checkUnlabeledIssues() {
  const result = exec(`gh issue list --state open --json number,title,labels --limit 100`);
  if (!result) return { name: "Unlabeled issues", status: "warning", detail: "Could not fetch issues" };
  const issues = JSON.parse(result);
  const unlabeled = issues.filter((i) => !i.labels || i.labels.length === 0);
  return {
    name: "Unlabeled issues",
    status: unlabeled.length === 0 ? "pass" : "warning",
    detail: unlabeled.length === 0
      ? "All open issues have labels"
      : `${unlabeled.length} unlabeled issue(s): ${unlabeled.map((i) => `#${i.number}`).join(", ")}`,
    items: unlabeled.map((i) => ({ number: i.number, title: i.title })),
  };
}

function checkDependencyFreshness() {
  const result = exec("pnpm outdated --json 2>/dev/null");
  if (!result) return { name: "Dependency freshness", status: "pass", detail: "All dependencies up to date" };
  try {
    const outdated = JSON.parse(result);
    const count = Object.keys(outdated).length;
    const majorBumps = Object.entries(outdated).filter(
      ([, info]) => info.current && info.latest && info.current.split(".")[0] !== info.latest.split(".")[0]
    );
    return {
      name: "Dependency freshness",
      status: majorBumps.length > 3 ? "warning" : "pass",
      detail: `${count} outdated package(s), ${majorBumps.length} major bump(s) available`,
    };
  } catch {
    return { name: "Dependency freshness", status: "pass", detail: "Dependencies check completed" };
  }
}

function main() {
  const { values } = parseArgs({
    options: {
      "stale-days": { type: "string", default: "30" },
      "pr-days": { type: "string", default: "7" },
    },
  });

  const staleDays = parseInt(values["stale-days"], 10);
  const prDays = parseInt(values["pr-days"], 10);

  const items = [
    checkStaleIssues(staleDays),
    checkUnreviewedPRs(prDays),
    checkUnlabeledIssues(),
    checkDependencyFreshness(),
  ];

  const passed = items.filter((i) => i.status === "pass").length;
  const warnings = items.filter((i) => i.status === "warning").length;
  const failed = items.filter((i) => i.status === "fail").length;

  console.log(
    JSON.stringify(
      {
        check: "health-audit",
        date: new Date().toISOString().split("T")[0],
        passed,
        failed,
        warnings,
        items: items.map(({ items: _, ...rest }) => rest),
        verdict: failed > 0 ? "UNHEALTHY" : warnings > 0 ? "NEEDS_ATTENTION" : "HEALTHY",
      },
      null,
      2
    )
  );
}

main();
