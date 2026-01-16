/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior method calls", () => {
  it("binds this for scope member calls", async () => {
    document.body.innerHTML = `<div class="card"></div>`;

    const source = `
      behavior .card {
        name: "  Vision  ";

        construct {
          name = name.trim();
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(element);

    expect(scope.get("name")).toBe("Vision");
  });
});
