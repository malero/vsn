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

  it("sanitizes html by default", async () => {
    document.body.innerHTML = `
      <div id="host" vsn-html="content"></div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const host = document.getElementById("host") as HTMLDivElement;
    const scope = engine.getScope(host);

    scope.set("content", "<script>bad()</script><span>Ok</span>");

    engine.evaluate(host);

    expect(host.innerHTML).toBe("<span>Ok</span>");
  });

  it("removes executable VSN attributes while preserving custom elements", async () => {
    document.body.innerHTML = `
      <div id="host" vsn-html="content"></div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const host = document.getElementById("host") as HTMLDivElement;
    const scope = engine.getScope(host);
    scope.set("content", `
      <vsn-tabs vsn-on:click="bad()"><vsn-tab>One</vsn-tab></vsn-tabs>
    `);
    engine.evaluate(host);

    const tabs = host.querySelector("vsn-tabs");
    expect(tabs).toBeTruthy();
    expect(tabs?.hasAttribute("vsn-on:click")).toBe(false);
    expect(tabs?.querySelector("vsn-tab")?.textContent).toBe("One");
  });

  it("sanitizes CFS html assignments by default", async () => {
    document.body.innerHTML = `<div id="host"></div>`;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior #host {
        construct {
          @html = "<script>bad()</script><span>Ok</span>";
        }
      }
    `);
    await engine.mount(document.body);

    const host = document.getElementById("host") as HTMLDivElement;
    expect(host.innerHTML).toBe("<span>Ok</span>");
  });

  it("supports the trusted flag on CFS html bindings", async () => {
    document.body.innerHTML = `<div id="host"></div>`;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior #host {
        content: "<script>trusted()</script><span>Ok</span>";
        @html :< content !trusted;
      }
    `);
    await engine.mount(document.body);

    const host = document.getElementById("host") as HTMLDivElement;
    expect(host.querySelector("script")?.textContent).toBe("trusted()");
    expect(host.querySelector("span")?.textContent).toBe("Ok");
  });

  it("supports literal text with vsn-text", async () => {
    document.body.innerHTML = `
      <div id="host" vsn-text="content"></div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const host = document.getElementById("host") as HTMLDivElement;
    const scope = engine.getScope(host);
    scope.set("content", "<span>Not markup</span>");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(host.textContent).toBe("<span>Not markup</span>");
    expect(host.querySelector("span")).toBeNull();
  });

  it("parses behaviors in explicitly trusted html", async () => {
    document.body.innerHTML = `
      <div id="host" vsn-html!trusted="content"></div>
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
