import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
) as { sideEffects?: unknown };

describe("package side-effect metadata", () => {
  it("marks plugin entry points that register themselves at import time", () => {
    expect(packageJson.sideEffects).toEqual(["./dist/plugins/*.js"]);
  });
});
