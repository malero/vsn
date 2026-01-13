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

  it("sanitizes html unless trusted", async () => {
    document.body.innerHTML = `
      <div id="safe" vsn-html="content"></div>
      <div id="trusted" vsn-html!trusted="content"></div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const safe = document.getElementById("safe") as HTMLDivElement;
    const trusted = document.getElementById("trusted") as HTMLDivElement;
    const safeScope = engine.getScope(safe);
    const trustedScope = engine.getScope(trusted);

    safeScope.set("content", "<script>bad()</script><span>Ok</span>");
    trustedScope.set("content", "<script>bad()</script><span>Ok</span>");

    engine.evaluate(safe);
    engine.evaluate(trusted);

    expect(safe.innerHTML).toBe("<span>Ok</span>");
    expect(trusted.innerHTML).toBe("<script>bad()</script><span>Ok</span>");
  });
});
