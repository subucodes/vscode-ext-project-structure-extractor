const vscode = require("vscode");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const { minimatch } = require("minimatch");

const MESSAGE_TIMEOUT = 2000; // 2 seconds

const FORMAT_SETTINGS = {
  tree: {
    indent: "│   ",
    defaultIndentLevel: 0,
    entryPrefix: (isLast) => (isLast ? "└──" : "├──"),
    wrapper: (content, rootName) => `\`\`\`\n${rootName}\n${content}\`\`\``,
    rootPrefix: "",
  },
  list: {
    indent: "  ",
    defaultIndentLevel: 1,
    entryPrefix: () => "- ",
    wrapper: (content, rootName) => `\n- ${rootName}\n${content}`,
    rootPrefix: "",
  },
};

// Cache management
const cache = {
  gitignorePatterns: new Map(),
  statsCache: new Map(),
  patternSet: new Set(),
};

const IGNORED_PATTERNS = [
  ".git",
  "node_modules",
  "venv",
  "__pycache__",
  ".vscode",
  ".idea",
  "dist",
  "build",
  ".env",
  ".DS_Store",
];

// Pattern conversion with memoization
const memoizedConvertPattern = (() => {
  const patternCache = new Map();

  return (pattern) => {
    if (patternCache.has(pattern)) return patternCache.get(pattern);

    pattern = pattern.trim();
    const isNegated = pattern.startsWith("!");
    const isDirOnly = pattern.endsWith("/");

    let processedPattern = isNegated ? pattern.slice(1) : pattern;
    processedPattern = isDirOnly
      ? processedPattern.slice(0, -1)
      : processedPattern;
    processedPattern =
      !processedPattern.startsWith("**/") && !processedPattern.startsWith("/")
        ? `**/${processedPattern}`
        : processedPattern;

    const result = { pattern: processedPattern, isNegated, isDirOnly };
    patternCache.set(pattern, result);
    return result;
  };
})();

// Optimized file/directory operations
async function getStats(entryPath) {
  if (cache.statsCache.has(entryPath)) {
    return cache.statsCache.get(entryPath);
  }
  const stats = await fs.stat(entryPath);
  cache.statsCache.set(entryPath, stats);
  return stats;
}

async function shouldIgnore(entryPath, rootPath, patterns) {
  const relativePath = path.relative(rootPath, entryPath);
  const stats = await getStats(entryPath);
  const isDirectory = stats.isDirectory();

  for (const { pattern, isNegated, isDirOnly } of patterns) {
    if (isDirOnly && !isDirectory) continue;
    if (minimatch(relativePath, pattern, { dot: true })) {
      return !isNegated;
    }
  }
  return false;
}

function sortEntriesLikeVSCode(entries) {
  return entries.sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) {
      return a.isDirectory() ? -1 : 1;
    }
    const aHidden = a.name.startsWith(".");
    const bHidden = b.name.startsWith(".");
    if (aHidden !== bHidden) {
      return aHidden ? 1 : -1;
    }
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
}

async function readGitignorePatterns(rootPath) {
  if (cache.gitignorePatterns.has(rootPath)) {
    return cache.gitignorePatterns.get(rootPath);
  }

  let patterns = [...IGNORED_PATTERNS];
  const gitignorePath = path.join(rootPath, ".gitignore");

  try {
    if (fsSync.existsSync(gitignorePath)) {
      const content = await fs.readFile(gitignorePath, "utf8");
      const gitignorePatterns = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"));
      patterns = [...patterns, ...gitignorePatterns];
    }
  } catch (error) {
    console.error("Error reading .gitignore:", error);
  }

  const processedPatterns = patterns.map(memoizedConvertPattern);
  cache.gitignorePatterns.set(rootPath, processedPatterns);
  return processedPatterns;
}

async function generateProjectStructure(rootPath, config) {
  // Get folder name from path
  const rootName = path.basename(rootPath);

  async function getFolderStructure(
    folderPath,
    indentLevel = FORMAT_SETTINGS[config.outputFormat].defaultIndentLevel,
    currentDepth = 0
  ) {
    // Check depth limit
    if (config.maxDepth !== -1 && currentDepth >= config.maxDepth) {
      return "";
    }

    try {
      const patterns = await readGitignorePatterns(rootPath);
      const entries = await fs.readdir(folderPath, { withFileTypes: true });

      const filteredEntries = await Promise.all(
        entries.map(async (entry) => {
          if (config.excludeFiles && !entry.isDirectory()) {
            return null;
          }
          if (!config.useGitIgnore) {
            return entry;
          }
          const entryPath = path.join(folderPath, entry.name);
          const ignored = await shouldIgnore(entryPath, rootPath, patterns);
          return ignored ? null : entry;
        })
      );

      const validEntries = sortEntriesLikeVSCode(
        filteredEntries.filter(Boolean)
      );
      let structure = "";
      const formatSettings = FORMAT_SETTINGS[config.outputFormat];
      const indent = formatSettings.indent.repeat(indentLevel);

      for (let i = 0; i < validEntries.length; i++) {
        const entry = validEntries[i];
        const isLast = i === validEntries.length - 1;
        const prefix = formatSettings.entryPrefix(isLast);

        structure += `${indent}${prefix}${entry.name}\n`;

        if (entry.isDirectory()) {
          structure += await getFolderStructure(
            path.join(folderPath, entry.name),
            indentLevel + 1,
            currentDepth + 1
          );
        }
      }
      return structure;
    } catch (error) {
      console.error(`Error reading directory: ${error.message}`);
      return "";
    }
  }

  const structure = await getFolderStructure(
    rootPath,
    FORMAT_SETTINGS[config.outputFormat].defaultIndentLevel,
    0
  );
  const formatSettings = FORMAT_SETTINGS[config.outputFormat];
  return formatSettings.wrapper(
    formatSettings.rootPrefix + structure,
    rootName
  );
}

async function copyToClipboard(startTime, content) {
  try {
    await vscode.env.clipboard.writeText(content);
    const endTime = performance.now();
    const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
    // Show temporary message
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Extract project structure`,
        cancellable: false,
      },
      async (progress) => {
        const steps = [
          { increment: 0, message: "🚀 Starting...", delay: 200 },
          { increment: 25, message: "🔍 Analyzing structure...", delay: 300 },
          { increment: 50, message: "⚡ Preparing content...", delay: 300 },
          { increment: 75, message: "📋 Copying to clipboard...", delay: 200 },
          {
            increment: 85,
            message: `✅ Completed in ${elapsedSeconds} seconds!`,
            delay: 100,
          },
        ];

        // Process each step
        for (const step of steps) {
          progress.report({
            increment: step.increment,
            message: step.message,
          });
          await new Promise((resolve) => setTimeout(resolve, step.delay));
        }

        progress.report({
          increment: 100,
          message: `✨ Copied to clipboard📎`,
        });
        return new Promise((resolve) => setTimeout(resolve, MESSAGE_TIMEOUT));
      }
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to copy to clipboard: ${error.message}`
    );
  }
}

// Add configuration helper function
function getConfiguration() {
  const config = vscode.workspace.getConfiguration("projectStructureExporter");
  return {
    useGitIgnore: config.get("useGitIgnore", false),
    outputFormat: config.get("outputFormat", "tree"),
    maxDepth: config.get("maxDepth", -1),
    excludeFiles: config.get("excludeFiles", true),
  };
}

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "extension.extractProjectStructure",
    async () => {
      try {
        const config = getConfiguration();
        const startTime = performance.now();

        cache.gitignorePatterns.clear();
        cache.statsCache.clear();
        cache.patternSet.clear();

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders?.length) {
          vscode.window.showWarningMessage("No workspace folder is open!");
          return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        const projectStructure = await generateProjectStructure(
          rootPath,
          config
        );

        await copyToClipboard(startTime, projectStructure);
      } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };
