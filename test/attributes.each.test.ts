/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("vsn-each", () => {
  it("renders a template for each item and updates when the list changes", async () => {
    document.body.innerHTML = `
      <div id="host" vsn-construct="items = ['a', 'b'];">
        <ul>
          <template id="row" vsn-each="items as item, index">
            <li class="row">
              <span class="label" vsn-bind:from="item"></span>
              <span class="idx" vsn-bind:from="index"></span>
            </li>
          </template>
        </ul>
      </div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    await new Promise((resolve) => setTimeout(resolve, 0));

    let rows = Array.from(document.querySelectorAll(".row"));
    expect(rows).toHaveLength(2);
    expect(rows[0]?.querySelector(".label")?.textContent).toBe("a");
    expect(rows[0]?.querySelector(".idx")?.textContent).toBe("0");
    expect(rows[1]?.querySelector(".label")?.textContent).toBe("b");
    expect(rows[1]?.querySelector(".idx")?.textContent).toBe("1");

    const host = document.getElementById("host") as HTMLDivElement;
    const scope = engine.getScope(host);
    scope.set("items", ["z"]);

    await new Promise((resolve) => setTimeout(resolve, 0));

    rows = Array.from(document.querySelectorAll(".row"));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.querySelector(".label")?.textContent).toBe("z");
    expect(rows[0]?.querySelector(".idx")?.textContent).toBe("0");
  });

  it("scopes item bindings when parent already has the same key", async () => {
    document.body.innerHTML = `
      <div id="host" vsn-construct="item = 'parent'; items = ['child'];">
        <ul>
          <template id="row" vsn-each="items as item, index">
            <li class="row">
              <span class="label" vsn-bind:from="item"></span>
              <span class="idx" vsn-bind:from="index"></span>
            </li>
          </template>
        </ul>
      </div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    await new Promise((resolve) => setTimeout(resolve, 0));

    const row = document.querySelector(".row") as HTMLLIElement;
    expect(row.querySelector(".label")?.textContent).toBe("child");
    expect(row.querySelector(".idx")?.textContent).toBe("0");
  });
});
