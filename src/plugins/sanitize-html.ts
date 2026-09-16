import type { Engine } from "../runtime/engine";
import { resolveHtmlSanitizer } from "../runtime/html-safety";
import type { HtmlSanitizerOptions } from "../runtime/html-safety";

export type SanitizerOptions = HtmlSanitizerOptions;

export function registerSanitizeHtml(engine: Engine, options: SanitizerOptions = {}): () => void {
  return engine.registerHtmlSanitizer(resolveHtmlSanitizer(options));
}

export default registerSanitizeHtml;

const globals = globalThis as Record<string, any>;
const plugins = globals.VSNPlugins ?? {};
plugins.sanitizeHtml = (instance: Engine) => registerSanitizeHtml(instance);
globals.VSNPlugins = plugins;

const autoEngine = globals.VSNEngine;
if (autoEngine && typeof autoEngine.registerHtmlSanitizer === "function") {
  registerSanitizeHtml(autoEngine as Engine);
}
