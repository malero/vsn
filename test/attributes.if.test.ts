/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("vsn-if", () => {
  it("mounts and unmounts the element while preserving its identity", async () => {
    document.body.innerHTML = `
      <div id="host">
        <div id="box" vsn-if="visible">Hello</div>
      </div>
    `;

    const engine = new Engine();
    const host = document.getElementById("host") as HTMLDivElement;
    const element = document.getElementById("box") as HTMLDivElement;
    const scope = engine.getScope(host);
    scope.set("visible", false);
    await engine.mount(document.body);

    expect(element.isConnected).toBe(false);
    expect(document.getElementById("box")).toBeNull();

    scope.set("visible", true);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.getElementById("box")).toBe(element);
    expect(element.isConnected).toBe(true);
  });

  it("tears down inline resources while unmounted and remounts them when active", async () => {
    document.body.innerHTML = `
      <div id="host">
        <button
          id="box"
          vsn-if="visible"
          vsn-construct="mounts = (mounts ?? 0) + 1;"
          vsn-destruct="destroyed = true;"
          vsn-on:click="clicks = (clicks ?? 0) + 1;"
        >Hello</button>
      </div>
    `;

    const engine = new Engine();
    const host = document.getElementById("host") as HTMLDivElement;
    const element = document.getElementById("box") as HTMLButtonElement;
    const hostScope = engine.getScope(host);
    hostScope.set("visible", true);
    await engine.mount(document.body);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const elementScope = engine.getScope(element);
    element.click();
    expect(elementScope.get("mounts")).toBe(1);
    expect(elementScope.get("clicks")).toBe(1);

    hostScope.set("visible", false);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(element.isConnected).toBe(false);
    expect(elementScope.get("destroyed")).toBe(true);
    element.click();
    expect(elementScope.get("clicks")).toBe(1);

    hostScope.set("visible", true);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(element.isConnected).toBe(true);
    expect(elementScope.get("mounts")).toBe(2);
    element.click();
    expect(elementScope.get("clicks")).toBe(2);
  });

  it("suspends nested conditional lifetimes while the parent is unmounted", async () => {
    document.body.innerHTML = `
      <div id="host">
        <section id="panel" vsn-if="showPanel">
          <span id="child" vsn-if="showChild">Child</span>
        </section>
      </div>
    `;

    const engine = new Engine();
    const host = document.getElementById("host") as HTMLDivElement;
    const panel = document.getElementById("panel") as HTMLElement;
    const child = document.getElementById("child") as HTMLElement;
    const scope = engine.getScope(host);
    scope.set("showPanel", true);
    scope.set("showChild", true);
    await engine.mount(document.body);

    expect(panel.isConnected).toBe(true);
    expect(child.isConnected).toBe(true);

    scope.set("showPanel", false);
    await new Promise((resolve) => setTimeout(resolve, 0));
    scope.set("showChild", false);
    scope.set("showPanel", true);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(panel.isConnected).toBe(true);
    expect(child.isConnected).toBe(false);

    scope.set("showChild", true);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(child.isConnected).toBe(true);
    expect(panel.contains(child)).toBe(true);
  });
});
