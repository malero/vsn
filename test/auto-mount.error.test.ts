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

  it("loads external behavior scripts and ignores their inline text", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    const source = `behavior .card { construct { external = true; } }`;
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => source
    } as Response);
    document.body.innerHTML = `
      <div class="card"></div>
      <script type="text/vsn" src="/behaviors/common.cfs">
        behavior .card { construct { inline = true; } }
      </script>
    `;

    try {
      const engine = autoMount(document);
      await vi.runAllTimersAsync();

      const card = document.querySelector(".card") as HTMLDivElement;
      expect(fetch).toHaveBeenCalledWith(
        new URL("/behaviors/common.cfs", document.baseURI).href,
        { signal: expect.any(AbortSignal) }
      );
      expect(engine?.getScope(card).get("external")).toBe(true);
      expect(engine?.getScope(card).get("inline")).toBe(undefined);
    } finally {
      vi.useRealTimers();
    }
  });

  it("reports external behavior script load failures", async () => {
    vi.useFakeTimers();
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 404
    } as Response);
    const mount = vi.spyOn(Engine.prototype, "mount");
    const errors: CustomEvent[] = [];
    const onError = (event: Event) => errors.push(event as CustomEvent);
    document.addEventListener("vsn:error", onError);
    document.body.innerHTML = `
      <div class="card"></div>
      <script type="text/vsn" src="/behaviors/missing.cfs"></script>
    `;

    try {
      autoMount(document);
      await vi.runAllTimersAsync();

      expect(fetch).toHaveBeenCalled();
      expect(mount).not.toHaveBeenCalled();
      expect(errors).toHaveLength(1);
      expect(errors[0]?.detail.error.message).toContain("missing.cfs");
    } finally {
      document.removeEventListener("vsn:error", onError);
      vi.useRealTimers();
    }
  });
});
