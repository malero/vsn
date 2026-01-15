/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("query expression eval", () => {
  it("supports ?(), ?>(), and ?<() selectors", async () => {
    document.body.innerHTML = `
      <div id="root">
        <div class="child"></div>
      </div>
    `;

    const root = document.getElementById("root") as HTMLDivElement;
    const child = root.querySelector(".child") as HTMLDivElement;
    const scope = new Scope();

    const block = Parser.parseInline(`
      a = ?(.child);
      b = ?>(.child);
      c = ?<(#root);
    `);

    await block.evaluate({ scope, element: child });

    expect((scope.get("a") as Element[]).length).toBe(1);
    expect((scope.get("b") as Element[]).length).toBe(0);
    expect((scope.get("c") as Element[]).length).toBe(1);
  });
});
