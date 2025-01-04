# Change Log

All notable changes to the "Project Structure Extractor" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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