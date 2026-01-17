/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior on key modifiers", () => {
  it("supports keyup.enter in CFS on blocks", async () => {
    document.body.innerHTML = `<input class="field" />`;

    const source = `
      behavior .field {
        count: 0;

        on keyup.enter() {
          count = count + 1;
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const field = document.querySelector(".field") as HTMLInputElement;
    const scope = engine.getScope(field);

    field.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(scope.get("count")).toBe(1);
  });

  it("supports click.outside in CFS on blocks", async () => {
    document.body.innerHTML = `
      <div class="panel">
        <button class="inside"></button>
      </div>
      <button class="outside"></button>
    `;

    const source = `
      behavior .panel {
        on click.outside() {
          closed = true;
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
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

  it("supports click.self in CFS on blocks", async () => {
    document.body.innerHTML = `
      <div class="panel">
        <button class="inside"></button>
      </div>
    `;

    const source = `
      behavior .panel {
        on click.self() {
          clicked = true;
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
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
