// jest.config.js
module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/.env'],
    coveragePathIgnorePatterns: ['/node_modules/'],
    testTimeout: 10000, // Increase timeout for async tests
};
