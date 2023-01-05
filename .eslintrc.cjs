module.exports = {
  root: true,

  env: {
    browser: true,
    node: true
  },

  parser: "vue-eslint-parser",

  parserOptions: {
    parser: "@typescript-eslint/parser",
    sourceType: "module"
  },

  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended",
    "prettier"
  ],

  plugins: ["@typescript-eslint"],
  rules: {}
};
