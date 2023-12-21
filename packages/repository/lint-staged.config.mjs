export default {
  "src/**/*.{js,cjs,mjs,ts,tsx}": ["biome check --apply-unsafe"],
  "src/**/*.{ts,tsx}": () => "pnpm run type-check",
}
