module.exports = {
  testMatch: ["<rootDir>/src/**/*.test.{js,mjs,ts}"],
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
  transform: {
    '^.+\\.marko$': '@marko/jest/transform/browser',
    '^.+\\.(js|jsx|mjs)$': 'babel-jest'
  },
  moduleNameMapper: {
    "\\.(css|less)$": "identity-obj-proxy"
  }
};
