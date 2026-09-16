declare const __VSN_VERSION__: string;

export const VERSION = typeof __VSN_VERSION__ !== "undefined" ? __VSN_VERSION__ : "0.1.0";

export { Lexer } from "./parser/lexer";
import { Parser } from "./parser/parser";
import { Engine } from "./runtime/engine";
import { isAbortError } from "./runtime/lifetime";
export { Parser };
export { TokenType } from "./parser/token";
export * from "./ast/nodes";
export { Engine } from "./runtime/engine";
export { Scope, batch, computed, effect } from "./runtime/scope";
export type {
  ComputedGetter,
  ComputedRef,
  EffectCallback,
  EffectOptions,
  ReactiveOptions,
  ReactiveScheduler
} from "./runtime/scope";
export { isAbortError, Lifetime, throwIfAborted } from "./runtime/lifetime";
export type { Disposer } from "./runtime/lifetime";
export type {
  AttributeHandler,
  AttributeHandlerContext,
  BehaviorModifierContext,
  BehaviorModifierHandler,
  EngineOptions,
  EventBindPatch,
  EventFlagContext,
  FlagApplyContext,
  FlagHandler,
  HtmlSetOptions,
  HtmlTransformContext,
  HtmlTransformer,
  HtmlTransformOptions,
  RegisteredBehavior
} from "./runtime/engine";

export function parseCFS(source: string) {
  const parser = new Parser(source);
  return parser.parseProgram();
}

if (typeof window !== "undefined") {
  (window as any)["parseCFS"] = parseCFS;
}

async function loadBehaviorSources(root: HTMLElement | Document, signal?: AbortSignal): Promise<string> {
  const documentRoot = root instanceof Document ? root : root.ownerDocument;
  const scripts = Array.from(root.querySelectorAll('script[type="text/vsn"]'));
  const sources = await Promise.all(
    scripts.map(async (script) => {
      const src = script.getAttribute("src")?.trim();
      if (!src) {
        return script.textContent ?? "";
      }

      const url = new URL(src, documentRoot.baseURI);
      const response = signal
        ? await fetch(url.href, { signal })
        : await fetch(url.href);
      if (signal?.aborted) {
        return "";
      }
      if (!response.ok) {
        throw new Error(`Failed to load VSN source '${url.href}' (HTTP ${response.status})`);
      }
      return response.text();
    })
  );
  return sources.join("\n");
}

export function autoMount(root: HTMLElement | Document = document): Engine | null {
  if (typeof document === "undefined") {
    return null;
  }
  const engine = new Engine();
  (globalThis as any).VSNEngine = engine;
  const startTime = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
  const mount = async () => {
    const target = root instanceof Document ? root.body : root;
    if (target) {
      try {
        if (engine.signal.aborted) {
          return;
        }
        const plugins = (globalThis as any).VSNPlugins;
        if (plugins && typeof plugins === "object") {
          for (const plugin of Object.values(plugins)) {
            if (typeof plugin === "function") {
              plugin(engine);
            }
          }
        }

        const sources = await loadBehaviorSources(root, engine.signal);
        if (engine.signal.aborted) {
          return;
        }
        if (sources.trim()) {
          engine.registerBehaviors(sources);
        }
        await engine.mount(target);

        const endTime = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
        const elapsedMs = Math.round(endTime - startTime);
        console.log(`Took ${elapsedMs}ms to start up VSN.js. https://www.vsnjs.com/ v${VERSION}`);
      } catch (error) {
        if (engine.signal.aborted || isAbortError(error)) {
          return;
        }
        console.warn("vsn:mountError", error);
        target.dispatchEvent(new CustomEvent("vsn:error", {
          detail: { error, selector: "mount" },
          bubbles: true
        }));
      }
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(() => void mount(), 0), { once: true });
  } else {
    setTimeout(() => void mount(), 0);
  }
  return engine;
}

if (typeof document !== "undefined") {
  const scriptTag = document.querySelector("script[auto-mount]");
  if (scriptTag) {
    autoMount();
  }
}
