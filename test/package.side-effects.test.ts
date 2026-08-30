import { describe, expect, it } from "vitest";

import packageJson from "../package.json";

describe("package side-effect metadata", () => {
  it("marks plugin entry points that register themselves at import time", () => {
    expect(packageJson.sideEffects).toEqual(["./dist/plugins/*.js"]);
  });
});
