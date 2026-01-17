/* @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";

import { Engine } from "../src/index";

describe("engine diagnostics", () => {
  it("logs bind/unbind when diagnostics are enabled", async () => {
    document.body.innerHTML = `
      <div class="card"></div>
    `;

    const logger = { info: vi.fn() };
    const engine = new Engine({ diagnostics: true, logger });
    engine.registerBehaviors(`
      behavior .card { }
    `);

    await engine.mount(document.body);
    expect(logger.info).toHaveBeenCalledWith("vsn:bind", expect.any(Object));

    const card = document.querySelector(".card") as HTMLDivElement;
    card.classList.remove("card");
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(logger.info).toHaveBeenCalledWith("vsn:unbind", expect.any(Object));
  });
});
