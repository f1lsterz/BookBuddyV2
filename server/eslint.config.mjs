// @ts-check
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["eslint.config.mjs"],
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
        project: "./tsconfig.json", // Потрібно для правильного аналізу коду
        tsconfigRootDir: process.cwd(),
      },
    },
  },
  {
    plugins: ["@typescript-eslint", "prettier"],
    extends: [
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/recommended-requiring-type-checking",
      "plugin:prettier/recommended",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "no-console": "warn",
      "prettier/prettier": "error",
    },
  },
  {
    overrides: [
      {
        files: ["*.ts"],
        parser: "@typescript-eslint/parser",
        parserOptions: {
          project: "./tsconfig.json",
        },
      },
    ],
  }
);
