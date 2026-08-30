import packageJson from "../package.json";
import { describe, expect, it } from "vitest";

describe("package exports", () => {
  it("exports every built plugin with its types", () => {
    const exportsMap = (packageJson as {
      exports?: Record<string, { import?: string; types?: string }>;
    }).exports ?? {};

    for (const plugin of ["microdata", "templates", "sanitize-html"]) {
      expect(exportsMap[`./plugins/${plugin}`]).toEqual({
        types: `./dist/plugins/${plugin}.d.ts`,
        import: `./dist/plugins/${plugin}.js`
      });
    }
  });
});
