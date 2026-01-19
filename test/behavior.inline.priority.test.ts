/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("inline vsn-* priority", () => {
  it("prefers behavior declarations over inline vsn-bind state", async () => {
    document.body.innerHTML = `<div id="card" vsn-bind="count">10</div>`;

    const source = `
      behavior #card {
        count: 1;
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.getElementById("card") as HTMLDivElement;
    const scope = engine.getScope(element);

    expect(scope.get("count")).toBe(1);
  });

  it("prefers more specific behavior declarations over inline vsn-bind state", async () => {
    document.body.innerHTML = `<div id="card" class="card" vsn-bind="count">8</div>`;

    const source = `
      behavior .card {
        count: 1;
      }

      behavior #card.card {
        count: 2;
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.getElementById("card") as HTMLDivElement;
    const scope = engine.getScope(element);

    expect(scope.get("count")).toBe(2);
  });

  it("keeps inline vsn-html over behavior @html binding", async () => {
    document.body.innerHTML = `<div id="card" vsn-html="content"></div>`;

    const source = `
      behavior #card {
        @html :< otherContent;
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.getElementById("card") as HTMLDivElement;
    const scope = engine.getScope(element);

    scope.set("content", "<span>Inline</span>");
    scope.set("otherContent", "<span>Behavior</span>");
    engine.evaluate(element);

    expect(element.innerHTML).toBe("<span>Inline</span>");
  });
});
