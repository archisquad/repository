export default {
  "src/**/*.{js,cjs,mjs,ts,tsx}": ["eslint --fix", "prettier --write"],
  "src/**/*.{ts,tsx}": () => "pnpm run type-check",
}
