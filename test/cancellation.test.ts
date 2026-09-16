/* @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";

import { Engine, Lifetime } from "../src";
import { registerSanitizeHtml } from "../src/plugins/sanitize-html";

const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

describe("cancellation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("aborts a lifetime signal when it is disposed", () => {
    const lifetime = new Lifetime();
    expect(lifetime.signal.aborted).toBe(false);

    lifetime.dispose();

    expect(lifetime.signal.aborted).toBe(true);
    expect(lifetime.signal.reason).toBeTruthy();
  });

  it("passes the signal into async CFS functions and stops after unmount", async () => {
    document.body.innerHTML = `<button id="button"></button>`;
    let receivedSignal: AbortSignal | undefined;
    let abortCalls = 0;
    const warn = vi.fn();

    const engine = new Engine({ logger: { warn } });
    engine.registerGlobal("waitForValue", (_value: string, signal: AbortSignal) => {
      receivedSignal = signal;
      return new Promise<string>((resolve, reject) => {
        signal.addEventListener("abort", () => {
          abortCalls += 1;
          reject(signal.reason);
        }, { once: true });
        setTimeout(() => resolve("finished"), 40);
      });
    });
    engine.registerBehaviors(`
      behavior #button {
        status: "initial";

        async load() {
          status = await waitForValue("finished", signal);
        }

        on click() {
          load();
        }
      }
    `);

    await engine.mount(document.body);
    const button = document.getElementById("button") as HTMLButtonElement;
    const scope = engine.getScope(button);

    button.click();
    await tick();
    engine.unmount(button);
    await tick();

    expect(receivedSignal).toBeTruthy();
    expect(receivedSignal?.aborted).toBe(true);
    expect(abortCalls).toBe(1);
    expect(scope.get("status")).toBe("initial");
    expect(warn).not.toHaveBeenCalled();
  });

  it("stops an async CFS function after unmount even when its promise cannot abort", async () => {
    document.body.innerHTML = `<button id="button"></button>`;
    const warn = vi.fn();

    const engine = new Engine({ logger: { warn } });
    engine.registerGlobal(
      "slowValue",
      () => new Promise<string>((resolve) => setTimeout(() => resolve("stale"), 25))
    );
    engine.registerGlobal("ignorePromise", (promise: Promise<unknown>) => {
      void promise.catch(() => undefined);
    });
    engine.registerBehaviors(`
      behavior #button {
        status: "initial";

        async load() {
          status = await slowValue();
        }

        on click() {
          ignorePromise(load());
        }
      }
    `);

    await engine.mount(document.body);
    const button = document.getElementById("button") as HTMLButtonElement;
    const scope = engine.getScope(button);

    button.click();
    await tick();
    engine.unmount(button);
    await tick(40);

    expect(scope.get("status")).toBe("initial");
    expect(warn).not.toHaveBeenCalled();
  });

  it("aborts async expression bindings and ignores their completion", async () => {
    document.body.innerHTML = `<div class="card"></div>`;
    let receivedSignal: AbortSignal | undefined;
    let abortCalls = 0;

    const engine = new Engine();
    engine.registerGlobal("readValue", (value: string, signal: AbortSignal) => {
      receivedSignal = signal;
      if (value !== "slow") {
        return Promise.resolve(value);
      }
      return new Promise<string>((resolve, reject) => {
        signal.addEventListener("abort", () => {
          abortCalls += 1;
          reject(signal.reason);
        }, { once: true });
        setTimeout(() => resolve("stale"), 40);
      });
    });
    engine.registerBehaviors(`
      behavior .card {
        value: "initial";
        @data-result :< readValue(value, signal);
      }
    `);

    await engine.mount(document.body);
    const card = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(card);
    scope.set("value", "slow");
    await tick();

    engine.unmount(card);
    await tick();

    expect(receivedSignal?.aborted).toBe(true);
    expect(abortCalls).toBe(1);
    expect(card.getAttribute("data-result")).toBe("initial");
  });

  it("cancels built-in vsn-get requests when the trigger unmounts", async () => {
    document.body.innerHTML = `
      <button id="load" vsn-get="/fragment" vsn-target="#panel"></button>
      <div id="panel"></div>
    `;
    let requestSignal: AbortSignal | undefined;
    let abortCalls = 0;
    const getError = vi.fn();
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      requestSignal = init?.signal ?? undefined;
      return new Promise<Response>((_resolve, reject) => {
        requestSignal?.addEventListener("abort", () => {
          abortCalls += 1;
          reject(requestSignal?.reason);
        }, { once: true });
      });
    }) as typeof fetch;
    document.addEventListener("vsn:getError", getError);

    try {
      const engine = new Engine();
      await engine.mount(document.body);
      const button = document.getElementById("load") as HTMLButtonElement;

      button.click();
      await tick();
      engine.unmount(button);
      await tick();

      expect(requestSignal).toBeTruthy();
      expect(requestSignal?.aborted).toBe(true);
      expect(abortCalls).toBe(1);
      expect(getError).not.toHaveBeenCalled();
      expect(document.getElementById("panel")?.innerHTML).toBe("");
    } finally {
      document.removeEventListener("vsn:getError", getError);
      globalThis.fetch = originalFetch;
    }
  });

  it("cancels sanitizer-backed vsn-get requests too", async () => {
    document.body.innerHTML = `
      <button id="load" vsn-get="/fragment" vsn-target="#panel"></button>
      <div id="panel"></div>
    `;
    let requestSignal: AbortSignal | undefined;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      requestSignal = init?.signal ?? undefined;
      return new Promise<Response>((_resolve, reject) => {
        requestSignal?.addEventListener("abort", () => reject(requestSignal?.reason), { once: true });
      });
    }) as typeof fetch;

    try {
      const engine = new Engine();
      registerSanitizeHtml(engine, { sanitizer: (html) => html });
      await engine.mount(document.body);
      const button = document.getElementById("load") as HTMLButtonElement;

      button.click();
      await tick();
      engine.unmount(button);
      await tick();

      expect(requestSignal?.aborted).toBe(true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
