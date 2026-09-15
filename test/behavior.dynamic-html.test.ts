/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("dynamic HTML behavior processing", () => {
  it("applies registered behaviors to template HTML without an inline script", async () => {
    document.body.innerHTML = `<div id="host" vsn-html="content"></div>`;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior #host {
        message: "";

        behavior .card {
          construct {
            root.message = "construct ran";
          }

          destruct {
            root.message = "destruct ran";
          }
        }
      }
    `);
    await engine.mount(document.body);

    const host = document.getElementById("host") as HTMLDivElement;
    const scope = engine.getScope(host);
    scope.set("content", `<article class="card"></article>`);
    engine.evaluate(host);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const card = host.querySelector(".card") as HTMLElement;
    expect(engine.getScope(host).get("message")).toBe("construct ran");

    scope.set("content", "");
    engine.evaluate(host);
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(engine.getScope(host).get("message")).toBe("destruct ran");
    expect(card.isConnected).toBe(false);
  });
});
