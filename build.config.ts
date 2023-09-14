import { defineBuildConfig } from "unbuild"

export default defineBuildConfig({
  declaration: true,
  failOnWarn: false,
  clean: true,
  rollup: {
    emitCJS: true,
  },
  entries: [
    "./src/middleware",
    {
      builder: "mkdist",
      input: "./src/views",
      outDir: "./dist/views",
    },
    {
      builder: "mkdist",
      input: "./src/assets",
      outDir: "./dist/assets",
      declaration: false
    },
  ],
})
