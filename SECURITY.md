# Security Analysis — Dependency Vulnerability Remediation

**Date:** 2026-08-14
**Affected release:** `0.1.1`
**Fixed in release:** `0.1.2`
**Baseline:** 12 vulnerabilities — 8 high, 3 moderate, 1 low
**Result:** 0 vulnerabilities

---

## 1. Executive Summary

GitHub Dependabot raised alerts against this repository. A local `npm audit` confirmed **12 vulnerabilities across 13 packages**.

The single most important finding is that **only one of the twelve reaches end users.**

This extension ships **unbundled** — there is no webpack/esbuild step, and [`.vscodeignore`](.vscodeignore) does not exclude `node_modules`. Inspecting the published artifact confirms what that implies:

```
$ unzip -l project-structure-extractor-0.1.1.vsix | grep node_modules
   extension/node_modules/minimatch/dist/commonjs/index.js
   extension/node_modules/@isaacs/brace-expansion/dist/commonjs/index.d.ts
   ...
```

`minimatch` is the **only** production dependency, and it *is* installed onto every user's machine. Everything else is a `devDependency` and never leaves this repository.

| Class | Count | Ships to users? | Real-world impact |
|---|---|---|---|
| Production (`minimatch` + its `brace-expansion`) | 2 | **Yes** | Genuine ReDoS surface — see §3 |
| Development (`eslint`, `@vscode/test-cli` → `mocha`) | 10 | No | Repository hygiene only |

Both classes were fixed. The production fix is the one that requires a marketplace republish to reach users.

---

## 2. Complete Findings

Every target version below was verified to exist on the npm registry, and the resolved tree was confirmed with `npm ls` after installation.

| # | Package | Was | Sev | Advisory | Reached via | Resolution |
|---|---|---|---|---|---|---|
| 1 | `minimatch` | 10.0.3 | High | [GHSA-3ppc-4f35-3m26](https://github.com/advisories/GHSA-3ppc-4f35-3m26), [GHSA-7r86-cg39-jmmj](https://github.com/advisories/GHSA-7r86-cg39-jmmj), [GHSA-23c5-xmqv-rm74](https://github.com/advisories/GHSA-23c5-xmqv-rm74) | **direct production** | → `^10.2.6` |
| 2 | `@isaacs/brace-expansion` | 5.0.0 | High | [GHSA-7h2j-956f-4vf2](https://github.com/advisories/GHSA-7h2j-956f-4vf2) | `minimatch@10.0.3` | package eliminated — see note A |
| 3 | `minimatch` | 3.1.2 | High | as #1 | `eslint`, `@eslint/config-array`, `@eslint/eslintrc` | `eslint@^9.39.5` requires `minimatch ^3.1.5` |
| 4 | `ajv` | 6.12.6 | Moderate | [GHSA-2g4f-4pwh-qvx6](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6) | `eslint` | `eslint@^9.39.5` requires `ajv ^6.14.0` |
| 5 | `flatted` | 3.3.3 | High | [GHSA-25h7-pfq9-p65f](https://github.com/advisories/GHSA-25h7-pfq9-p65f), [GHSA-rf6f-7fwh-wjgh](https://github.com/advisories/GHSA-rf6f-7fwh-wjgh) | `eslint` → `file-entry-cache` → `flat-cache` | lockfile refresh → 3.4.4 |
| 6 | `minimatch` | 5.1.6 / 9.0.5 | High | as #1 | `mocha`, `glob` | `@vscode/test-cli@^0.0.15` → mocha 11 → 9.0.9 |
| 7 | `brace-expansion` | 1.1.12 / 2.0.2 | High | [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg), [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895), [GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp) | beneath every old `minimatch` | backports 1.1.18 / 2.1.4 reached via existing `^1.1.7` / `^2.0.2` ranges |
| 8 | `glob` | 10.5.0 / 8.1.0 / 7.2.3 | High | [GHSA-5j98-mcp5-4vw2](https://github.com/advisories/GHSA-5j98-mcp5-4vw2) | `test-cli`, `mocha`, `c8` | `test-cli@^0.0.15` → `glob ^13`, `c8 ^11` |
| 9 | `js-yaml` | 4.1.1 | High | [GHSA-mh29-5h37-fv8m](https://github.com/advisories/GHSA-mh29-5h37-fv8m), [GHSA-h67p-54hq-rp68](https://github.com/advisories/GHSA-h67p-54hq-rp68), [GHSA-52cp-r559-cp3m](https://github.com/advisories/GHSA-52cp-r559-cp3m), [GHSA-5p4m-2wfm-xmqj](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj) | `mocha`, `@eslint/eslintrc` | existing `^4.1.0` ranges reach patched 4.3.1 |
| 10 | `picomatch` | 2.3.1 | High | [GHSA-3v7f-55p6-f55p](https://github.com/advisories/GHSA-3v7f-55p6-f55p), [GHSA-c2c7-rcm5-vvqj](https://github.com/advisories/GHSA-c2c7-rcm5-vvqj) | `test-cli` → `chokidar@3.6.0` | `test-cli@^0.0.15` → `chokidar ^5` → dependency gone |
| 11 | `serialize-javascript` | 6.0.2 | High | [GHSA-5c6j-r48x-rmvq](https://github.com/advisories/GHSA-5c6j-r48x-rmvq), [GHSA-qj8w-gfj5-8c6v](https://github.com/advisories/GHSA-qj8w-gfj5-8c6v) | `mocha` | **`overrides` → `^7.1.0`** — see note B |
| 12 | `diff` | 5.2.0 → 7.0.0 | Low | [GHSA-73rr-hh4g-fpgx](https://github.com/advisories/GHSA-73rr-hh4g-fpgx) | `mocha` | **`overrides` → `^8.0.4`** — see note C |

### Note A — why `@isaacs/brace-expansion` vanishes

`minimatch@10.2.6` no longer depends on `@isaacs/brace-expansion` at all; it switched back to `brace-expansion@^5.0.8`. Bumping `minimatch` therefore resolves findings #1 and #2 in a single move — no override needed.

### Note B — `serialize-javascript` has no upstream fix

Even the current `mocha@11.8.0` declares `"serialize-javascript": "^6.0.2"`, and **6.0.2 is the final 6.x release**. That range can never resolve to a patched version, which is exactly why `npm audit` reports `fixAvailable: false` and why `npm audit fix` cannot help. The patch exists only in `7.1.0`.

**Reachability:** mocha `require`s this package in exactly one file — `lib/nodejs/buffered-worker-pool.js` — which is loaded only in `--parallel` mode. [`.vscode-test.mjs`](.vscode-test.mjs) sets only `files`, so parallel mode is never engaged. The advisory concerns *deserializing untrusted input*; mocha only round-trips its own worker payloads. Actual exploitability here is nil.

The override was applied anyway, so the alert list stays empty and a future genuine alert is not lost in the noise.

**Remove this override when** mocha relaxes its range to `^7`.

### Note C — `diff` is the same shape

The jsdiff advisory range is `6.0.0 - 8.0.2`, so upgrading to `mocha@11.8.0` (which requires `diff ^7.0.0`) moved the problem rather than solving it — 7.x is entirely within the vulnerable range. npm's suggested `npm audit fix --force` proposes *downgrading* `@vscode/test-cli` to `0.0.11`, which would drag back `mocha@10` and reintroduce six higher-severity findings. That cure is worse than the disease.

`8.0.4` sits just outside the advisory range and was chosen over `9.0.0` deliberately: it is the smallest semver distance from mocha's declared `^7.0.0`. Compatibility is well bounded — mocha calls exactly one jsdiff API across its entire codebase:

```
node_modules/mocha/lib/reporters/base.js:521:  var msg = diff.createPatch("string", actual, expected);
```

`createPatch` is stable across 7.x, 8.x and 9.x.

**Remove this override when** mocha moves to `diff ^9`.

---

## 3. Reachability of the Production Issue

This is the only finding with a real user-facing attack path, so it is worth tracing precisely.

[`extension.js:89`](extension.js#L89) passes user-controlled patterns straight into `minimatch`:

```js
if (minimatch(relativePath, pattern, { dot: true })) {
  return !isNegated;
}
```

The data path is:

1. [`readGitignorePatterns()`](extension.js#L110-L134) reads the opened workspace's `.gitignore` verbatim.
2. Each line is normalised by [`memoizedConvertPattern()`](extension.js#L47-L70) — which strips `!` and trailing `/` and prefixes `**/`, but performs **no validation or complexity bounding**.
3. [`shouldIgnore()`](extension.js#L82-L94) evaluates every pattern against every path, for every entry, recursively across the whole tree.

The three `minimatch` advisories are all ReDoS: catastrophic backtracking from nested `*()` extglobs, repeated wildcards, and multiple non-adjacent `**` segments.

**Threat model:** opening an untrusted repository in VS Code is an everyday action, and a malicious `.gitignore` is trivial to plant. Because the extension declares `onStartupFinished`, it activates automatically. The impact is a hung or memory-exhausted extension host — denial of service, not code execution. Severity is real but bounded; the fix in `10.2.6` bounds the pattern compiler.

No source changes were required to remediate it — the vulnerability is entirely inside the dependency. (`extension.js` was changed in this same release, but for the unrelated functional defects described in §4.)

---

## 4. Changes Applied

### `package.json`

```jsonc
"version": "0.1.2",                    // was 0.1.1

"dependencies": {
  "minimatch": "^10.2.6"               // was ^10.0.1
},

"devDependencies": {
  "@vscode/test-cli": "^0.0.15",       // was ^0.0.10
  "eslint": "^9.39.5"                  // was ^9.16.0
},

"overrides": {                          // new — see notes B and C
  "serialize-javascript": "^7.1.0",
  "diff": "^8.0.4"
}
```

Deliberately left unchanged:

- **`@types/node: "20.x"`** — this must track the Node runtime *VS Code embeds*, not the local toolchain. VS Code 1.96 ships Node 20.
- **`@vscode/test-electron: "^2.4.1"`** — not flagged, and the existing range already reaches 2.5.2 on reinstall.
- **`eslint` stayed on v9.** ESLint 10 was evaluated and rejected: it drops `@eslint/eslintrc`, which is the *only* source of the `globals` package that [`eslint.config.mjs`](eslint.config.mjs#L1) imports. Moving to v10 would silently break linting unless `globals` were added as an explicit devDependency. The v9.39.5 patch bump clears findings #3 and #4 with none of that risk.

### `eslint.config.mjs`

```js
{ ignores: [".vscode-test/**"] }
```

Not a security fix, but a prerequisite for verifying one. `.vscode-test/` holds full downloaded VS Code distributions — 958 JS files including multi-megabyte minified bundles. ESLint 9 flat config does **not** read `.gitignore`, so `eslint .` was walking all of it and never terminating. Since `pretest` runs `lint`, `npm test` could not complete either. Lint now finishes in ~2s.

### `extension.js` — two pre-existing `.gitignore` defects

Surfaced during manual verification of the minimatch upgrade. **Neither is caused by the dependency bump** — both reproduce identically on `minimatch@10.0.3` and `10.2.6`, confirmed by running the same pattern set against both versions.

**1. Root-anchored patterns never matched.** [`memoizedConvertPattern()`](extension.js#L47-L70) left the leading slash in place, so `/.next/` became the pattern `/.next`. Matching is done against `path.relative()` output, which is `.next` with no leading slash, so `minimatch(".next", "/.next")` was always `false`. Every root-anchored entry in a `.gitignore` was silently ignored. The slash is now stripped, anchoring the pattern to the root instead of prefixing `**/`.

**2. Multi-segment patterns never matched on Windows.** `path.relative()` returns `.yarn\patches`, while minimatch patterns use `/`. [`shouldIgnore()`](extension.js#L82-L94) now normalises the separator via `.split(path.sep).join("/")`.

The defects were partially masked by the hardcoded `IGNORED_PATTERNS` list — `node_modules`, `build`, `dist` and `.vscode` are excluded regardless of `.gitignore`, so only entries outside that list (`.next`, `out`, `coverage`) visibly leaked.

---

## 5. The Most Important Maintenance Lesson

Six of the twelve findings persisted across previous update attempts because of a single npm semver subtlety:

> **`^0.0.10` does not mean "any 0.0.x". It means _exactly_ `0.0.10`.**

Under semver, a caret on a `0.0.z` version allows no range at all. `@vscode/test-cli` was therefore frozen at `0.0.10` — dragging `mocha@10`, `glob@7/8/10`, `chokidar@3` and `c8@9` with it — and **no amount of `npm audit fix`, `npm update`, or Dependabot patch PRs could ever move it.** It had to be raised by hand.

Whenever `npm audit` reports `fixAvailable: false` on a direct dependency, check for a `^0.0.x` range before assuming the ecosystem has no fix.

---

## 6. Verification

### Before

```
12 vulnerabilities (1 low, 3 moderate, 8 high)
```

### After

```
$ npm audit
found 0 vulnerabilities

$ npm audit --omit=dev        # production only — what actually ships
found 0 vulnerabilities
```

### Resolved tree

```
$ npm ls minimatch --all
├─┬ @vscode/test-cli@0.0.15
│ ├─┬ c8@11.0.0 → test-exclude@8.0.0 → minimatch@10.2.6
│ ├─┬ glob@13.0.6 → minimatch@10.2.6
│ └─┬ mocha@11.8.0 → minimatch@9.0.9
├─┬ eslint@9.39.5 → minimatch@3.1.5
└── minimatch@10.2.6           ← the one that ships

$ npm ls serialize-javascript
└── serialize-javascript@7.1.0

$ npm ls diff
└── diff@8.0.4
```

No `minimatch@3.1.2`, `5.1.6` or `9.0.5` remains anywhere in the tree.

### How to re-verify from scratch

```bash
rm -rf node_modules package-lock.json
npm install          # clean regeneration is required — several fixes depend on
                     # transitive ranges re-resolving to backported patches
npm audit
npm audit --omit=dev
npm run lint
npm test
```

A clean regeneration matters: fixes #5, #7 and #9 come from *existing* caret ranges re-resolving to newly published backports. `npm update` alone will not reliably reach them.

---

## 7. Environment Requirements

`@vscode/test-cli@0.0.15` declares `engines: { "node": ">=22" }`, up from no constraint in `0.0.10`.

**The test suite can no longer be run on Node 20.** Development and any future CI must use Node 22 or later. This affects tooling only — the shipped extension still targets the Node 20 runtime embedded in VS Code 1.96, which is why `@types/node` remains pinned at `20.x`.

---

## 8. Known Issues and Follow-Ups

These are outside the scope of this security fix but were surfaced by it and are worth tracking.

1. **`npm test` fails when the project path contains spaces.** Under `@vscode/test-cli@0.0.15`, the extension host aborts with `Cannot find module 'd:\Apps\vs'` — the working directory `d:\Apps\vs code extensions\...` is truncated at the first space, indicating the runner does not quote the path it hands to the extension host. The verification run in a space-free directory is the reliable one. Workaround: run tests from a path without spaces, or clone to one.

2. **The test suite is a placeholder.** [`test/extension.test.js`](test/extension.test.js) contains only the scaffold assertion `assert.strictEqual(-1, [1,2,3].indexOf(5))`. It exercises none of the extension's logic, so a green test run is *not* evidence that `minimatch@10.2.6` preserved matching behaviour. Real coverage of [`shouldIgnore()`](extension.js#L82-L94) and [`memoizedConvertPattern()`](extension.js#L47-L70) would make future dependency bumps far safer to accept.

3. **No `.github/dependabot.yml`.** Dependabot currently only *raises alerts*; it does not open fix PRs. Adding a config would automate most of this work. Intentionally deferred — updates are handled manually.

5. **`.gitignore` negation precedence is still incorrect.** [`shouldIgnore()`](extension.js#L82-L94) returns on the *first* matching pattern, but gitignore semantics are *last match wins*. With `.yarn/*` followed by `!.yarn/patches`, the negation never takes effect because the broad pattern matches first. Fixing this properly means evaluating all patterns and keeping the last match, which changes output for any user relying on the current behaviour — deliberately left out of this release.

4. **Defence in depth for the ReDoS surface.** Upgrading `minimatch` fixes the known patterns, but the extension still feeds unvalidated third-party `.gitignore` content into a regex engine with no time or complexity budget. A future hardening pass could cap pattern length and count in [`memoizedConvertPattern()`](extension.js#L47-L70), which would blunt the *next* advisory in this class before it is published.

---

## Reporting a Vulnerability

Please report security issues via [GitHub Security Advisories](https://github.com/subucodes/vscode-ext-project-structure-extractor/security/advisories/new) or by opening an issue on the [repository](https://github.com/subucodes/vscode-ext-project-structure-extractor/issues).
