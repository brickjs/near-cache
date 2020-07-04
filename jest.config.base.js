module.exports = {
  preset: 'ts-jest',
  bail: 10,
  modulePathIgnorePatterns: ['<rootDir>/lib/'],
  testRegex: '((\\.|/)(test|spec))\\.[jt]sx?$',
  collectCoverage: true,
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html', 'cobertura'],
  collectCoverageFrom: ['**/*.{ts,tsx}', '!**/node_modules/**', '!**/__tests__/**'],
  reporters: ['default', 'jest-junit'],
};
