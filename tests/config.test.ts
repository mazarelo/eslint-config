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
 *   2. For invalid fixtures, add annotations at the top of the file:
 *      - `// @errors: rule-id-1, rule-id-2` for rules configured as "error"
 *      - `// @warnings: rule-id-1, rule-id-2` for rules configured as "warn"
 *      - Both can be used together on separate lines
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

interface ExpectedViolations {
  errors: string[];
  warnings: string[];
}

/**
 * Parse expected errors and warnings from a fixture file's first comment lines
 * Format: // @errors: rule-id-1, rule-id-2
 *         // @warnings: rule-id-3, rule-id-4
 */
function parseExpectedViolations(filePath: string): ExpectedViolations {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const result: ExpectedViolations = { errors: [], warnings: [] };

  for (const line of lines) {
    const errorMatch = /\/\/\s*@errors:\s*(.+)/.exec(line);
    if (errorMatch) {
      result.errors = errorMatch[1].split(",").map((s) => s.trim());
    }

    const warningMatch = /\/\/\s*@warnings:\s*(.+)/.exec(line);
    if (warningMatch) {
      result.warnings = warningMatch[1].split(",").map((s) => s.trim());
    }

    // Stop parsing after we've passed the comment block
    if (!line.startsWith("//") && line.trim() !== "") {
      break;
    }
  }

  return result;
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

    // Invalid fixtures - should trigger expected errors/warnings
    describe("Invalid", () => {
      const invalidDir = path.join(categoryDir, "invalid");
      const invalidFiles = getFilesInDir(invalidDir);

      if (invalidFiles.length === 0) {
        it.skip("no invalid fixtures", () => {});
      } else {
        for (const file of invalidFiles) {
          it(`${file} should trigger expected violations`, async () => {
            const filePath = path.join(invalidDir, file);
            const expected = parseExpectedViolations(filePath);

            assert.ok(
              expected.errors.length > 0 || expected.warnings.length > 0,
              `Invalid fixture "${file}" must have @errors or @warnings comment`,
            );

            const { errors, warnings } = await lintFixture(filePath);
            const errorRuleIds = errors.map((e) => e.ruleId);
            const warningRuleIds = warnings.map((w) => w.ruleId);

            for (const expectedError of expected.errors) {
              assert.ok(
                errorRuleIds.includes(expectedError),
                `Expected error "${expectedError}" in "${file}", but got: [${errorRuleIds.join(", ")}]`,
              );
            }

            for (const expectedWarning of expected.warnings) {
              assert.ok(
                warningRuleIds.includes(expectedWarning),
                `Expected warning "${expectedWarning}" in "${file}", but got: [${warningRuleIds.join(", ")}]`,
              );
            }
          });
        }
      }
    });
  });
}
