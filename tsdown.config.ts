import { defineConfig } from "tsdown";

export default defineConfig({ 
  entry: {
    index: "src/index.ts",
    "transformer/cssModuleTransformer": "src/transformer/cssModuleTransformer.ts",
  },
  format: ["esm", "cjs"],
  outDir: "dist",
  clean: true,
  dts: true,
  target: "es2020",
  minify: false, // Keep readable for a library
  sourcemap: true,
});