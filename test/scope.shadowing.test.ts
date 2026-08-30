import { describe, expect, it } from "vitest";

import { Scope } from "../src/runtime/scope";

describe("scope shadowing", () => {
  it("keeps a local undefined value from falling through to its parent", () => {
    const parent = new Scope();
    parent.set("status", "parent");
    const child = parent.createChild();

    child.set("self.status", undefined);

    expect(child.get("status")).toBeUndefined();
    expect(parent.get("status")).toBe("parent");
  });

  it("keeps a locally-owned object path from falling through to its parent", () => {
    const parent = new Scope();
    parent.set("profile.name", "parent");
    const child = parent.createChild();

    child.set("self.profile", undefined);

    expect(child.get("profile.name")).toBeUndefined();
    expect(parent.get("profile.name")).toBe("parent");
  });

  it("continues to resolve missing local keys from the parent", () => {
    const parent = new Scope();
    parent.set("status", "parent");
    const child = parent.createChild();

    expect(child.get("status")).toBe("parent");
  });
});
