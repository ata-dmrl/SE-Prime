const { defineConfig } = require("cypress");

module.exports = defineConfig({
  video: true,
  e2e: {
    baseUrl: "http://localhost:8080",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: false,
    viewportWidth: 390,
    viewportHeight: 844,
    defaultCommandTimeout: 4000,
  },
});
