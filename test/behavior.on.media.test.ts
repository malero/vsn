/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior media flags and helpers", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.matchMedia = (query: string) => {
      return {
        matches: query.includes("min-width: 768px"),
        media: query,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() {
          return false;
        }
      } as MediaQueryList;
    };
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("gates events with !minwidth and !maxwidth", async () => {
    document.body.innerHTML = `<button id="btn"></button>`;

    const source = `
      behavior #btn {
        on click!minwidth(768)() {
          hit = true;
        }

        on click!maxwidth(500)() {
          nope = true;
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const button = document.getElementById("btn") as HTMLButtonElement;
    const scope = engine.getScope(button);

    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(scope.get("hit")).toBe(true);
    expect(scope.get("nope")).toBe(undefined);
  });

  it("exposes minwidth/maxwidth helpers for if statements", async () => {
    document.body.innerHTML = `<div id="panel"></div>`;

    const source = `
      behavior #panel {
        construct {
          ok = minwidth(768);
          nope = maxwidth(500);
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const panel = document.getElementById("panel") as HTMLDivElement;
    const scope = engine.getScope(panel);

    expect(scope.get("ok")).toBe(true);
    expect(scope.get("nope")).toBe(false);
  });
});
