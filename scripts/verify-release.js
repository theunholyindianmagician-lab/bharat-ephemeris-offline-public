#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const reportName = "release-verification-report.json";
const suites = [
  ["Independent UI", "independent-ui-regression.test.js"],
  ["Mathematical Kernel", "math-core.test.js"],
  ["Sprint Upgrades", "sprint-upgrades.test.js"],
  ["Kernel Regression", "kernel-regression.test.js"],
  ["Triveni Integrations", "triveni.test.js"],
  ["E2E Transit Test", "scripts/transit-e2e.test.mjs"],
  ["E2E DOM Integrity", "scripts/e2e-dom-integrity.mjs"],
];

function parseTestCount(output) {
  const lines = output.trim().split(/\r?\n/).filter(Boolean);
  for (const line of lines.slice().reverse()) {
    try {
      const value = JSON.parse(line);
      if (value.status === "PASS" && Number.isInteger(value.tests) && value.tests > 0) return value.tests;
    } catch {}
  }
  const patterns = [
    /(\d+)\/(\d+)\s+(?:[^\n]*?)passed/i,
    /PASS COMPLETE:\s*(\d+)\/(\d+)/i,
    /(?:^|\n)(\d+)\s+(?:mathematical checks|sprint tests) passed/i,
  ];
  for (const pattern of patterns) {
    const match = output.match(pattern);
    if (!match) continue;
    const passed = Number(match[1]);
    const total = match[2] === undefined ? passed : Number(match[2]);
    if (passed === total && total > 0) return total;
  }
  return null;
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
}

function stdout(command, args) {
  const result = run(command, args);
  if (result.status !== 0) return null;
  return result.stdout.trim();
}

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function fileHash(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    return sha256(fs.readFileSync(fullPath));
  }
  return null;
}

const gitStatusRaw = stdout("git", ["status", "--porcelain=v1", "--untracked-files=all"]);
const gitStatus = (gitStatusRaw || "").split("\n").filter(line => line.trim()).join("\n");

const trackedDiff = run("git", ["diff", "--binary", "HEAD", "--", "."]);
const untracked = (stdout("git", ["ls-files", "--others", "--exclude-standard"]) || "")
  .split("\n")
  .filter((relativePath) => relativePath && relativePath !== reportName)
  .sort();
const untrackedHashes = Object.fromEntries(
  untracked.map((relativePath) => [relativePath, fileHash(relativePath)])
);
const trackedDiffSha256 = trackedDiff.status === 0 ? sha256(trackedDiff.stdout) : null;
const snapshotSha256 = sha256(JSON.stringify({
  head: stdout("git", ["rev-parse", "HEAD"]),
  trackedDiffSha256,
  untrackedFileSha256: untrackedHashes,
}));

const results = [];
let passedChecks = 0;
let failed = false;

let serverProcess = null;
try {
  // stdio must be ignored: the server logs every request to stderr, and a piped-but-unread
  // stderr blocks the server once the pipe buffer (~64 KB) fills, so later page loads time out.
  serverProcess = require('node:child_process').spawn('python3', ['-m', 'http.server', '8877'], { cwd: root, detached: true, stdio: 'ignore' });
  // Wait a second for the server to bind
  spawnSync('sleep', ['1']);
} catch (e) {
  console.error("Warning: could not start local server on 8877");
}

for (const [name, file] of suites) {
  if (!fs.existsSync(path.join(root, file))) {
    results.push({ name, file, checks: null, exitCode: null, passed: false, error: "missing test file" });
    failed = true;
    continue;
  }
  const result = run(process.execPath, [file]);
  const checks = parseTestCount(result.stdout);
  const passed = result.status === 0 && checks !== null;
  if (passed) passedChecks += checks;
  else failed = true;
  results.push({
    name,
    file,
    checks,
    exitCode: result.status,
    passed,
    countSource: "parsed from suite output",
    sha256: fileHash(file),
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  });
  process.stdout.write(`${passed ? "PASS" : "FAIL"} ${name}: ${passed ? checks : 0}/${checks}\n`);
}

const totalChecks = results.reduce((acc, result) => acc + (result.checks || 0), 0);

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  scope: "The seven repository test suites listed in suites; not universal scientific or cross-browser validation.",
  repository: {
    root,
    head: stdout("git", ["rev-parse", "HEAD"]),
    branch: stdout("git", ["branch", "--show-current"]),
    clean: gitStatus === "",
    statusPorcelain: gitStatus || "",
    trackedDiffSha256,
    untrackedFileSha256: untrackedHashes,
    snapshotSha256,
  },
  environment: {
    node: process.version,
    npm: stdout("npm", ["--version"]),
    platform: process.platform,
    architecture: process.arch,
    osRelease: os.release(),
    osVersion: typeof os.version === "function" ? os.version() : null,
  },
  command: "npm run verify:release",
  summary: { passedChecks, totalChecks, passed: !failed && passedChecks === totalChecks },
  suites: results,
};

process.stdout.write(`\n${report.summary.passed ? "PASS" : "FAIL"} release verification: ${passedChecks}/${totalChecks} checks\n`);
process.stdout.write(`HEAD ${report.repository.head}\n`);
process.stdout.write(`Working tree ${report.repository.clean ? "clean" : "DIRTY (snapshot fingerprints recorded)"}\n`);
process.stdout.write(`${JSON.stringify({ status: report.summary.passed ? "PASS" : "FAIL", ...report.summary, snapshotSha256 })}\n`);

if (process.argv.includes("--write-report")) {
  const destination = path.join(root, reportName);
  const tempDestination = destination + ".tmp";
  fs.writeFileSync(tempDestination, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.renameSync(tempDestination, destination);
  process.stdout.write(`Report written: ${destination}\n`);
}

if (serverProcess) {
  try {
    process.kill(-serverProcess.pid);
  } catch (e) {}
}

process.exitCode = report.summary.passed ? 0 : 1;
