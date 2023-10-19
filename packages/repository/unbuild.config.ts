import { defineBuildConfig } from "unbuild"

export default defineBuildConfig({
  entries: [
    {
      input: "src/index.ts",
      builder: "rollup",
    },
  ],
  clean: true,
  declaration: true,
  outDir: "dist",
})
