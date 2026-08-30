/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("vsn-bind input", () => {
  it("updates scope when input value changes", async () => {
    document.body.innerHTML = `
      <input id="name" value="" vsn-bind:to="name" />
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const input = document.getElementById("name") as HTMLInputElement;
    const scope = engine.getScope(input);

    input.value = "Vision";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(scope.get("name")).toBe("Vision");
  });

  it("preserves whitespace for two-way bindings", async () => {
    document.body.innerHTML = `
      <input id="title" value="" vsn-bind="title" />
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const input = document.getElementById("title") as HTMLInputElement;
    const scope = engine.getScope(input);

    input.value = "  spaced  ";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(scope.get("title")).toBe("  spaced  ");
  });

  it("binds select values instead of text content", async () => {
    document.body.innerHTML = `
      <select id="priority" vsn-bind="priority">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const select = document.getElementById("priority") as HTMLSelectElement;
    const scope = engine.getScope(select);

    select.value = "high";
    select.dispatchEvent(new Event("change", { bubbles: true }));

    expect(scope.get("priority")).toBe("high");
  });

  it("binds checkbox checked state instead of its value payload", async () => {
    document.body.innerHTML = `
      <input id="done-to" type="checkbox" value="payload" vsn-bind:to="done" />
      <input id="done-from" type="checkbox" value="payload" vsn-bind:from="done" />
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const toInput = document.getElementById("done-to") as HTMLInputElement;
    const toScope = engine.getScope(toInput);

    expect(toScope.get("done")).toBe(false);

    toInput.checked = true;
    toInput.dispatchEvent(new Event("change", { bubbles: true }));
    expect(toScope.get("done")).toBe(true);

    const fromInput = document.getElementById("done-from") as HTMLInputElement;
    const fromScope = engine.getScope(fromInput);
    fromScope.set("done", true);
    engine.evaluate(fromInput);

    expect(fromInput.checked).toBe(true);
    expect(fromInput.value).toBe("payload");
  });
});
