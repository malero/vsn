/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("dynamic behavior registration", () => {
  it("replaces behaviors declared by successive HTML swaps", async () => {
    document.body.innerHTML = `<div id="host" vsn-html="content"></div>`;

    const engine = new Engine();
    await engine.mount(document.body);

    const host = document.getElementById("host") as HTMLDivElement;
    const scope = engine.getScope(host);
    scope.set("content", `
      <div class="card"></div>
      <script type="text/vsn">
        behavior .card {
          construct { stale = true; }
        }
      </script>
    `);
    engine.evaluate(host);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(engine.getRegistryStats().behaviorCount).toBe(1);

    scope.set("content", `
      <div class="card"></div>
      <script type="text/vsn">
        behavior .card {
          construct { current = true; }
        }
      </script>
    `);
    engine.evaluate(host);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const card = host.querySelector(".card") as HTMLDivElement;
    const cardScope = engine.getScope(card);
    expect(engine.getRegistryStats().behaviorCount).toBe(1);
    expect(cardScope.get("current")).toBe(true);
    expect(cardScope.get("stale")).toBeUndefined();
  });
});
