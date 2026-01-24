/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";
import { registerTemplates } from "../src/plugins/templates";

describe("templates plugin", () => {
  it("renders template results in vsn-html", async () => {
    document.body.innerHTML = `
      <div id="target" vsn-html="view"></div>
    `;

    const source = 'behavior #target { construct { name = "VSN"; view = html`<span class="name">${name}</span>`; }}';

    const engine = new Engine();
    registerTemplates(engine);
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const target = document.getElementById("target") as HTMLElement;
    const span = target.querySelector(".name") as HTMLSpanElement;

    expect(span).toBeTruthy();
    expect(span.textContent).toBe("VSN");
  });

  it("renders arrays of templates", async () => {
    document.body.innerHTML = `
      <div id="list" vsn-html="view"></div>
    `;

    const source = 'behavior #list { construct { items = ["A", "B"]; view = html`<span>${items[0]}</span><span>${items[1]}</span>`;}}';

    const engine = new Engine();
    registerTemplates(engine);
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const list = document.getElementById("list") as HTMLElement;
    const spans = Array.from(list.querySelectorAll("span")).map((node) => node.textContent);

    expect(spans).toEqual(["A", "B"]);
  });

  it("updates text and attributes when re-rendering the same template", async () => {
    document.body.innerHTML = `
      <div id="panel" vsn-html="render"></div>
    `;

    const source =
      'behavior #panel { name: "A"; cls: "one"; render: null; construct { renderView(); } renderView() { render = html`<div class="${cls}">${name}</div>`; } }';

    const engine = new Engine();
    registerTemplates(engine);
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const panel = document.getElementById("panel") as HTMLElement;
    const scope = engine.getScope(panel);

    let div = panel.querySelector("div") as HTMLDivElement;
    expect(div.className).toBe("one");
    expect(div.textContent).toBe("A");

    scope.set("name", "B");
    scope.set("cls", "two");
    await scope.get("renderView")?.();

    div = panel.querySelector("div") as HTMLDivElement;
    expect(div.className).toBe("two");
    expect(div.textContent).toBe("B");
  });
});
