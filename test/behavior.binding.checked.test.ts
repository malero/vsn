/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior binding checked", () => {
  it("updates scope when @checked changes with :> binding", async () => {
    document.body.innerHTML = `<input class="toggle" type="checkbox" />`;

    const source = `
      behavior .toggle {
        @checked :> enabled;
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.querySelector(".toggle") as HTMLInputElement;
    const scope = engine.getScope(element);

    expect(scope.get("enabled")).toBe(false);

    element.checked = true;
    element.dispatchEvent(new Event("change", { bubbles: true }));

    expect(scope.get("enabled")).toBe(true);
  });

  it("syncs @checked with scope for := bindings", async () => {
    document.body.innerHTML = `<input class="toggle" type="checkbox" checked />`;

    const source = `
      behavior .toggle {
        @checked := enabled;
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.querySelector(".toggle") as HTMLInputElement;
    const scope = engine.getScope(element);

    expect(scope.get("enabled")).toBe(true);

    scope.set("enabled", false);
    expect(element.checked).toBe(false);

    element.checked = true;
    element.dispatchEvent(new Event("change", { bubbles: true }));

    expect(scope.get("enabled")).toBe(true);
  });
});
