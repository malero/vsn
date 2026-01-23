import { readFileSync } from "node:fs";
import { defineConfig } from "tsup";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const version = JSON.stringify(pkg.version ?? "0.1.0");

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    target: "es2022",
    define: {
      __VSN_VERSION__: version
    }
  },
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    minify: true,
    sourcemap: true,
    outExtension: () => ({ js: ".min.js" }),
    target: "es2022",
    define: {
      __VSN_VERSION__: version
    }
  },
  {
    entry: ["src/plugins/microdata.ts"],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    outDir: "dist/plugins",
    target: "es2022"
  },
  {
    entry: ["src/plugins/sanitize-html.ts"],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    outDir: "dist/plugins",
    target: "es2022"
  },
  {
    entry: ["src/plugins/microdata.ts"],
    format: ["esm"],
    minify: true,
    sourcemap: true,
    outExtension: () => ({ js: ".min.js" }),
    outDir: "dist/plugins",
    target: "es2022"
  },
  {
    entry: ["src/plugins/sanitize-html.ts"],
    format: ["esm"],
    minify: true,
    sourcemap: true,
    outExtension: () => ({ js: ".min.js" }),
    outDir: "dist/plugins",
    target: "es2022"
  }
]);
