[![npm version](https://badge.fury.io/js/vsn.svg)](https://badge.fury.io/js/vsn) [![Build Status](https://travis-ci.org/malero/vsn.svg?branch=master)](https://travis-ci.org/malero/vsn) [![codecov](https://codecov.io/gh/malero/vsn/branch/master/graph/badge.svg)](https://codecov.io/gh/malero/vsn) [![npm](https://img.shields.io/npm/dw/vsn.svg)]() [![gzip bundle size](http://img.badgesize.io/https://unpkg.com/vsn@latest/dist/?compression=gzip&style=flat-square)](https://unpkg.com/vsn)

# VSN Framework
VSN is a small, server-rendered-friendly JavaScript/TypeScript framework. It adds behavior to existing HTML instead of requiring a component renderer.

Learn more at https://vsnjs.org.

## Installing
Use NPM to install VisionJS with the following command:

```bash
npm i vsn
```

## Usage

Create an engine, register behavior source, and mount it on a root element:

```ts
import { Engine } from "vsn";

const engine = new Engine();
engine.registerBehaviors(`
  .todo-item {
    done: false;
    @class :< { done: done };

    on click() {
      done = !done;
    }
  }
`);

await engine.mount(document.body);
```

The `behavior` keyword is optional, so CSS-like declarations are valid. Selectors are passed to `Element.matches()` and may use classes, IDs, attributes, combinators, pseudo-classes, and comma-separated groups:

```less
.todo-item {
  @class :< {
    done: todo[2],
    "is-selected": selected,
    "is-disabled": disabled
  };
}

#dropdown {
  open: false;
}
```

Nested behavior selectors without `&` target descendants as usual. A nested selector containing `&` replaces it with the parent selector, so `&.active` targets the parent element when it also has the `active` class.

Class maps reactively add and remove only the mapped classes; existing static classes are preserved. Hyphenated identifiers are supported. Write whitespace around subtraction (`count - 1`) to distinguish it from a hyphenated identifier.

Declarations are evaluated before `construct`, `destruct`, and `on` blocks. Common directive directions are:

```vsn
@data-label :< label;  // scope -> element, reactive
@value :> name;        // element -> scope
@value := name;        // two-way binding
$color :< theme.color;
```

`construct` runs when a behavior binds and `destruct` runs when it unbinds. `self`, `parent`, and `root` address the current, parent, and behavior-root scopes. Named functions are synchronous unless declared `async`; async functions return promises and may use `await`.

Inline attributes include `vsn-bind`, `vsn-if`, `vsn-show`, `vsn-text`, `vsn-html`, `vsn-each`, `vsn-get`, and `vsn-on:<event>`. `vsn-text` writes literal text with `textContent`; `vsn-html` sanitizes HTML by default, while `vsn-html!trusted` explicitly bypasses sanitization. Untrusted HTML never activates VSN behavior scripts or `vsn-*` attributes. `vsn-if` conditionally mounts and unmounts an element, running its lifecycle cleanup and setup each time; `vsn-show` keeps the element mounted and toggles its visibility. `vsn-get` sends htmx-compatible partial-request headers: `HX-Request`, `HX-Current-URL`, and, when available, `HX-Target`, `HX-Trigger`, and `HX-Trigger-Name`.

`vsn-each` renders the content of a `<template>` once per array item. Add `vsn-key` to reuse rows across list updates and preserve their DOM identity, focus, form state, animations, and child behaviors:

```html
<template vsn-each="users as user, index" vsn-key="user.id">
  <li><input vsn-bind="user.name" /></li>
</template>
```

The key expression is evaluated in each item scope. Keys must be unique and
must not be `null` or `undefined`; omit `vsn-key` when index-based rendering is
acceptable.

## Plugins

Plugins can be imported from the package subpaths and registered on an engine:

```ts
import { Engine } from "vsn";
import { registerTemplates } from "vsn/plugins/templates";
import { registerSanitizeHtml } from "vsn/plugins/sanitize-html";
import { registerMicrodata } from "vsn/plugins/microdata";

const engine = new Engine();
registerTemplates(engine);
registerSanitizeHtml(engine);
registerMicrodata(engine);
```

HTML insertion is sanitized by the engine by default. `registerSanitizeHtml(engine)` is optional and can replace the built-in sanitizer with DOMPurify or a custom sanitizer; `dompurifyConfig` can be used to allow application-specific custom elements. HTML extensions should use `engine.registerHtmlTransformer(transform, { priority })`; lower priorities run first and the returned disposer removes a transformer. Transformers run before the sanitizer.

When Trusted Types is available, HTML output is passed through the engine's Trusted Types policy before it reaches `innerHTML`. Applications using a CSP-managed policy can provide `trustedTypesPolicy` or `trustedTypesPolicyName` through `Engine` options.

Mounted elements and behavior bindings each have a `Lifetime`. Extensions can register teardown work with `onCleanup`, and cleanup runs once when the owning element or behavior unbinds:

```ts
engine.registerBehaviorModifier("resize", {
  onBind: ({ element, onCleanup }) => {
    const update = () => { /* ... */ };
    window.addEventListener("resize", update);
    onCleanup(() => window.removeEventListener("resize", update));
  }
});
```

The same `onCleanup` callback is available to custom attribute handlers and flag handlers. CFS lifecycle code can call `onCleanup(() => { /* ... */ })`; `engine.getLifetime(element)` exposes the inline lifetime directly, and `engine.dispose()` tears down all mounted roots.

Each lifetime also exposes an `AbortSignal`. CFS code can reference the current signal as `signal` and pass it to async APIs so pending work is canceled when its element or behavior unmounts:

```vsn
async load(url) {
  const response = await request(url, { signal });
  result = await response.text();
}
```

The same signal is available as `context.signal` in extension hooks. Async expression bindings ignore completions from disposed lifetimes, and `vsn-get` aborts an active request when its trigger unmounts or a newer request starts. Cancellation errors are treated as normal teardown rather than reported through `vsn:error`.

Plain objects and arrays stored in a scope are observable. Mutating a nested value returned by `scope.get()`—for example, `state.user.name = "Ada"`, `state.items.push(item)`, or `delete state.filters.archived`—emits a path-aware change. `scope.setPath()` remains available for explicit updates and replacing a whole object or array also refreshes nested bindings.

Expression bindings collect the reads they actually perform at runtime. That
means a binding such as `items[selected].label` follows the selected item, and
short-circuit or conditional expressions only react to the branch currently in
use. Replacing a parent object or array still invalidates any reads below it.

Use `batch()` when several state changes belong to one update. Reactive handlers run once after the synchronous callback completes; `engine.batch()` and the CFS `batch(() => { ... })` helper are equivalent conveniences. Synchronous writes from CFS event, lifecycle, and function bodies are batched automatically. An async callback is not held across `await`, so start another batch around a later synchronous update phase when needed:

```ts
import { batch } from "vsn";

batch(() => {
  scope.set("page", 2);
  state.filters.archived = true;
  state.items.push(nextItem);
});
```

Computed state and effects track the scope reads they perform, so derived
values do not need to be maintained manually:

```ts
import { computed, effect } from "vsn";

const completed = computed(scope, (current) => {
  const items = current.get("items") ?? [];
  return items.filter((item: { done: boolean }) => item.done).length;
});

const stop = effect(scope, (current) => {
  current.set("summary", `${completed.value} complete`);
});

stop();
```

Computed values are memoized until one of their reads changes, and effects run
once immediately before reacting to later changes. Both APIs support
`{ lifetime }` for automatic cleanup. A named computed value can be exposed
directly on a scope with `scope.computed("completed", getter)`, making it
available to CFS bindings. Inside CFS, use
`computed("completed", () => ...)` and `effect(() => { ... })`; these helpers
use the current scope and behavior lifetime automatically. Treat computed
results as read-only and keep getters/effects synchronous.

For browser auto-mount, load the root package and any plugin entry points as modules. VSN creates an engine when an element with `auto-mount` is present, applies registered plugins, loads `script[type="text/vsn"]` blocks, and mounts the document body. Behavior scripts may also use `src`; VSN fetches the file and ignores any inline text when `src` is present:

```html
<script type="text/vsn" src="/behaviors/common.cfs"></script>
```

External `.vsn` and `.cfs` files use the same syntax. For library usage, prefer the explicit `Engine` API above.

The [`examples/`](./examples/) directory contains focused cookbook entries for
behaviors, bindings, lifecycle, requests, templates, and accessibility. See
[`examples/README.md`](./examples/README.md) for the feature map.

## CFS syntax

Identifiers may contain hyphens so CSS-style names such as `data-value` remain intact. To subtract numbers, include whitespace around the operator: use `count - 1`, not `count-1`.

Named functions are synchronous unless declared with the `async` keyword. Async named functions return promises and may use `await` in their bodies.
