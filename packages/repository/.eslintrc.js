module.exports = {
  extends: ["archisquad"],

  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  },

  overrides: [
    {
      files: ["*.eslintrc.js", "commitlint.config.js", "release.config.js"],
      extends: ["archisquad/node"],
      rules: {
        "n/no-unpublished-require": "off",
      },
    },
    {
      files: ["**/*.test.ts"],
      rules: {
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/no-unsafe-call": "warn",
      },
    },
  ],
}
