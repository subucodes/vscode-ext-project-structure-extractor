# Change Log

All notable changes to the "Project Structure Extractor" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2026-08-14

### Security

- Upgraded `minimatch` to `^10.2.6`, resolving three ReDoS advisories ([GHSA-3ppc-4f35-3m26](https://github.com/advisories/GHSA-3ppc-4f35-3m26), [GHSA-7r86-cg39-jmmj](https://github.com/advisories/GHSA-7r86-cg39-jmmj), [GHSA-23c5-xmqv-rm74](https://github.com/advisories/GHSA-23c5-xmqv-rm74)). This is the only dependency that ships to users, and it is reachable from `.gitignore` pattern matching.
- Cleared all 12 reported vulnerabilities (8 high, 3 moderate, 1 low) — `npm audit` now reports 0. Development tooling was updated alongside: `@vscode/test-cli` to `^0.0.15` and `eslint` to `^9.39.5`, with `overrides` pinning `serialize-javascript` and `diff` to patched releases that upstream ranges could not reach.
- See [SECURITY.md](SECURITY.md) for the full analysis.

### Fixed

- `.gitignore` entries anchored to the workspace root (for example `/.next/`, `/out/`, `/coverage`) were silently ignored, so those folders still appeared in the extracted structure.
- `.gitignore` patterns spanning multiple path segments (for example `.yarn/*`, `app/blog`) never matched on Windows because path separators were not normalised.

## [0.1.1] - 2025-09-20

### Fixed

- Upgraded the packages to fix "brace-expansion Regular Expression Denial of Service vulnerability"

## [0.1.0] - 2023-01-04

### Added

- Added a new configuration option `projectStructureExporter.showSize` to show file sizes in the project structure.
- Added a new configuration option `projectStructureExporter.selectAndExtractButton` to enable a status bar button to extract the structure instead using command to extract the structure.
- Status bar button "✨ Extract Structure" to select a folder and extract its structure to the clipboard.

## [0.0.3] - 2024-12-29

### Added

- [Option to ignore files](https://github.com/subucodes/vscode-ext-project-structure-extractor/issues/2) : New setting `projectStructureExporter.excludeFiles` to show only folder structure by ignoring the files

### Fixed

- [Clipboard error for Linux Open Suse](https://github.com/subucodes/vscode-ext-project-structure-extractor/issues/1)

## [0.0.2] - 2024-12-28

### Added

- Changed default scanning depth from 2 to unlimited (maxDepth: -1)

## [0.0.1] - 2024-12-28

### Added

- Initial release of Project Structure Extractor
- Tree view format for project structure
- List view format (Markdown-compatible)
- Integration with .gitignore for file filtering
- Configurable depth scanning with `maxDepth` setting
- VS Code-style file and folder sorting
- Progress indicators during extraction
- Clipboard support for extracted structure
- Settings for customizing:
  - Output format (tree/list)
  - gitignore integration
  - Maximum folder depth

### Changed

- First public release, no changes yet

### Fixed

- No fixes yet, this is the initial release

[0.0.1]: https://github.com/subucodes/vscode-ext-project-structure-extractor/releases/tag/v0.0.1
[0.0.2]: https://github.com/subucodes/vscode-ext-project-structure-extractor/releases/tag/v0.0.2
[0.0.3]: https://github.com/subucodes/vscode-ext-project-structure-extractor/releases/tag/v0.0.3
[0.1.0]: https://github.com/subucodes/vscode-ext-project-structure-extractor/releases/tag/v0.1.0
[0.1.1]: https://github.com/subucodes/vscode-ext-project-structure-extractor/releases/tag/v0.1.1
[0.1.2]: https://github.com/subucodes/vscode-ext-project-structure-extractor/releases/tag/v0.1.2
