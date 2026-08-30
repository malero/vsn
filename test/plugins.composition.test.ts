/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";
import { registerSanitizeHtml } from "../src/plugins/sanitize-html";
import { registerTemplates } from "../src/plugins/templates";

type PluginRegistration = (engine: Engine) => void;

describe("plugin composition", () => {
  const orders: Array<[string, PluginRegistration[]]> = [
    [
      "templates before sanitization",
      [
        (engine: Engine) => registerTemplates(engine),
        (engine: Engine) => registerSanitizeHtml(engine, { sanitizer: (html) => html.replaceAll("UNSAFE", "SAFE") })
      ]
    ],
    [
      "sanitization before templates",
      [
        (engine: Engine) => registerSanitizeHtml(engine, { sanitizer: (html) => html.replaceAll("UNSAFE", "SAFE") }),
        (engine: Engine) => registerTemplates(engine)
      ]
    ]
  ];

  it.each(orders)("composes %s regardless of registration order", async (_label, register) => {
    document.body.innerHTML = `<div id="target" vsn-html="view"></div>`;

    const engine = new Engine();
    for (const setup of register) {
      setup(engine);
    }
    engine.registerBehaviors(`
      behavior #target {
        construct {
          content = "UNSAFE";
          view = html\`<span>\${content}</span>\`;
        }
      }
    `);

    await engine.mount(document.body);

    const target = document.getElementById("target") as HTMLElement;
    expect(target.querySelector("span")?.textContent).toBe("SAFE");
  });
});
