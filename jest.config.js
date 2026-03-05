/** @type {import('jest').Config} */
const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

const config = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js", "**/__tests__/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
};

module.exports = createJestConfig(config);
