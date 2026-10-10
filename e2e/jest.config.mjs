/** @type {import('jest').Config} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.e2e-spec.ts"],
  globalSetup: "<rootDir>/src/global-setup.ts",
  testTimeout: 60_000,
};
