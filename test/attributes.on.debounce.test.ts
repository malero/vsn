/* @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";

import { Engine } from "../src/index";

describe("vsn-on debounce", () => {
  it("debounces event handler execution", async () => {
    vi.useFakeTimers();

    document.body.innerHTML = `
      <button id="btn" vsn-on:click!debounce(50)="count = count + 1;"></button>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const button = document.getElementById("btn") as HTMLButtonElement;
    const scope = engine.getScope(button);
    scope.set("count", 0);

    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(scope.get("count")).toBe(0);

    await vi.advanceTimersByTimeAsync(50);
    await Promise.resolve();
    expect(scope.get("count")).toBe(1);

    vi.useRealTimers();
  });
});
