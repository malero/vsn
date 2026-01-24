/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";
import { registerMicrodata } from "../src/plugins/microdata";

describe("microdata plugin", () => {
  it("extracts microdata into scope with !microdata", async () => {
    document.body.innerHTML = `
      <article class="card" itemscope itemtype="https://schema.org/Product" itemid="sku-1">
        <meta itemprop="color" content="green">
        <h3 itemprop="name">Forest Stack Plates</h3>
      </article>
    `;

    const source = `
      behavior .card !microdata {
      }
    `;

    const engine = new Engine();
    registerMicrodata(engine);
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.querySelector(".card") as HTMLElement;
    const scope = engine.getScope(element);

    expect(scope.get("itemtype")).toBe("https://schema.org/Product");
    expect(scope.get("itemid")).toBe("sku-1");
    expect(scope.get("color")).toBe("green");
    expect(scope.get("name")).toBe("Forest Stack Plates");
  });
});
