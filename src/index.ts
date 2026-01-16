export const VERSION = "0.1.0";

export { Lexer } from "./parser/lexer";
import { Parser } from "./parser/parser";
import { Engine } from "./runtime/engine";
export { Parser };
export { TokenType } from "./parser/token";
export * from "./ast/nodes";
export { Engine } from "./runtime/engine";

export function parseCFS(source: string) {
  const parser = new Parser(source);
  return parser.parseProgram();
}

export function autoMount(root: HTMLElement | Document = document): Engine | null {
  if (typeof document === "undefined") {
    return null;
  }
  const engine = new Engine();
  const startTime = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
  const mount = () => {
    const target = root instanceof Document ? root.body : root;
    if (target) {
      const sources = Array.from(document.querySelectorAll('script[type="text/vsn"]'))
        .map((script) => script.textContent ?? "")
        .join("\n");
      if (sources.trim()) {
        engine.registerBehaviors(sources);
      }
      engine.mount(target);
      const endTime = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
      const elapsedMs = Math.round(endTime - startTime);
      console.log(`Took ${elapsedMs}ms to start up VSN.js. https://www.vsnjs.com/ v${VERSION}`);
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
  return engine;
}

if (typeof document !== "undefined") {
  const scriptTag = document.querySelector("script[auto-mount]");
  if (scriptTag) {
    autoMount();
  }
}
