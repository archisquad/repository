export default {
  "src/**/*.{js,cjs,mjs,ts,tsx}": ["biome check --apply-unsafe"],
  "**/*.md": () => "pnpm run lint:dev",
}
