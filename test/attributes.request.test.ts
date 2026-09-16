/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Engine, RequestError } from "../src/index";

function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("vsn-get request primitive", () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = window.location.href;

  beforeEach(() => {
    document.body.innerHTML = "";
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    window.history.replaceState({}, "", originalUrl);
    vi.restoreAllMocks();
  });

  it("supports methods, JSON bodies, and loading/error/data state", async () => {
    document.body.innerHTML = `
      <button
        id="save"
        vsn-get="/api/items"
        vsn-method="POST"
        vsn-body="payload"
        vsn-headers="headers"
        vsn-swap="none"
        vsn-loading="request.loading"
        vsn-error="request.error"
        vsn-data="request.data"
      >Save</button>
    `;
    let resolveResponse: (response: Response) => void = () => {};
    const responsePromise = new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    });
    const fetchMock = vi.fn(() => responsePromise);
    globalThis.fetch = fetchMock as typeof fetch;

    const engine = new Engine();
    await engine.mount(document.body);
    const button = document.getElementById("save") as HTMLButtonElement;
    engine.getScope(button).set("payload", { name: "Ada", active: true });
    engine.getScope(button).set("headers", { "X-CSRF-Token": "test-token" });

    button.click();
    await Promise.resolve();

    expect(engine.getScope(button).get("request.loading")).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/items");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ name: "Ada", active: true }));
    const headers = new Headers(init.headers);
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("X-CSRF-Token")).toBe("test-token");

    resolveResponse({
      ok: true,
      status: 201,
      text: async () => "created"
    } as Response);
    await tick();

    const scope = engine.getScope(button);
    expect(scope.get("request.loading")).toBe(false);
    expect(scope.get("request.error")).toBe("");
    expect(scope.get("request.data")).toBe("created");
  });

  it("serializes form controls for non-GET requests and includes the submitter", async () => {
    document.body.innerHTML = `
      <form id="profile" action="/profile" method="post" vsn-get>
        <input name="name" value="Ada" />
        <button name="intent" value="save" type="submit">Save</button>
      </form>
    `;
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => "ok"
    } as Response)) as typeof fetch;

    const engine = new Engine();
    await engine.mount(document.body);
    const form = document.getElementById("profile") as HTMLFormElement;
    const submitter = form.querySelector("button") as HTMLButtonElement;
    form.dispatchEvent(new SubmitEvent("submit", {
      bubbles: true,
      cancelable: true,
      submitter
    }));
    await tick();

    const [, init] = (globalThis.fetch as any).mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get("name")).toBe("Ada");
    expect((init.body as FormData).get("intent")).toBe("save");
  });

  it("supports GET form submission through an explicit form trigger", async () => {
    document.body.innerHTML = `
      <form id="search" action="/search" method="get">
        <input name="query" value="vsn" />
        <button id="submit" type="submit" vsn-get!form="/search" vsn-swap="none">Search</button>
      </form>
    `;
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => "results"
    } as Response)) as typeof fetch;

    const engine = new Engine();
    await engine.mount(document.body);
    const button = document.getElementById("submit") as HTMLButtonElement;
    button.click();
    await tick();

    const [url, init] = (globalThis.fetch as any).mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/search?");
    expect(url).toContain("query=vsn");
    expect(init.method).toBe("GET");
    expect(init.body).toBeUndefined();
  });

  it("rejects non-2xx responses without swapping and exposes request details", async () => {
    document.body.innerHTML = `
      <button
        id="load"
        vsn-get="/missing"
        vsn-loading="loading"
        vsn-error="error"
        vsn-data="data"
      >Load</button>
    `;
    const response = {
      ok: false,
      status: 422,
      statusText: "Unprocessable Entity",
      url: "http://localhost/missing",
      text: async () => "invalid"
    } as Response;
    globalThis.fetch = vi.fn(async () => response) as typeof fetch;
    let errorDetail: any;
    document.addEventListener("vsn:getError", (event) => {
      errorDetail = (event as CustomEvent).detail;
    }, { once: true });

    const engine = new Engine();
    await engine.mount(document.body);
    const button = document.getElementById("load") as HTMLButtonElement;
    button.click();
    await tick();

    const scope = engine.getScope(button);
    expect(scope.get("loading")).toBe(false);
    expect(scope.get("error")).toBe("Request failed with HTTP 422 Unprocessable Entity");
    expect(scope.get("data")).toBeUndefined();
    expect(button.innerHTML).toBe("Load");
    expect(errorDetail.error).toBeInstanceOf(RequestError);
    expect(errorDetail.status).toBe(422);
    expect(errorDetail.response).toBe(response);
  });

  it("supports history updates and focus restoration after a swap", async () => {
    document.body.innerHTML = `
      <button
        id="load"
        vsn-get!push!focus="/next"
        vsn-target="#panel"
        vsn-focus="#field"
      >Load</button>
      <div id="panel"><input id="field" value="old" /></div>
    `;
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => "<input id=\"field\" value=\"new\" />"
    } as Response)) as typeof fetch;

    const engine = new Engine();
    await engine.mount(document.body);
    const oldField = document.getElementById("field") as HTMLInputElement;
    oldField.focus();
    const button = document.getElementById("load") as HTMLButtonElement;
    button.click();
    await tick();

    expect(window.location.pathname).toBe("/next");
    expect(document.activeElement?.id).toBe("field");
    expect(document.getElementById("field")?.getAttribute("value")).toBe("new");
  });

  it("cancels an older request when a trigger starts again", async () => {
    document.body.innerHTML = `
      <button id="load" vsn-get="/fragment" vsn-swap="none" vsn-loading="loading" vsn-data="data">
        Load
      </button>
    `;
    const requests: Array<{ signal: AbortSignal | undefined; resolve: (response: Response) => void }> = [];
    globalThis.fetch = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      return new Promise<Response>((resolve, reject) => {
        const signal = init?.signal;
        requests.push({ signal: signal ?? undefined, resolve });
        signal?.addEventListener("abort", () => reject(signal.reason), { once: true });
      });
    }) as typeof fetch;

    const engine = new Engine();
    await engine.mount(document.body);
    const button = document.getElementById("load") as HTMLButtonElement;
    button.click();
    await Promise.resolve();
    button.click();
    await Promise.resolve();

    expect(requests).toHaveLength(2);
    expect(requests[0]?.signal?.aborted).toBe(true);
    requests[1]?.resolve({
      ok: true,
      status: 200,
      text: async () => "latest"
    } as Response);
    await tick();

    expect(engine.getScope(button).get("loading")).toBe(false);
    expect(engine.getScope(button).get("data")).toBe("latest");
  });
});
