# Reference

The HTML directives, CFS language features, and public JavaScript interfaces used by VSN. For a working first page, start with [Get started](/get-started); for the mental model, read the [Guide](/guide).

## HTML directives

| Attribute | Purpose |
| --- | --- |
| `vsn-bind="path"` | Automatic binding; two-way on form controls |
| `vsn-bind:from="path"` | Write scope state into the element |
| `vsn-bind:to="path"` | Read the element into scope state |
| `vsn-text="path"` | Write text through `textContent` |
| `vsn-html="path"` | Set HTML through the configured sanitizer |
| `vsn-if="path"` | Conditionally mount and unmount the element |
| `vsn-show="path"` | Toggle native `hidden` without unmounting |
| `vsn-on:event="code"` | Run CFS on a DOM event |
| `vsn-construct="code"` | Run CFS when bindings are constructed |
| `vsn-destruct="code"` | Run CFS when bindings are torn down |
| `vsn-each="items as item, index"` | Repeat a template for an array; index is optional |
| `vsn-key="item.id"` | Give repeated rows stable identity |
| `vsn-transition="fade"` | Opt into named conditional transition classes |
| `vsn-enter="code"` | Run CFS when the enter phase starts |
| `vsn-leave="code"` | Run CFS when the leave phase starts |
| `vsn-get="/url"` | Trigger a request and optional HTML swap |

`vsn-bind` takes a scope path, not arbitrary CFS. Use `user.name` and `item.0`; use bracket indexing in CFS expressions instead. `vsn-text`, `vsn-html`, `vsn-if`, and `vsn-show` also read scope paths; compute complex conditions in CFS state rather than placing arbitrary expressions in these attributes. Automatic display bindings can seed state from existing text. Prefer explicit direction when state ownership matters.

Use `vsn-each` on a `<template>`. A unique key preserves rows through reordering; unkeyed rows are recreated. [List guide](/guide#lists-and-row-identity).

## Event flags

Append flags to an event name, in HTML or CFS:

```html
<input vsn-on:input!debounce(300)="search();" />
<button type="button" vsn-on:click!once="notify();">Notify</button>
```

```cfs
on keyup!escape() {
  open = false;
}
```

| Flags | Effect |
| --- | --- |
| `prevent`, `stop` | Prevent default action or stop propagation |
| `self`, `outside` | Filter to the element itself or events outside it |
| `once`, `passive`, `capture` | Configure listener behavior |
| `debounce(ms)` | Debounce event execution |
| `shift`, `ctrl`, `control`, `alt`, `meta` | Require a modifier key |
| `enter`, `escape`, `esc`, `tab`, `space` | Filter keyboard events |
| `up`, `down`, `left`, `right` | Arrow-key filters |
| `arrowup`, `arrowdown`, `arrowleft`, `arrowright` | Explicit arrow-key aliases |
| `delete`, `backspace` | Deletion-key filters |
| `minwidth(value)`, `maxwidth(value)` | Filter by viewport width |

## Request directives

`vsn-get` handles clicks or form submission. Add `!load` to request on binding, `!trusted` for application-controlled executable fragments, or `!form` to use a related form. The name does not restrict requests to GET.

| Attribute | Values or meaning |
| --- | --- |
| `vsn-target` | CSS selector for the swap target |
| `vsn-swap` | `inner` (default), `outer`, or `none` |
| `vsn-method` | HTTP method; forms also support their native method |
| `vsn-body` | CFS expression for the request body |
| `vsn-headers` | CFS expression resolving to an object, Headers, or header pairs |
| `vsn-form` | Selector identifying a form |
| `vsn-loading` | Scope path for loading state |
| `vsn-error` | Scope path for error state |
| `vsn-data` | Scope path for response data |
| `vsn-history` | `none`, `push`, or `replace` |
| `vsn-history-url` | Override the history URL |
| `vsn-focus` | Empty/`true` to restore focus, `false` to disable, or a selector |

The `!push`, `!replace`, and `!focus` modifiers provide shorthand for history and focus options. Responses are sanitized unless explicitly trusted. Non-2xx responses do not swap HTML and dispatch `vsn:getError`. See [requests in the Guide](/guide#requests-and-partial-pages).

## CFS

CFS behavior blocks select elements, initialize state, and connect that state to the DOM:

```cfs
#panel !as(panel) {
  open: false;
  label: "Details";

  construct {
    console.log("panel mounted");
  }

  toggle() {
    open = !open;
  }

  .trigger {
    @aria-expanded :< panel.open;
    on click() {
      panel.toggle();
    }
  }
}
```

### State, functions, and selectors

- `name: value;` declares state
- `name = value;` assigns state
- `save() { ... }` declares a synchronous function
- `async load() { ... }` declares an async function that can use `await`
- `construct { ... }` and `destruct { ... }` define lifecycle blocks
- `on click() { ... }` defines an event block
- Nested selectors select descendants; `&` substitutes the parent selector
- `!as(name)` exposes a stable behavior scope alias
- `!group("name")` exposes live nested behavior instances on their parent
- `self`, `parent`, and `root` refer to the current, parent, and behavior-root scopes
- `use fetch as request;` resolves a global and registers an alias

Place lifecycle construction blocks before functions and event blocks. Objects, arrays, expressions, and control flow belong inside CFS. Hyphenated identifiers are valid, so write `count - 1` with spaces for subtraction.

### DOM directives

| Syntax | Meaning |
| --- | --- |
| `@aria-label :< label;` | State to attribute/property |
| `@data-id :> id;` | Attribute/property to state |
| `@value := name;` | Two-way control binding |
| `@class :< { selected: active };` | Reactive class map |
| `$display :< (visible ? "block" : "none");` | Reactive style property |

`:<`, `:>`, and `:=` express direction. HTML attribute bindings and CFS directives share the same scope model.

## Engine

Import public APIs from `vsn` in a bundled application:

```js
import { Engine, parseCFS } from "vsn";

const source = "#counter { count: 0; }";
const program = parseCFS(source);
const engine = new Engine({ diagnostics: true });
engine.registerBehaviors(source);
await engine.mount(document.getElementById("counter"));
```

`parseCFS(source: string)` parses source into a program AST. It does not mount anything or inherit an engine's registered flags. For behavior source using runtime event flags or custom extensions, use `engine.registerBehaviors()` with the relevant registrations in place. `Lexer`, `Parser`, `TokenType`, AST exports, and `VERSION` are also exported for tooling.

### Initialization and teardown

| API | Return / behavior |
| --- | --- |
| `new Engine(options?)` | Create an engine |
| `registerBehaviors(source: string)` | Parse and register CFS source |
| `mount(root: HTMLElement)` | `Promise<void>`; initialize and observe the root |
| `hydrate(root: HTMLElement, { state }?)` | `Promise<void>`; initialize with optional root state and preserve uninitialized SSR values |
| `unmount(element: Element)` | Tear down bindings for the subtree |
| `dispose()` | Tear down mounted roots and engine-owned resources |
| `signal` | Engine lifetime's `AbortSignal` |
| `getScope(element, parentScope?)` | Get or create an element's `Scope` |
| `getLifetime(element)` | Element inline-binding `Lifetime` |
| `evaluate(element)` | Re-evaluate the element's registered bindings |
| `getRegistryStats()` | `{ behaviorCount, behaviorCacheSize }` |

`EngineOptions` accepts `diagnostics`, `logger` (optional `info` and `warn` methods), `htmlSanitizer`, `trustedTypesPolicy`, and `trustedTypesPolicyName`. A sanitizer has the signature `(html: string) => string`. A supplied Trusted Types policy provides `createHTML(value: string)`.

`autoMount(root?: HTMLElement | Document): Engine | null` sets up automatic source loading and mounting, with `document` as its browser default. It returns the engine before asynchronous mounting completes. It applies registered browser plugins, loads inline and external `text/vsn` scripts, and mounts the body or supplied element. Use explicit `mount()` when you need an awaitable initialization step.

### Globals and extensions

| API | Purpose |
| --- | --- |
| `registerGlobal(name, value)` | Expose a value to CFS |
| `registerGlobals(values)` | Expose a record of values |
| `registerFlag(name, handler?)` | Register declaration/event flag hooks |
| `registerBehaviorModifier(name, handler?)` | Register behavior lifecycle hooks |
| `registerAttributeHandler(handler)` | Register a custom attribute handler |
| `registerHtmlTransformer(transform, { priority }?)` | Transform HTML values; returns a removal function |
| `registerHtmlSanitizer(sanitizer)` | Replace the sanitizer; returns a restoration function |

An attribute handler supplies `id`, `match(name)`, and `handle(element, name, value, scope, context?)`. A handler with the same ID replaces the previous handler. Its context includes `lifetime`, `signal`, `hydrating`, and `onCleanup`.

Behavior modifier hooks are `onBind`, `onConstruct`, `onDestruct`, and `onUnbind`. The names `important` and `debounce` are reserved for behavior modifier registration. Flag hooks include `onApply`, `transformValue`, `onEventBind`, `onEventBefore`, `onEventAfter`, and `transformEventArgs`. Register custom flags and modifiers before parsing behavior source that uses them.

HTML transformers receive `(value, { element, trusted })`; lower priority runs first, with registration order breaking ties. Use lifetime cleanup for resources created by extensions.

### HTML and requests

`setHtml(element, value, { trusted?, process? }?)` transforms and inserts HTML. Untrusted output is sanitized. Processing is enabled unless `process` is `false`.

`processHtml(root, { trusted? }?)` processes dynamic HTML within a root. Only use `trusted: true` for application-controlled content. [HTML safety guide](/guide#safe-dynamic-html).

`request(element, config): Promise<RequestResult>` sends a request and optionally applies its HTML response. `RequestConfig` accepts:

```ts
{
  url?: string;
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
  form?: HTMLFormElement;
  submitter?: HTMLElement;
  targetSelector?: string;
  swap?: "inner" | "outer" | "none";
  trusted?: boolean;
  history?: "none" | "push" | "replace";
  historyUrl?: string;
  restoreFocus?: boolean | string;
  signal?: AbortSignal;
}
```

The result contains `response: Response`, `body: string`, `target: Element | null`, and `swapped: boolean`. `GetConfig` is a backward-compatible alias for `RequestConfig`. HTTP failures use the exported `RequestError`, with `response`, `status`, `statusText`, and `url` fields.

## Scope and reactivity

The core exports `Scope`, `batch`, `computed`, and `effect` for JavaScript integrations:

```js
import { Scope, batch, computed, effect } from "vsn";

const scope = new Scope();
scope.set("count", 0);
const doubled = computed(scope, s => s.get("count") * 2);
const stop = effect(scope, s => {
  console.log(s.get("count"), doubled.value);
});

batch(() => {
  scope.set("count", 1);
  scope.set("count", 2);
});

stop();
doubled.dispose();
```

| API | Purpose |
| --- | --- |
| `new Scope(parent?)` | Create a scope with an optional parent |
| `scope.createChild()` | Create an inheriting child |
| `scope.get(path)` / `getPath(path)` | Read a scope path |
| `scope.set(path, value)` / `setPath(path, value)` | Write a scope path |
| `scope.getLocal(name)` / `setLocal(name, value)` | Access local state |
| `scope.on(path, handler)` / `off(path, handler)` | Add/remove a path listener |
| `scope.onAny(handler)` / `offAny(handler)` | Add/remove a scope-wide listener |
| `batch(callback)` | Batch reactive updates; returns the callback's result |
| `computed(scope, getter, options?)` | Create a dependency-tracked computed reference |
| `effect(scope, callback, options?)` | Run a dependency-tracked effect; return a disposer |

A computed reference exposes read-only `value`, `get()`, `subscribe(listener)`, and `dispose()`. `subscribe` returns a disposer. Computed options accept a `lifetime`.

`scope.computed(getter, options?)` is the scope-bound form. `scope.computed(name, getter, options?)` also exposes a named computed value on the scope; the name must be an unused, nonempty root key without dots. `scope.effect(callback, options?)` binds an effect to that scope.

An effect callback receives the scope and may return a cleanup function. Effect options accept `lifetime` and a `scheduler(run)` that may return a disposer. The engine also exposes `batch(callback)`, `computed(scope, getter, options?)`, and `effect(scope, callback, options?)`.

`Lifetime`, `isAbortError`, `throwIfAborted`, and the `Disposer` type are exported for lifecycle-aware integrations. Tie external subscriptions and asynchronous work to the relevant lifetime rather than leaving them running after unmount.

## Plugins

Plugins are opt-in. With automatic mounting, load browser plugin modules before the core module:

```html
<script type="module" src="/dist/plugins/templates.min.js"></script>
<script type="module" src="/dist/plugins/sanitize-html.min.js"></script>
<script type="module" src="/dist/plugins/microdata.min.js"></script>
<script type="module" src="/dist/index.min.js" auto-mount></script>
```

For explicit engine setup, register the plugins you need:

```js
import { Engine } from "vsn";
import { registerTemplates } from "vsn/plugins/templates";
import { registerSanitizeHtml } from "vsn/plugins/sanitize-html";
import { registerMicrodata } from "vsn/plugins/microdata";

const engine = new Engine();
registerTemplates(engine);
registerSanitizeHtml(engine);
registerMicrodata(engine);
// Register behavior source, then await engine.mount(root).
```

- `registerTemplates(engine)` adds the `html` tagged-template helper and HTML transformation. Returns a function removing its transformer
- `registerSanitizeHtml(engine, options?)` installs a sanitizer and returns a restoration function. Options accept `sanitizer` and `dompurifyConfig`; DOMPurify is used when available
- `registerMicrodata(engine)` adds the `!microdata` behavior modifier and `microdata()` helper for extracting HTML microdata

Each plugin also has a default export for its registration function. See [templates](/play/templates) and [product filters](/play/product-filters) for working examples.
