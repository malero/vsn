import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    target: "es2022"
  },
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    minify: true,
    sourcemap: true,
    outExtension: () => ({ js: ".min.js" }),
    target: "es2022"
  }
]);
