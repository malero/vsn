/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";
import { registerSanitizeHtml } from "../src/plugins/sanitize-html";

describe("sanitize-html plugin", () => {
  it("strips unsafe attributes when rendering html", async () => {
    document.body.innerHTML = `
      <div id="target" vsn-html="content"></div>
    `;

    const source = `
      behavior #target {
        construct {
          content = "<img src='x' onerror='alert(1)'><script>alert(2)</script>";
        }
      }
    `;

    const engine = new Engine();
    registerSanitizeHtml(engine);
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const target = document.getElementById("target") as HTMLElement;
    const img = target.querySelector("img") as HTMLImageElement;
    const script = target.querySelector("script");

    expect(img).toBeTruthy();
    expect(img.getAttribute("onerror")).toBe(null);
    expect(script).toBe(null);
  });
});
