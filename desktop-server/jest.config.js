module.exports = {
  verbose: false,
  transform: {
    "^.+\\.ts?$": "ts-jest"
  },
  testMatch: ["<rootDir>/src/server/tests/**/*.test.js", "<rootDir>/src/server/tests/**/*.test.ts"]
}
