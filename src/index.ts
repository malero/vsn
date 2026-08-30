declare const __VSN_VERSION__: string;

export const VERSION = typeof __VSN_VERSION__ !== "undefined" ? __VSN_VERSION__ : "0.1.0";

export { Lexer } from "./parser/lexer";
import { Parser } from "./parser/parser";
import { Engine } from "./runtime/engine";
export { Parser };
export { TokenType } from "./parser/token";
export * from "./ast/nodes";
export { Engine } from "./runtime/engine";
export type {
  HtmlSetOptions,
  HtmlTransformContext,
  HtmlTransformer,
  HtmlTransformOptions
} from "./runtime/engine";

export function parseCFS(source: string) {
  const parser = new Parser(source);
  return parser.parseProgram();
}

if (typeof window !== "undefined") {
  (window as any)["parseCFS"] = parseCFS;
}

export function autoMount(root: HTMLElement | Document = document): Engine | null {
  if (typeof document === "undefined") {
    return null;
  }
  const engine = new Engine();
  (globalThis as any).VSNEngine = engine;
  const startTime = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
  const mount = () => {
    const target = root instanceof Document ? root.body : root;
    if (target) {
      const plugins = (globalThis as any).VSNPlugins;
      if (plugins && typeof plugins === "object") {
        for (const plugin of Object.values(plugins)) {
          if (typeof plugin === "function") {
            plugin(engine);
          }
        }
      }
      const sources = Array.from(root.querySelectorAll('script[type="text/vsn"]'))
        .map((script) => script.textContent ?? "")
        .join("\n");
      if (sources.trim()) {
        engine.registerBehaviors(sources);
      }
      void engine.mount(target)
        .then(() => {
          const endTime = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
          const elapsedMs = Math.round(endTime - startTime);
          console.log(`Took ${elapsedMs}ms to start up VSN.js. https://www.vsnjs.com/ v${VERSION}`);
        })
        .catch((error) => {
          console.warn("vsn:mountError", error);
          target.dispatchEvent(new CustomEvent("vsn:error", {
            detail: { error, selector: "mount" },
            bubbles: true
          }));
        });
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(mount, 0), { once: true });
  } else {
    setTimeout(mount, 0);
  }
  return engine;
}

if (typeof document !== "undefined") {
  const scriptTag = document.querySelector("script[auto-mount]");
  if (scriptTag) {
    autoMount();
  }
}
