/* @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";

import { autoMount, Engine } from "../src/index";

describe("autoMount errors", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("reports asynchronous mount failures through vsn:error", async () => {
    vi.useFakeTimers();
    const error = new Error("mount failed");
    const mount = vi.spyOn(Engine.prototype, "mount").mockRejectedValue(error);
    const errors: CustomEvent[] = [];
    const onError = (event: Event) => errors.push(event as CustomEvent);
    document.addEventListener("vsn:error", onError);

    try {
      autoMount(document.body);
      await vi.runAllTimersAsync();

      expect(mount).toHaveBeenCalledWith(document.body);
      expect(errors).toHaveLength(1);
      expect(errors[0]?.detail.error).toBe(error);
    } finally {
      document.removeEventListener("vsn:error", onError);
    }
  });

  it("only registers behavior scripts inside the requested root", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    document.body.innerHTML = `
      <script type="text/vsn">
        behavior .card { construct { external = true; } }
      </script>
      <section id="mount-root">
        <div class="card"></div>
      </section>
    `;

    try {
      const root = document.getElementById("mount-root") as HTMLElement;
      const engine = autoMount(root);
      await vi.runAllTimersAsync();

      const card = root.querySelector(".card") as HTMLDivElement;
      expect(engine?.getScope(card).get("external")).toBe(undefined);
    } finally {
      vi.useRealTimers();
    }
  });
});
