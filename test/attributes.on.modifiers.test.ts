/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("vsn-on modifiers", () => {
  it("prevents default and supports once", async () => {
    document.body.innerHTML = `
      <a id="link" href="#example" vsn-on:click!prevent!once="count = (count || 0) + 1;"></a>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const link = document.getElementById("link") as HTMLAnchorElement;
    const scope = engine.getScope(link);

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(event.defaultPrevented).toBe(true);
    expect(scope.get("count")).toBe(1);
  });
});
