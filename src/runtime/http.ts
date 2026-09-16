import { applyHtml } from "./html";
import { throwIfAborted } from "./lifetime";
import type { Scope } from "./scope";

export type RequestSwap = "inner" | "outer" | "none";
export type RequestHistory = "none" | "push" | "replace";

export type RequestStatePaths = {
  loading?: string;
  error?: string;
  data?: string;
};

export interface RequestConfig {
  url?: string;
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
  form?: HTMLFormElement;
  submitter?: HTMLElement;
  targetSelector?: string;
  swap?: RequestSwap;
  trusted?: boolean;
  history?: RequestHistory;
  historyUrl?: string;
  restoreFocus?: boolean | string;
  signal?: AbortSignal;
}

/** Backwards-compatible name for integrations that used the old GET helper. */
export type GetConfig = RequestConfig;

export interface RequestResult {
  response: Response;
  body: string;
  target: Element | null;
  swapped: boolean;
}

export class RequestError extends Error {
  readonly response: Response;
  readonly status: number;
  readonly statusText: string;
  readonly url: string;

  constructor(response: Response) {
    const status = response.status || 0;
    const statusText = response.statusText?.trim() ?? "";
    super(`Request failed with HTTP ${status}${statusText ? ` ${statusText}` : ""}`);
    this.name = "VsnRequestError";
    this.response = response;
    this.status = status;
    this.statusText = statusText;
    this.url = response.url;
  }
}

export type HtmlApplier = (element: HTMLElement, html: string) => void;

type FocusSnapshot = {
  element: HTMLElement;
  id?: string;
};

export async function applyRequest(
  element: Element,
  config: RequestConfig,
  onHtmlApplied?: (target: Element) => void,
  htmlApplier?: HtmlApplier
): Promise<RequestResult> {
  if (!globalThis.fetch) {
    throw new Error("fetch is not available");
  }
  throwIfAborted(config.signal);

  const request = buildRequest(element, config);
  const requestTarget = resolveTarget(element, config.targetSelector);
  const focus = config.restoreFocus ? captureFocus(element) : undefined;
  const response = await globalThis.fetch(request.url, request.init);
  throwIfAborted(config.signal);
  if (!response) {
    throw new Error("Request returned no response");
  }
  if (!response.ok) {
    throw new RequestError(response);
  }

  const body = await response.text();
  throwIfAborted(config.signal);

  const swap = config.swap ?? "inner";
  let target = requestTarget;
  let swapped = false;
  if (swap !== "none") {
    if (!target) {
      element.dispatchEvent(new CustomEvent("vsn:targetError", {
        detail: { selector: config.targetSelector },
        bubbles: true
      }));
    } else {
      const apply = htmlApplier ?? ((targetElement: HTMLElement, value: string) => {
        applyHtml(targetElement, "__html", { get: () => value } as unknown as Scope);
      });

      if (swap === "outer") {
        const wrapper = target.ownerDocument.createElement("div");
        apply(wrapper, body);
        const replacements = Array.from(wrapper.childNodes);
        const elements = Array.from(wrapper.children);
        if (replacements.length > 0 && target.parentNode) {
          const fragment = target.ownerDocument.createDocumentFragment();
          fragment.append(...replacements);
          target.parentNode.replaceChild(fragment, target);
          swapped = true;
          for (const replacement of elements) {
            onHtmlApplied?.(replacement);
          }
        }
      } else {
        apply(target as HTMLElement, body);
        swapped = true;
        onHtmlApplied?.(target);
      }
    }
  }

  updateHistory(element, config, request.url, response.url);
  if (config.restoreFocus && swapped) {
    restoreFocus(element, config.restoreFocus, focus);
  }

  if (swap === "outer" && target && !target.isConnected) {
    target = config.targetSelector ? resolveTarget(element, config.targetSelector) : null;
  }
  return { response, body, target, swapped };
}

/**
 * Compatibility wrapper for the original partial GET helper.
 * @deprecated Use applyRequest for methods, bodies, forms, and request results.
 */
export async function applyGet(
  element: Element,
  config: GetConfig,
  _scope: Scope,
  onHtmlApplied?: (target: Element) => void,
  htmlApplier?: HtmlApplier
): Promise<void> {
  await applyRequest(element, config, onHtmlApplied, htmlApplier);
}

export function getPartialHeaders(element: Element, target: Element | null): Headers {
  const headers = new Headers();
  headers.set("HX-Request", "true");

  const currentUrl = element.ownerDocument.defaultView?.location.href;
  if (currentUrl) {
    headers.set("HX-Current-URL", currentUrl);
  }

  const targetId = target?.getAttribute("id");
  if (targetId) {
    headers.set("HX-Target", targetId);
  }

  const triggerId = element.getAttribute("id");
  if (triggerId) {
    headers.set("HX-Trigger", triggerId);
  }

  const triggerName = element.getAttribute("name");
  if (triggerName) {
    headers.set("HX-Trigger-Name", triggerName);
  }

  return headers;
}

function buildRequest(element: Element, config: RequestConfig): { url: string; init: RequestInit } {
  const form = config.form;
  const rawUrl = config.url || form?.getAttribute("action") || element.ownerDocument.defaultView?.location.href || "";
  const method = (config.method ?? form?.getAttribute("method") ?? "GET").trim().toUpperCase() || "GET";
  const target = resolveTarget(element, config.targetSelector);
  const headers = getPartialHeaders(element, target);
  if (config.headers) {
    const customHeaders = new Headers(config.headers);
    customHeaders.forEach((value, key) => headers.set(key, value));
  }

  let url = rawUrl;
  let body = config.body;
  if (body === undefined && form) {
    const formData = createFormData(form, config.submitter);
    if (method === "GET" || method === "HEAD") {
      url = appendFormDataToUrl(element, rawUrl, formData);
    } else {
      body = formData;
    }
  }

  if ((method === "GET" || method === "HEAD") && body !== undefined && body !== null) {
    throw new TypeError(`${method} requests cannot include a body`);
  }

  const normalizedBody = normalizeBody(body, headers);
  const init: RequestInit = {
    method,
    headers
  };
  if (normalizedBody !== undefined && method !== "GET" && method !== "HEAD") {
    init.body = normalizedBody;
  }
  if (config.signal) {
    init.signal = config.signal;
  }
  return { url, init };
}

function createFormData(form: HTMLFormElement, submitter?: HTMLElement): FormData {
  const formData = new FormData(form);
  if (!submitter || !form.contains(submitter)) {
    return formData;
  }
  if (!(submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement)) {
    return formData;
  }
  if (submitter.disabled || !submitter.name) {
    return formData;
  }
  const type = (submitter.getAttribute("type") ?? (submitter instanceof HTMLButtonElement ? "submit" : "text"))
    .toLowerCase();
  if (type !== "submit" && type !== "image") {
    return formData;
  }
  formData.append(submitter.name, submitter.value);
  return formData;
}

function appendFormDataToUrl(element: Element, rawUrl: string, formData: FormData): string {
  const url = new URL(rawUrl, element.ownerDocument.baseURI);
  formData.forEach((value, key) => {
    url.searchParams.append(key, typeof value === "string" ? value : value.name);
  });
  return url.href;
}

function normalizeBody(value: unknown, headers: Headers): BodyInit | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof FormData !== "undefined" && value instanceof FormData) {
    return value;
  }
  if (typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
    }
    return value;
  }
  if (typeof Blob !== "undefined" && value instanceof Blob) {
    return value;
  }
  if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) {
    return value;
  }
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView(value)) {
    return value as BodyInit;
  }
  if (typeof ReadableStream !== "undefined" && value instanceof ReadableStream) {
    return value as BodyInit;
  }
  if (typeof value === "object") {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return JSON.stringify(value);
  }
  return String(value);
}

function captureFocus(element: Element): FocusSnapshot | undefined {
  const active = element.ownerDocument.activeElement;
  if (!(active instanceof HTMLElement)) {
    return undefined;
  }
  return {
    element: active,
    ...(active.id ? { id: active.id } : {})
  };
}

function restoreFocus(element: Element, option: boolean | string, snapshot?: FocusSnapshot): void {
  let candidate: HTMLElement | null = null;
  if (typeof option === "string" && option.trim()) {
    try {
      candidate = element.ownerDocument.querySelector(option) as HTMLElement | null;
    } catch {
      candidate = null;
    }
  } else if (snapshot?.id) {
    candidate = element.ownerDocument.getElementById(snapshot.id);
  } else if (snapshot?.element.isConnected) {
    candidate = snapshot.element;
  }
  if (!candidate && element instanceof HTMLElement && element.isConnected) {
    candidate = element;
  }
  candidate?.focus();
}

function updateHistory(element: Element, config: RequestConfig, requestUrl: string, responseUrl: string): void {
  const mode = config.history ?? "none";
  if (mode === "none") {
    return;
  }
  const view = element.ownerDocument.defaultView;
  if (!view?.history) {
    return;
  }
  const url = config.historyUrl || responseUrl || requestUrl;
  const state = mode === "replace" ? view.history.state : {};
  if (mode === "push") {
    view.history.pushState(state, "", url);
  } else {
    view.history.replaceState(state, "", url);
  }
}

function resolveTarget(element: Element, selector?: string): Element | null {
  if (!selector) {
    return element;
  }
  return element.ownerDocument.querySelector(selector);
}
