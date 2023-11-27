module.exports = {
  extends: ["archisquad"],

  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
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
    {
      files: ["**/*.test-d.ts"],
      rules: {
        "unicorn/filename-case": "off",
      },
    },
    {
      files: ["src/entity/interface/*.ts"],
      rules: {
        "@typescript-eslint/ban-types": "off",
      },
    },
  ],
}
