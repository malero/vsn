/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior self", () => {
  it("binds self to the current element in construct", async () => {
    document.body.innerHTML = `<div class="item"></div>`;

    const source = `
      behavior .item {
        construct {
          menu = self;
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.querySelector(".item") as HTMLDivElement;
    const scope = engine.getScope(element);

    expect(scope.get("menu")).toBe(element);
  });
});
