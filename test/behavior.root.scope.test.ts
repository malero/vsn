/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior root scope", () => {
  it("resolves root to the behavior tree root", async () => {
    document.body.innerHTML = `
      <div id="outer" vsn-on:click="noop = true;">
        <section id="tabs">
          <button class="tab" data-id="overview"></button>
        </section>
      </div>
    `;

    const source = `
      behavior #tabs {
        active: "overview";

        behavior .tab {
          @data-id :> id;
          @aria-selected :< (root.active == id);
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const tab = document.querySelector(".tab") as HTMLButtonElement;
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(tab.getAttribute("aria-selected")).toBe("true");
  });
});
