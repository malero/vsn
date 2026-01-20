/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("vsn-on modifiers", () => {
  it("prevents default and supports once", async () => {
    document.body.innerHTML = `
      <a id="link" href="#example" vsn-on:click!prevent!once="count = (count || 0) + 1;"></a>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const link = document.getElementById("link") as HTMLAnchorElement;
    const scope = engine.getScope(link);

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(event.defaultPrevented).toBe(true);
    expect(scope.get("count")).toBe(1);
  });

  it("supports click!outside", async () => {
    document.body.innerHTML = `
      <div class="panel" vsn-on:click!outside="closed = true;">
        <button class="inside"></button>
      </div>
      <button class="outside"></button>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const panel = document.querySelector(".panel") as HTMLDivElement;
    const inside = panel.querySelector(".inside") as HTMLButtonElement;
    const outside = document.querySelector(".outside") as HTMLButtonElement;
    const scope = engine.getScope(panel);

    inside.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(scope.get("closed")).toBe(undefined);

    outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(scope.get("closed")).toBe(true);
  });

  it("supports click!self", async () => {
    document.body.innerHTML = `
      <div class="panel" vsn-on:click!self="clicked = true;">
        <button class="inside"></button>
      </div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const panel = document.querySelector(".panel") as HTMLDivElement;
    const inside = panel.querySelector(".inside") as HTMLButtonElement;
    const scope = engine.getScope(panel);

    inside.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(scope.get("clicked")).toBe(undefined);

    panel.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(scope.get("clicked")).toBe(true);
  });
});
