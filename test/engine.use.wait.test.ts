/* @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";

import { Engine } from "../src/index";

describe("use !wait", () => {
  it("waits for globals before applying behaviors", async () => {
    vi.useFakeTimers();
    document.body.innerHTML = `<div class="card"></div>`;

    const engine = new Engine();
    engine.registerBehaviors(`
      use Foo !wait(1000, 10);
      behavior .card {
        construct { seen = Foo.value; }
      }
    `);

    setTimeout(() => {
      (globalThis as any).Foo = { value: 7 };
    }, 50);

    const mountPromise = engine.mount(document.body);
    await vi.advanceTimersByTimeAsync(120);
    await mountPromise;

    const card = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(card);
    expect(scope.get("seen")).toBe(7);

    delete (globalThis as any).Foo;
    vi.useRealTimers();
  });
});
