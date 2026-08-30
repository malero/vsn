/* @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";

import { Engine } from "../src/index";

describe("use !wait interval validation", () => {
  it.each([0, -1])("does not hang mount for an interval of %s", async (intervalMs) => {
    vi.useFakeTimers();
    try {
      document.body.innerHTML = `<div class="card"></div>`;

      const engine = new Engine();
      engine.registerBehaviors(`
        use MissingGlobal !wait(20, ${intervalMs});
        behavior .card {
          construct { ready = true; }
        }
      `);

      let settled = false;
      const mountPromise = engine.mount(document.body).then(() => {
        settled = true;
      });

      for (let attempt = 0; attempt < 100 && !settled; attempt += 1) {
        await vi.advanceTimersToNextTimerAsync();
      }

      expect(settled).toBe(true);
      await mountPromise;
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });
});
