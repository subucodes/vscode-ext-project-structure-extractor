# Project Structure Extractor

A Visual Studio Code extension that helps you extract and copy your project's folder structure in either tree or list format.

## Features
- 📋 Copy project structure to clipboard
- 🌲 Multiple output formats:
  - Tree view (similar to `tree` command)
  - List view (Markdown-compatible list)
- 🎯 .gitignore support
- 📁 Option to exclude files (folders only)
- 🔍 Configurable depth scanning
- ⚡ Smart file sorting (VS Code explorer style)
- 🚀 Progress indicators

## Usage

1. Open a project in VS Code
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
3. Type "Extract Project Structure" and press Enter
4. The structure will be copied to your clipboard

Example output (Tree format):
```
backend
├──orm_model
│   └──models.py
├──response_models
│   └──response_models.py
├──router_helper
│   └──login_helper.py
├──routers
│   └──login.py
├──utils
│   ├──authentication.py
│   ├──authorization.py
│   ├──exception_handlers.py
│   └──query_profiler.py
├──validation_models
│   └──models.py
├──app.py
├──README.md
├──requirements.txt
└──.gitignore
```

Example output (List format):
- backend
  - orm_model
    - models.py
  - response_models
    - response_models.py
  - router_helper
    - login_helper.py
  - routers
    - login.py
  - utils
    - authentication.py
    - authorization.py
    - exception_handlers.py
    - query_profiler.py
  - validation_models
    - models.py
  - app.py
  - README.md
  - requirements.txt
  - .gitignore


## Extension Settings

This extension contributes the following settings:

* `projectStructureExporter.excludeFiles`: Enable/disable file listing in output (default: `false`)
* `projectStructureExporter.useGitIgnore`: Enable/disable .gitignore filtering (default: `true`)
* `projectStructureExporter.outputFormat`: Choose format - "tree" or "list" (default: `"tree"`)
* `projectStructureExporter.maxDepth`: Maximum folder depth (-1 for unlimited) (default: `-1`)


## Requirements

- Visual Studio Code v1.96.0 or higher
- Node.js & npm

## Installation

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search "Project Structure Extractor"
4. Click Install

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

## License

This extension is licensed under the MIT License.

**Enjoy!**