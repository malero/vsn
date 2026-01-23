/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior on modifiers", () => {
  it("prevents default and stops propagation", async () => {
    document.body.innerHTML = `
      <a id="link" href="https://example.com"></a>
    `;

    const source = `
      behavior #link {
        on click!prevent!stop() {
          clicked = true;
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const link = document.getElementById("link") as HTMLAnchorElement;
    const scope = engine.getScope(link);

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    const cancelled = !link.dispatchEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(event.defaultPrevented).toBe(true);
    expect(cancelled).toBe(true);
    expect(scope.get("clicked")).toBe(true);
  });

  it("supports once modifier", async () => {
    document.body.innerHTML = `
      <button id="btn"></button>
    `;

    const source = `
      behavior #btn {
        on click!once() {
          count = (count || 0) + 1;
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const button = document.getElementById("btn") as HTMLButtonElement;
    const scope = engine.getScope(button);

    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(scope.get("count")).toBe(1);
  });
});
