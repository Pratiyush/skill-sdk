#!/usr/bin/env node

/**
 * pr-checklist.js — Run PR review checklist against a GitHub pull request.
 *
 * Usage:
 *   node pr-checklist.js --pr <number> [--repo <owner/repo>]
 *
 * Requires: gh CLI authenticated
 */

const { execSync } = require("node:child_process");
const { parseArgs } = require("node:util");

const CONVENTIONAL_PREFIXES = [
  "feat",
  "fix",
  "docs",
  "chore",
  "refactor",
  "perf",
  "test",
  "ci",
  "build",
  "style",
];

function exec(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch (e) {
    return null;
  }
}

function getPR(number, repo) {
  const repoFlag = repo ? `--repo ${repo}` : "";
  const raw = exec(
    `gh pr view ${number} ${repoFlag} --json title,body,labels,reviewRequests,headRefName,statusCheckRollup,files,additions,deletions`
  );
  if (!raw) {
    console.error(`Error: Could not fetch PR #${number}. Is gh authenticated?`);
    process.exit(1);
  }
  return JSON.parse(raw);
}

function checkTitle(pr) {
  const title = pr.title || "";
  const hasPrefix = CONVENTIONAL_PREFIXES.some(
    (p) => title.startsWith(`${p}:`) || title.startsWith(`${p}(`)
  );
  const hasBreaking = title.includes("!");
  return {
    name: "Title follows conventional commits",
    status: hasPrefix ? "pass" : "fail",
    detail: hasPrefix
      ? `Prefix: ${title.split(/[:(]/)[0]}`
      : `Title "${title}" should start with feat:, fix:, docs:, etc.`,
    breaking: hasBreaking,
  };
}

function checkDescription(pr) {
  const body = pr.body || "";
  const hasSummary =
    body.includes("## Summary") || body.includes("## What");
  const hasBullets = /^[-*]\s/m.test(body);
  const ok = hasSummary && hasBullets;
  return {
    name: "Description has Summary section",
    status: ok ? "pass" : body.length > 50 ? "warning" : "fail",
    detail: ok
      ? "Summary section found with bullet points"
      : "Missing ## Summary section or bullet points in description",
  };
}

function checkCI(pr) {
  const checks = pr.statusCheckRollup || [];
  const failed = checks.filter(
    (c) => c.conclusion === "FAILURE" || c.conclusion === "ERROR"
  );
  const pending = checks.filter(
    (c) => c.status === "IN_PROGRESS" || c.status === "QUEUED"
  );
  if (failed.length > 0) {
    return {
      name: "CI checks green",
      status: "fail",
      detail: `${failed.length} check(s) failed: ${failed.map((c) => c.name || c.context).join(", ")}`,
    };
  }
  if (pending.length > 0) {
    return {
      name: "CI checks green",
      status: "warning",
      detail: `${pending.length} check(s) still running`,
    };
  }
  return {
    name: "CI checks green",
    status: checks.length > 0 ? "pass" : "warning",
    detail:
      checks.length > 0
        ? `All ${checks.length} checks passed`
        : "No CI checks found",
  };
}

function checkLabels(pr) {
  const labels = pr.labels || [];
  return {
    name: "Has labels",
    status: labels.length > 0 ? "pass" : "fail",
    detail:
      labels.length > 0
        ? `Labels: ${labels.map((l) => l.name).join(", ")}`
        : "No labels assigned. Add bug, enhancement, documentation, etc.",
  };
}

function checkReviewers(pr) {
  const reviewers = pr.reviewRequests || [];
  return {
    name: "Reviewers assigned",
    status: reviewers.length > 0 ? "pass" : "warning",
    detail:
      reviewers.length > 0
        ? `${reviewers.length} reviewer(s) assigned`
        : "No reviewers assigned",
  };
}

function checkBranch(pr) {
  const branch = pr.headRefName || "";
  const bad = ["patch-1", "patch-2", "main", "master", "develop"];
  const isGeneric = bad.includes(branch) || /^patch-\d+$/.test(branch);
  return {
    name: "Branch name is descriptive",
    status: isGeneric ? "warning" : "pass",
    detail: isGeneric
      ? `Branch "${branch}" is generic — use a descriptive name like feat/add-gallery`
      : `Branch: ${branch}`,
  };
}

function checkFiles(pr) {
  const files = pr.files || [];
  const secrets = files.filter((f) =>
    /\.(env|pem|key|secret|credentials)$/i.test(f.path)
  );
  const large = files.filter((f) => f.additions > 1000);
  const issues = [];
  if (secrets.length > 0)
    issues.push(`Sensitive files: ${secrets.map((f) => f.path).join(", ")}`);
  if (large.length > 0)
    issues.push(`Large files (>1000 lines): ${large.map((f) => f.path).join(", ")}`);

  return {
    name: "No secrets or large binaries",
    status: secrets.length > 0 ? "fail" : issues.length > 0 ? "warning" : "pass",
    detail: issues.length > 0 ? issues.join("; ") : `${files.length} files changed`,
  };
}

function checkChangelog(pr) {
  const files = pr.files || [];
  const touchesChangelog = files.some(
    (f) => f.path === "CHANGELOG.md" || f.path.includes("CHANGELOG")
  );
  // Only required for user-facing changes
  const title = (pr.title || "").toLowerCase();
  const isUserFacing =
    title.startsWith("feat") || title.startsWith("fix") || title.includes("breaking");
  if (!isUserFacing) {
    return {
      name: "CHANGELOG updated",
      status: "pass",
      detail: "Non-user-facing change — changelog not required",
    };
  }
  return {
    name: "CHANGELOG updated",
    status: touchesChangelog ? "pass" : "warning",
    detail: touchesChangelog
      ? "CHANGELOG.md included in changes"
      : "User-facing change but CHANGELOG.md not updated",
  };
}

function main() {
  const { values } = parseArgs({
    options: {
      pr: { type: "string" },
      repo: { type: "string", default: "" },
    },
  });

  if (!values.pr) {
    console.error("Error: --pr <number> is required");
    process.exit(1);
  }

  const pr = getPR(values.pr, values.repo);
  const items = [
    checkTitle(pr),
    checkDescription(pr),
    checkCI(pr),
    checkLabels(pr),
    checkReviewers(pr),
    checkBranch(pr),
    checkFiles(pr),
    checkChangelog(pr),
  ];

  const passed = items.filter((i) => i.status === "pass").length;
  const failed = items.filter((i) => i.status === "fail").length;
  const warnings = items.filter((i) => i.status === "warning").length;

  let verdict = "READY";
  if (failed > 0) verdict = "NEEDS_WORK";
  else if (warnings > 0) verdict = "WARNING";

  const result = {
    check: "pr-checklist",
    target: `#${values.pr}`,
    passed,
    failed,
    warnings,
    items: items.map(({ breaking, ...rest }) => rest),
    verdict,
  };

  console.log(JSON.stringify(result, null, 2));
}

main();
