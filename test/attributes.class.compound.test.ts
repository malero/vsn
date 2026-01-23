/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("class compound assignments", () => {
  it("preserves existing classes when using += and -=", async () => {
    document.body.innerHTML = `
      <div id="item" class="alpha beta"></div>
    `;

    const source = `
      behavior #item {
        construct {
          @class += "gamma";
          @class -= "beta";
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.getElementById("item") as HTMLDivElement;
    const classes = Array.from(element.classList.values());

    expect(classes.sort()).toEqual(["alpha", "gamma"]);
  });
});
