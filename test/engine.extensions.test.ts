/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("engine extensions", () => {
  it("supports custom attribute handlers", async () => {
    document.body.innerHTML = `<div id="node" vsn-test="hello"></div>`;

    const engine = new Engine();
    engine.registerAttributeHandler({
      id: "vsn-test",
      match: (name) => name === "vsn-test",
      handle: (element, _name, value, scope) => {
        scope.set("message", value);
        element.setAttribute("data-seen", "true");
      }
    });

    await engine.mount(document.body);

    const node = document.getElementById("node") as HTMLDivElement;
    const scope = engine.getScope(node);
    expect(scope.get("message")).toBe("hello");
    expect(node.getAttribute("data-seen")).toBe("true");
  });

  it("applies custom flags on declarations", async () => {
    document.body.innerHTML = `<div id="card"></div>`;

    const engine = new Engine();
    engine.registerFlag("mark", {
      onApply: ({ scope }) => {
        scope.set("marked", true);
      }
    });

    const source = `
      behavior #card {
        count: 1 !mark;
      }
    `;

    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.getElementById("card") as HTMLDivElement;
    const scope = engine.getScope(element);
    expect(scope.get("marked")).toBe(true);
  });
});
