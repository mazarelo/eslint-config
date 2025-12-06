/**
 * Integration tests for ESLint React + TypeScript configuration
 *
 * Tests lint actual fixture files to verify the configuration
 * correctly identifies valid and invalid code patterns.
 *
 * Folder Structure:
 *   tests/fixtures/
 *   ├── typescript/          # TypeScript-specific rules
 *   │   ├── valid/
 *   │   └── invalid/
 *   ├── react/               # React component rules
 *   │   ├── valid/
 *   │   └── invalid/
 *   ├── react-hooks/         # React hooks rules
 *   │   ├── valid/
 *   │   └── invalid/
 *   ├── accessibility/       # jsx-a11y rules
 *   │   ├── valid/
 *   │   └── invalid/
 *   └── best-practices/      # General JS/TS best practices
 *       ├── valid/
 *       └── invalid/
 *
 * To add a new test:
 *   1. Create a file in the appropriate category/valid or category/invalid folder
 *   2. For invalid fixtures, add `// @errors: rule-id-1, rule-id-2` as the first line
 *   3. Run tests - they will be automatically discovered
 */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { describe, it, before } from "node:test";
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, "fixtures");

/** Rule categories that map to fixture folders */
const CATEGORIES = [
  "typescript",
  "react",
  "react-hooks",
  "accessibility",
  "best-practices",
] as const;

type Category = (typeof CATEGORIES)[number];

let eslint: ESLint;

before(() => {
  eslint = new ESLint({
    overrideConfigFile: path.resolve(__dirname, "../eslint.config.js"),
  });
});

/**
 * Parse expected errors from a fixture file's first comment line
 * Format: // @errors: rule-id-1, rule-id-2
 */
function parseExpectedErrors(filePath: string): string[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const firstLine = content.split("\n")[0];
  const match = /\/\/\s*@errors:\s*(.+)/.exec(firstLine);
  if (!match) {
    return [];
  }
  return match[1].split(",").map((s) => s.trim());
}

/**
 * Lint a fixture file and return errors
 */
async function lintFixture(filePath: string) {
  const results = await eslint.lintFiles([filePath]);
  return {
    errors: results[0].messages.filter((m) => m.severity === 2),
    warnings: results[0].messages.filter((m) => m.severity === 1),
    all: results[0].messages,
  };
}

/**
 * Get all files in a directory, returns empty array if directory doesn't exist
 */
function getFilesInDir(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  return fs.readdirSync(dirPath).filter((file) => {
    const fullPath = path.join(dirPath, file);
    return fs.statSync(fullPath).isFile();
  });
}

/**
 * Format category name for display
 */
function formatCategoryName(category: Category): string {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// =============================================================================
// Dynamic Test Generation by Category
// =============================================================================
for (const category of CATEGORIES) {
  const categoryDir = path.join(FIXTURES_DIR, category);
  const categoryName = formatCategoryName(category);

  describe(categoryName, () => {
    // Valid fixtures - should pass without errors
    describe("Valid", () => {
      const validDir = path.join(categoryDir, "valid");
      const validFiles = getFilesInDir(validDir);

      if (validFiles.length === 0) {
        it.skip("no valid fixtures", () => {});
      } else {
        for (const file of validFiles) {
          it(`${file} should pass without errors`, async () => {
            const filePath = path.join(validDir, file);
            const { errors } = await lintFixture(filePath);
            assert.strictEqual(
              errors.length,
              0,
              `Expected no errors, but got:\n${errors.map((e) => `  - ${e.ruleId}: ${e.message} (line ${String(e.line)})`).join("\n")}`,
            );
          });
        }
      }
    });

    // Invalid fixtures - should trigger expected errors
    describe("Invalid", () => {
      const invalidDir = path.join(categoryDir, "invalid");
      const invalidFiles = getFilesInDir(invalidDir);

      if (invalidFiles.length === 0) {
        it.skip("no invalid fixtures", () => {});
      } else {
        for (const file of invalidFiles) {
          it(`${file} should trigger expected errors`, async () => {
            const filePath = path.join(invalidDir, file);
            const expectedErrors = parseExpectedErrors(filePath);

            assert.ok(
              expectedErrors.length > 0,
              `Invalid fixture "${file}" must have @errors comment`,
            );

            const { errors } = await lintFixture(filePath);
            const errorRuleIds = errors.map((e) => e.ruleId);

            for (const expected of expectedErrors) {
              assert.ok(
                errorRuleIds.includes(expected),
                `Expected error "${expected}" in "${file}", but got: [${errorRuleIds.join(", ")}]`,
              );
            }
          });
        }
      }
    });
  });
}
