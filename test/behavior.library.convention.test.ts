/* @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";

import { autoMount } from "../src/index";

describe("behavior library convention", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("loads a raw CFS module and opts in through its public class", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => `
        behavior .vsn-dialog !as(dialog) {
          open: false;
          construct { loaded = true; }
        }
      `
    } as Response);
    document.body.innerHTML = `
      <section class="vsn-dialog"></section>
      <section class="other-dialog"></section>
      <script type="text/vsn" src="/node_modules/@vsnjs/behaviors/cfs/dialog.cfs"></script>
    `;

    const engine = autoMount(document);
    await vi.runAllTimersAsync();

    const dialog = document.querySelector(".vsn-dialog") as HTMLElement;
    const otherDialog = document.querySelector(".other-dialog") as HTMLElement;
    expect(fetch).toHaveBeenCalledWith(
      new URL("/node_modules/@vsnjs/behaviors/cfs/dialog.cfs", document.baseURI).href,
      { signal: expect.any(AbortSignal) }
    );
    expect(engine?.getScope(dialog).get("loaded")).toBe(true);
    expect(engine?.getScope(dialog).get("dialog.open")).toBe(false);
    expect(engine?.getScope(otherDialog).get("loaded")).toBeUndefined();
  });
});
