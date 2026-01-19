/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("vsn-bind auto defaults", () => {
  it("defaults to scope->element inside vsn-each templates", async () => {
    document.body.innerHTML = `
      <div>
        <template id="list" vsn-each="items as item">
          <span class="name" vsn-bind="item.name"></span>
        </template>
      </div>
    `;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior #list {
        items: [{ name: "Alpha" }];
      }
    `);
    await engine.mount(document.body);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const span = document.querySelector(".name") as HTMLSpanElement | null;
    expect(span).not.toBeNull();
    const scope = engine.getScope(span as HTMLSpanElement);

    expect((span as HTMLSpanElement).textContent).toBe("Alpha");
    expect(scope.get("item.name")).toBe("Alpha");
  });

  it("prefers scope value over SSR content on display elements", async () => {
    document.body.innerHTML = `
      <span id="name" vsn-bind="name">SSR</span>
    `;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior #name {
        name: "Model";
      }
    `);
    await engine.mount(document.body);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const span = document.getElementById("name") as HTMLSpanElement;
    const scope = engine.getScope(span);

    expect(span.textContent).toBe("Model");
    expect(scope.get("name")).toBe("Model");
  });

  it("hydrates scope from SSR content when scope is empty", async () => {
    document.body.innerHTML = `
      <span id="name" vsn-bind="name">SSR</span>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const span = document.getElementById("name") as HTMLSpanElement;
    const scope = engine.getScope(span);

    expect(scope.get("name")).toBe("SSR");
  });

  it("seeds form controls from scope when scope has a value", async () => {
    document.body.innerHTML = `
      <input id="name" value="SSR" vsn-bind="name" />
    `;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior #name {
        name: "Model";
      }
    `);
    await engine.mount(document.body);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const input = document.getElementById("name") as HTMLInputElement;
    const scope = engine.getScope(input);

    expect(input.value).toBe("Model");
    expect(scope.get("name")).toBe("Model");
  });

  it("hydrates scope from form controls when scope is empty", async () => {
    document.body.innerHTML = `
      <input id="name" value="SSR" vsn-bind="name" />
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const input = document.getElementById("name") as HTMLInputElement;
    const scope = engine.getScope(input);

    expect(scope.get("name")).toBe("SSR");
  });
});
