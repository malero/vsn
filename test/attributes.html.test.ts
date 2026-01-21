/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("vsn-html", () => {
  it("sets innerHTML from scope", async () => {
    document.body.innerHTML = `
      <div id="box" vsn-html="content"></div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const element = document.getElementById("box") as HTMLDivElement;
    const scope = engine.getScope(element);
    scope.set("content", "<span>Hi</span>");

    engine.evaluate(element);
    expect(element.innerHTML).toBe("<span>Hi</span>");
  });

  it("does not sanitize html by default", async () => {
    document.body.innerHTML = `
      <div id="host" vsn-html="content"></div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const host = document.getElementById("host") as HTMLDivElement;
    const scope = engine.getScope(host);

    scope.set("content", "<script>bad()</script><span>Ok</span>");

    engine.evaluate(host);

    expect(host.innerHTML).toBe("<script>bad()</script><span>Ok</span>");
  });

  it("parses behaviors in html", async () => {
    document.body.innerHTML = `
      <div id="host" vsn-html="content"></div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const host = document.getElementById("host") as HTMLDivElement;
    const scope = engine.getScope(host);
    scope.set("content", `
      <div class="card"></div>
      <script type="text/vsn">
        behavior .card {
          construct { ready = true; }
        }
      </script>
    `);

    engine.evaluate(host);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const card = host.querySelector(".card") as HTMLDivElement;
    const cardScope = engine.getScope(card);
    expect(cardScope.get("ready")).toBe(true);
  });
});
