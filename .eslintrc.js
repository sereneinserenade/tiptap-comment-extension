/**
 * Took this config from https://github.com/theajack/vite-vue3-ts-eslint
 */

/* eslint-disable */

module.exports = {
  // 'parser': '@typescript-eslint/parser',
  // "parser": "vue-eslint-parser",

  extends: ["plugin:vue/vue3-recommended", "@vue/typescript/recommended"],
  plugins: ["@typescript-eslint"],
  env: {
    node: true,
  },
  rules: {
    "vue/multi-word-component-names": "off",
    "no-var": "error",
    "vue/no-unused-vars": "error",
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    "@typescript-eslint/no-unused-vars": "error",
    "no-extend-native": 0,
    "no-new": 0,
    "no-useless-escape": 0,
    "no-useless-constructor": 0,
    "no-trailing-spaces": ["error", { skipBlankLines: true }],
    "indent": "off",
    "@typescript-eslint/indent": [
      "error",
      2,
      {
        SwitchCase: 1,
      },
    ],
    "space-infix-ops": ["error", { int32Hint: false }],
    "space-before-function-paren": [
      "error",
      {
        anonymous: "always",
        named: "always",
        asyncArrow: "always",
      },
    ],
    semi: ["error", "never"],
    "comma-dangle": 0,
    "no-console": 0,
    "no-debugger": 0,
    "id-length": 0,
    "eol-last": 0,
    "object-curly-spacing": ["error", "always"],
    "array-bracket-spacing": ["error", "always"],
    "arrow-spacing": "error",
    "no-multiple-empty-lines": "error",
    "no-unused-vars": "error",
    "spaced-comment": "error",
    quotes: ["error", "single", { allowTemplateLiterals: true }],
    "no-unreachable": "error",
    "keyword-spacing": "error",
    "space-before-blocks": "error",
    "semi-spacing": "error",
    "comma-spacing": "error",
    "key-spacing": "error",
    "prefer-const": [
      "error",
      {
        destructuring: "any",
        ignoreReadBeforeAssign: false,
      },
    ],
    "space-infix-ops": 2,
    "no-irregular-whitespace": 2,
    "no-trailing-spaces": 2,
    "vue/require-default-prop": "off",
    "@typescript-eslint/no-explicit-any": "off"
  },
};
