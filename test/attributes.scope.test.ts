/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("scope chain keywords", () => {
  it("resolves parent and root in assignments", async () => {
    document.body.innerHTML = `
      <div id="root" vsn-bind="count">0
        <div id="middle" vsn-bind="value">x
          <button id="child" vsn-on:click="parent.count = parent.count + 1; root.count = root.count + 1;"></button>
        </div>
      </div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const root = document.getElementById("root") as HTMLDivElement;
    const middle = document.getElementById("middle") as HTMLDivElement;
    const child = document.getElementById("child") as HTMLButtonElement;

    const rootScope = engine.getScope(root);
    const middleScope = engine.getScope(middle);
    rootScope.setPath("self.count", 0);
    middleScope.setPath("self.count", 0);

    let clicked = false;
    child.addEventListener("click", () => {
      clicked = true;
    });

    child.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(clicked).toBe(true);
    expect(middleScope.get("count")).toBe(1);
    expect(rootScope.get("count")).toBe(1);
  });

  it("cascades lookups to parent scopes when missing", async () => {
    document.body.innerHTML = `
      <div id="parent" vsn-bind="count">
        <span id="child" vsn-bind:from="count"></span>
      </div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const parent = document.getElementById("parent") as HTMLDivElement;
    const child = document.getElementById("child") as HTMLSpanElement;

    const parentScope = engine.getScope(parent);
    parentScope.set("count", 5);

    engine.evaluate(child);
    expect(child.textContent).toBe("5");
  });

  it("supports parent.parent chains for scope access", async () => {
    document.body.innerHTML = `
      <div id="root" vsn-bind="count">
        <div id="middle" vsn-bind="value">
          <button id="child" vsn-on:click="value = parent.parent.count;"></button>
        </div>
      </div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const root = document.getElementById("root") as HTMLDivElement;
    const middle = document.getElementById("middle") as HTMLDivElement;
    const child = document.getElementById("child") as HTMLButtonElement;

    const rootScope = engine.getScope(root);
    const middleScope = engine.getScope(middle);
    const childScope = engine.getScope(child);
    rootScope.set("count", 7);

    child.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(childScope.get("value")).toBe(7);
  });

  it("assigns to nearest existing scope by default", async () => {
    document.body.innerHTML = `
      <div id="parent" vsn-bind="count">
        <button id="child" vsn-on:click="count = count + 2;"></button>
      </div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const parent = document.getElementById("parent") as HTMLDivElement;
    const child = document.getElementById("child") as HTMLButtonElement;

    const parentScope = engine.getScope(parent);
    parentScope.set("count", 1);

    child.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(parentScope.get("count")).toBe(3);
  });

  it("allows forcing local assignment with self", async () => {
    document.body.innerHTML = `
      <div id="parent" vsn-bind="count">
        <button id="child" vsn-on:click="self.count = 4;"></button>
      </div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const parent = document.getElementById("parent") as HTMLDivElement;
    const child = document.getElementById("child") as HTMLButtonElement;

    const parentScope = engine.getScope(parent);
    const childScope = engine.getScope(child);
    parentScope.set("count", 1);

    child.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(parentScope.get("count")).toBe(1);
    expect(childScope.get("count")).toBe(4);
  });
});
