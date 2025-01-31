module.exports = {
  testEnvironment: "jsdom",  // Garante que o Jest use jsdom
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],  // Arquivo de configuração
  transform: {
      "^.+\\.jsx?$": "babel-jest",  // Transforma JS/JSX com Babel
  },
  testPathIgnorePatterns: ["/node_modules/", "src/App.test.js"],
  transformIgnorePatterns: ["/node_modules/", "src/App.test.js"],  // Ignora node_modules
  moduleFileExtensions: ["js", "jsx", "json", "node"],
};
