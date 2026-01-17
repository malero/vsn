/* @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";

import { Engine } from "../src/index";

describe("vsn:error for vsn-on", () => {
  it("emits vsn:error when a handler throws", async () => {
    document.body.innerHTML = `
      <button id="btn" class="danger" vsn-on:click="boom();"></button>
    `;

    const engine = new Engine();
    engine.registerGlobal("boom", () => {
      throw new Error("fail");
    });

    const listener = vi.fn();
    document.addEventListener("vsn:error", listener);

    await engine.mount(document.body);
    const button = document.getElementById("btn") as HTMLButtonElement;
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(listener).toHaveBeenCalled();
    const detail = listener.mock.calls[0]?.[0]?.detail;
    expect(detail.error).toBeInstanceOf(Error);
    expect(detail.selector).toBe("button#btn.danger");
  });
});
