module.exports = {
  verbose: false,
  testMatch: ["<rootDir>/src/server/tests/**/*.test.js"],
  setupFilesAfterEnv: ["./jest.setup.js"],
  collectCoverage: true
}
