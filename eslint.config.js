import path from "node:path";

import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import unicornPlugin from "eslint-plugin-unicorn";
import pathsPlugin from "eslint-plugin-paths";
import globals from "globals";

/**
 * Creates an ESLint configuration for React + TypeScript projects.
 * @param {Object} options - Configuration options
 * @param {string} options.tsconfigPath - Path to tsconfig.json (default: "./tsconfig.json")
 * @param {string[]} options.ignores - Additional patterns to ignore
 * @returns {import('typescript-eslint').ConfigWithExtends[]} ESLint flat config array
 */
export function createConfig(options = {}) {
  const {
    tsconfigPath = "./tsconfig.json",
    ignores = [],
  } = options;

  const project = path.resolve(process.cwd(), tsconfigPath);

  return tseslint.config(
    // Global ignores
    {
      ignores: [
        "**/.*.js",
        "**/node_modules/**",
        "**/@generated/**",
        "**/dist/**",
        "**/build/**",
        "**/coverage/**",
        "postcss.config.js",
        "**/*.md",
        ...ignores,
      ],
    },

    // Base TypeScript configuration
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,

    // All TypeScript files
    {
      files: ["**/*.ts", "**/*.tsx"],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          project,
          ecmaFeatures: { jsx: true },
          ecmaVersion: "latest",
          sourceType: "module",
        },
        globals: {
          ...globals.node,
          ...globals.browser,
        },
      },
      plugins: {
        react: reactPlugin,
        "react-hooks": reactHooksPlugin,
        "jsx-a11y": jsxA11yPlugin,
        import: importPlugin,
        unicorn: unicornPlugin,
        paths: pathsPlugin,
      },
      settings: {
        react: { version: "detect" },
        "import/resolver": {
          typescript: { project },
        },
      },
      rules: {
        // ──────────────────────────────────────────────────────────────────────
        // TypeScript - Strict & Safe
        // ──────────────────────────────────────────────────────────────────────
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-unused-vars": [
          "warn",
          {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_",
          },
        ],
        "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
        "@typescript-eslint/consistent-type-imports": [
          "error",
          {
            prefer: "type-imports",
            fixStyle: "inline-type-imports",
            disallowTypeAnnotations: true,
          },
        ],
        "@typescript-eslint/no-import-type-side-effects": "error",
        "@typescript-eslint/prefer-nullish-coalescing": "warn",
        "@typescript-eslint/prefer-optional-chain": "warn",
        "@typescript-eslint/no-unnecessary-condition": "warn",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-misused-promises": [
          "error",
          { checksVoidReturn: { attributes: false } },
        ],
        "@typescript-eslint/return-await": ["error", "in-try-catch"],
        "@typescript-eslint/no-shadow": "error",
        "@typescript-eslint/no-unused-expressions": [
          "error",
          { allowTernary: true },
        ],
        "@typescript-eslint/no-array-delete": "error",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/strict-boolean-expressions": [
          "warn",
          {
            allowString: true,
            allowNumber: false,
            allowNullableObject: true,
            allowNullableBoolean: false,
            allowNullableString: true,
          },
        ],

        // ──────────────────────────────────────────────────────────────────────
        // Import organization
        // ──────────────────────────────────────────────────────────────────────
        "import/order": [
          "error",
          {
            groups: [
              "builtin",
              "external",
              "internal",
              ["parent", "sibling"],
              "index",
              "type",
            ],
            pathGroups: [
              { pattern: "react", group: "external", position: "before" },
              { pattern: "@/**", group: "internal", position: "before" },
            ],
            pathGroupsExcludedImportTypes: ["react", "type"],
            "newlines-between": "always",
            alphabetize: { order: "asc", caseInsensitive: true },
          },
        ],
        "import/no-duplicates": ["error", { "prefer-inline": true }],
        "import/newline-after-import": ["error", { count: 1 }],
        "import/no-cycle": "warn",
        "import/no-self-import": "error",
        "import/no-useless-path-segments": "error",

        // ──────────────────────────────────────────────────────────────────────
        // Path aliases - enforce usage of tsconfig paths
        // ──────────────────────────────────────────────────────────────────────
        "paths/alias": "error",

        // ──────────────────────────────────────────────────────────────────────
        // Unicorn - Modern JS practices
        // ──────────────────────────────────────────────────────────────────────
        "unicorn/prevent-abbreviations": [
          "warn",
          {
            allowList: {
              props: true,
              Props: true,
              params: true,
              Params: true,
              ref: true,
              Ref: true,
              args: true,
              env: true,
              fn: true,
            },
          },
        ],
        "unicorn/no-anonymous-default-export": "error",
        "unicorn/prefer-node-protocol": "error",
        "unicorn/prefer-string-replace-all": "warn",
        "unicorn/prefer-array-find": "warn",
        "unicorn/prefer-array-flat-map": "warn",
        "unicorn/prefer-includes": "warn",
        "unicorn/no-array-reduce": "warn",
        "unicorn/no-for-loop": "warn",

        // ──────────────────────────────────────────────────────────────────────
        // General best practices
        // ──────────────────────────────────────────────────────────────────────
        "no-console": ["warn", { allow: ["warn", "error", "info"] }],
        "no-debugger": "warn",
        "no-param-reassign": ["error", { props: true }],
        "prefer-arrow-callback": ["error", { allowNamedFunctions: false }],
        "prefer-const": "error",
        "no-var": "error",
        eqeqeq: ["error", "always", { null: "ignore" }],
        curly: ["error", "all"],
        "no-nested-ternary": "warn",
        "no-unneeded-ternary": "error",
        "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
        "eol-last": ["error", "always"],
      },
    },

    // ────────────────────────────────────────────────────────────────────────────
    // React/TSX specific rules
    // ────────────────────────────────────────────────────────────────────────────
    {
      files: ["**/*.tsx"],
      rules: {
        // Naming conventions
        "@typescript-eslint/naming-convention": [
          "error",
          {
            selector: "variable",
            format: ["camelCase", "UPPER_CASE", "PascalCase"],
          },
          {
            selector: "variable",
            types: ["boolean"],
            format: ["PascalCase"],
            prefix: ["is", "has", "should", "can", "did", "will", "show", "hide"],
          },
          {
            selector: "function",
            format: ["camelCase", "PascalCase"],
          },
          {
            selector: "typeLike",
            format: ["PascalCase"],
          },
        ],
        "react/jsx-handler-names": [
          "warn",
          {
            eventHandlerPrefix: "handle",
            eventHandlerPropPrefix: "on",
            checkLocalVariables: true,
            checkInlineFunction: true,
          },
        ],
        "react/jsx-pascal-case": "error",

        // Component structure
        "max-lines-per-function": [
          "warn",
          { max: 250, skipBlankLines: true, skipComments: true },
        ],
        complexity: ["warn", 15],
        "react/function-component-definition": [
          "error",
          { namedComponents: "arrow-function" },
        ],
        "react/jsx-fragments": ["warn", "syntax"],
        "react/jsx-max-depth": ["warn", { max: 5 }],
        "react/require-default-props": "off",
        "react/destructuring-assignment": ["warn", "always"],

        // React best practices
        ...reactPlugin.configs.recommended.rules,
        ...reactHooksPlugin.configs.recommended.rules,
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        "react/no-unused-state": "warn",
        "react/no-unused-prop-types": "warn",
        "react/no-direct-mutation-state": "error",
        "react/no-array-index-key": "warn",
        "react/no-danger": "error",
        "react/no-unstable-nested-components": ["error", { allowAsProps: true }],
        "react/hook-use-state": "warn",
        "react/jsx-no-leaked-render": [
          "error",
          { validStrategies: ["ternary", "coerce"] },
        ],
        "react/jsx-key": ["error", { checkFragmentShorthand: true }],
        "react/self-closing-comp": "error",
        "react/jsx-curly-brace-presence": [
          "error",
          { props: "never", children: "never" },
        ],
        "react/jsx-boolean-value": ["error", "never"],
        "react/jsx-sort-props": [
          "warn",
          {
            callbacksLast: true,
            shorthandFirst: true,
            ignoreCase: true,
            reservedFirst: ["key", "ref"],
          },
        ],

        // Spreading - relaxed for component libraries
        "react/jsx-props-no-spreading": [
          "warn",
          {
            html: "enforce",
            custom: "ignore",
            explicitSpread: "ignore",
          },
        ],

        // JSX formatting
        "react/jsx-wrap-multilines": [
          "error",
          {
            declaration: "parens-new-line",
            assignment: "parens-new-line",
            return: "parens-new-line",
            arrow: "parens-new-line",
            condition: "parens-new-line",
            logical: "parens-new-line",
            prop: "parens-new-line",
          },
        ],
        "react/jsx-first-prop-new-line": ["error", "multiline"],
        "react/jsx-closing-bracket-location": ["error", "line-aligned"],
        "react/jsx-closing-tag-location": "error",
        "react/jsx-one-expression-per-line": ["error", { allow: "single-child" }],
        "react/jsx-indent-props": ["error", 2],

        // Accessibility
        ...jsxA11yPlugin.configs.recommended.rules,
        "jsx-a11y/alt-text": "error",
        "jsx-a11y/anchor-has-content": "error",
        "jsx-a11y/anchor-is-valid": "error",
        "jsx-a11y/click-events-have-key-events": "error",
        "jsx-a11y/interactive-supports-focus": "error",
        "jsx-a11y/no-noninteractive-element-interactions": "error",
        "jsx-a11y/no-autofocus": "warn",
        "jsx-a11y/media-has-caption": "warn",
      },
    },

    // ────────────────────────────────────────────────────────────────────────────
    // Declaration files - relaxed rules
    // ────────────────────────────────────────────────────────────────────────────
    {
      files: ["**/*.d.ts"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/consistent-type-imports": "off",
        "import/no-duplicates": "off",
      },
    },

    // ────────────────────────────────────────────────────────────────────────────
    // Test files - relaxed rules
    // ────────────────────────────────────────────────────────────────────────────
    {
      files: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/__tests__/**",
        "**/__mocks__/**",
      ],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/unbound-method": "off",
        "max-lines-per-function": "off",
        "react/jsx-props-no-spreading": "off",
        "no-console": "off",
      },
    },

    // ────────────────────────────────────────────────────────────────────────────
    // Config files - CommonJS support
    // ────────────────────────────────────────────────────────────────────────────
    {
      files: ["*.config.js", "*.config.ts", "*.config.mjs"],
      rules: {
        "import/no-default-export": "off",
        "@typescript-eslint/no-require-imports": "off",
      },
    }
  );
}

// Default export for simple usage
export default createConfig();
