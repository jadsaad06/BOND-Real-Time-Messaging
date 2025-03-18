export default {
    transform: {
      "^.+\\.(js|jsx)$": "babel-jest",
    },
    moduleNameMapper: {
      "^axios$": require.resolve("axios"),
      "^react-router-dom$": "<rootDir>/node_modules/react-router-dom",
    },
    transformIgnorePatterns: ["/node_modules/(?!axios)"],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  };
  