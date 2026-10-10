// @ts-nocheck
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Shared ESLint flat config for NestJS microservices.
 * @param {string} tsconfigRootDir - Absolute path to the service package root.
 */
export function createNestEslintConfig(tsconfigRootDir) {
  return tseslint.config(
    {
      ignores: ["dist/**", "node_modules/**", "eslint.config.mjs", "coverage/**"],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
        },
        ecmaVersion: "latest",
        sourceType: "module",
        parserOptions: {
          project: "./tsconfig.json",
          tsconfigRootDir,
        },
      },
    },
    {
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-floating-promises": "warn",
        "@typescript-eslint/no-unsafe-argument": "warn",
        "@typescript-eslint/no-unsafe-assignment": "warn",
        "@typescript-eslint/no-unsafe-return": "warn",
        "@typescript-eslint/no-unsafe-member-access": "warn",
        "@typescript-eslint/no-unsafe-call": "warn",
        "@typescript-eslint/require-await": "warn",
        // Overridden to "error" in services using createNestStrictEslintConfig
        "@typescript-eslint/no-unused-vars": [
          "warn",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "no-console": "off",
      },
    },
  );
}

/** Stricter rules applied per-service (club, user, auth, …). */
export const nestStrictTypeScriptRules = {
  "@typescript-eslint/no-unsafe-assignment": "error",
  "@typescript-eslint/no-unsafe-return": "error",
  "@typescript-eslint/no-unsafe-member-access": "error",
  "@typescript-eslint/no-unsafe-call": "error",
  "@typescript-eslint/require-await": "error",
};

/**
 * Nest ESLint config with strict `no-unsafe-*` and `require-await`.
 * @param {string} tsconfigRootDir
 */
export function createNestStrictEslintConfig(tsconfigRootDir) {
  return tseslint.config(...createNestEslintConfig(tsconfigRootDir), {
    rules: nestStrictTypeScriptRules,
  });
}
