/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("quoted behavior selectors", () => {
  it("matches quoted attribute values containing spaces", async () => {
    document.body.innerHTML = `<div data-label="hello world"></div>`;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior div[data-label="hello world"] {
        construct { matched = true; }
      }
    `);

    await engine.mount(document.body);

    const element = document.querySelector("div") as HTMLDivElement;
    expect(engine.getScope(element).get("matched")).toBe(true);
  });
});
