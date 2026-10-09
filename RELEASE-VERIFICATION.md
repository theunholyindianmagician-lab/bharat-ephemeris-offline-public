# Release verification

The release gate runs seven local Node.js suites through `scripts/verify-release.js` and, with `--write-report`, records the evidence in `release-verification-report.json`. Both commands exist in `package.json`:

```sh
npm ci                              # Playwright (the two end-to-end suites drive headless Chromium)
npx playwright install chromium     # once; or: export PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chromium
npm run verify:release              # run the gate, print PASS/FAIL per suite and the totals
npm run verify:release:report       # the same, then write release-verification-report.json
```

The script starts `python3 -m http.server 8877` for the end-to-end suites and stops it afterwards. `npm test` (`scripts/test-all.cjs`, 54 suites) is the development loop; the release gate is the narrower, evidence-producing subset below.

| Suite | File | Checks |
| --- | --- | ---: |
| Independent UI | `independent-ui-regression.test.js` | 7 |
| Mathematical Kernel | `math-core.test.js` | 70 |
| Sprint Upgrades | `sprint-upgrades.test.js` | 22 |
| Kernel Regression | `kernel-regression.test.js` | 6 |
| Triveni Integrations | `triveni.test.js` | 10 |
| E2E Transit Test | `scripts/transit-e2e.test.mjs` | 2 |
| E2E DOM Integrity | `scripts/e2e-dom-integrity.mjs` | 6 (one per product page) |

A **123/123** statement means every check declared by these seven suites exited successfully. The counts are parsed from each suite's own output (`N/N … passed`, `PASS COMPLETE: N/N`, `N mathematical checks passed`, or a final JSON line `{"status":"PASS","tests":N}`); a suite whose output cannot be parsed counts as a failure, never as zero.

## What the report records

`release-verification-report.json` carries the UTC timestamp, runtime and OS metadata, Git HEAD and branch, the porcelain status, the SHA-256 of the tracked diff against HEAD, a SHA-256 for every untracked file, a composite snapshot SHA-256, each suite's file hash, exit code and full output. The report excludes itself from the snapshot. **A report from a dirty tree identifies a working snapshot, not a commit**: either commit everything first so `repository.clean` is `true` and `repository.head` names the exact tree verified, or keep the report together with an archive of that working tree. The report is not published with the source: generate it on a clean tree at the commit to be verified, and regenerate it on every release.

## What it is not

It is not a claim of exhaustive scientific validation, broad browser or device coverage, or correctness beyond the assertions encoded in those suites. Every planetary fixture in them is a numerical regression pin or an agreement-with-Swiss/JPL figure, self-labelled as such; none is an observational accuracy measurement. Browser and performance claims require separately captured browser versions, device/viewport details, and measured traces.

## The last recorded run

`release-verification-report.json` was last generated on a clean tree on 2026-10-07: **123/123** checks, snapshot SHA-256 `32cf9223efac0dd8f896212d40c784db839e53b0e85e341bd583bd43c338c6b4`. That report, and the commit it names, are not published; any commit is verified only by running the gate on it (`npm run verify:release:report`).
