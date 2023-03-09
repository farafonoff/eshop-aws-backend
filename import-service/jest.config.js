/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@functions/(.*)$": ["<rootDir>/src/functions/$1"],
    "^@libs/(.*)$": ["<rootDir>/src/libs/$1"],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!strip-bom-stream|first-chunk-stream|strip-bom-buf)",
  ],
};
