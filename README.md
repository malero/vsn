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

When the root already contains server-rendered VSN markup, use the explicit
hydration entry point instead:

```ts
const engine = new Engine();
engine.registerBehaviors(`
  behavior #app {
    count: 0;
  }
`);

await engine.hydrate(document.body, {
  state: (globalThis as any).__VSN_STATE__ ?? {}
});
```

`hydrate()` copies `state` into the root scope before behavior declarations and
construct hooks run. Supplied state wins over behavior initializers. If a state
path is not supplied, existing server text, HTML, `hidden` state, and mounted
`vsn-if` elements are preserved until client code initializes that path;
initial `vsn-enter` hooks and transitions are not replayed for already-rendered
conditional elements. Behaviors still bind normally, including construct hooks
and event handlers.

For bindings, a supplied value wins for an automatic `vsn-bind`. Without a
supplied value, a non-empty server-rendered control or display value seeds the
scope before behavior defaults run. Use `vsn-bind:to` when the element should
be the source of truth, and `vsn-bind:from` when the scope should be the source
of truth. Hydration expects the root DOM to match the server output; it does not
infer ownership of arbitrary nodes around a `vsn-each` template.

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

`construct` runs when a behavior binds and `destruct` runs when it unbinds. `self`, `parent`, and `root` address the current, parent, and behavior-root scopes. Each top-level behavior starts an independent behavior tree, while nested selectors retain the parent tree's `root` scope.

Use `!as(name)` to give a behavior's scope a stable name that is visible to
that behavior and its nested descendants. The alias is a binding,
not writable state: `dialog.open = true` updates the named behavior's state,
but assigning `dialog = otherValue` is a scope collision. Use
`!group("name")` on a nested behavior to add a live proxy for that child to
the exact parent behavior scope. Groups are useful for parent-to-child calls
and collection operations:

```vsn
behavior .dialog !as(dialog) {
  open: false;

  on click() {
    dialog.open = panels.length > 0;
  }

  .panel !group("panels") {
    refresh() { }
  }
}
```

Aliases and groups must use simple scope names. Reusing a visible state or
alias name is reported as a scope collision instead of silently overwriting
the existing binding. Named functions are synchronous unless declared `async`;
async functions return promises and may use `await`.

Inline attributes include `vsn-bind`, `vsn-if`, `vsn-show`, `vsn-text`, `vsn-html`, `vsn-each`, `vsn-get`, `vsn-transition`, `vsn-enter`, `vsn-leave`, and `vsn-on:<event>`. `vsn-text` writes literal text with `textContent`; `vsn-html` sanitizes HTML by default, while `vsn-html!trusted` explicitly bypasses sanitization. Untrusted HTML never activates VSN behavior scripts or `vsn-*` attributes. `vsn-if` conditionally mounts and unmounts an element, running its lifecycle cleanup and setup each time; `vsn-show` keeps the element mounted and toggles the native `hidden` state without overwriting inline display styles.

### Requests

`vsn-get` is a request trigger as well as a partial HTML swap. It sends
htmx-compatible headers (`HX-Request`, `HX-Current-URL`, and, when available,
`HX-Target`, `HX-Trigger`, and `HX-Trigger-Name`) and supports methods, request
bodies, forms, request state, history, and focus restoration:

```html
<form
  vsn-get="/api/search"
  method="post"
  vsn-target="#results"
  vsn-loading="request.loading"
  vsn-error="request.error"
  vsn-data="request.data"
>
  <input name="query" value="vsn" />
  <button type="submit">Search</button>
</form>

<button
  vsn-get="/api/items"
  vsn-method="POST"
  vsn-body="payload"
  vsn-headers="headers"
  vsn-swap="none"
>
  Save
</button>
```

On a form, `vsn-get` uses the form's `action` and `method` when explicit
attributes are not supplied. GET and HEAD forms become query parameters;
other methods use `FormData`, including the clicked submitter. A button can use
`vsn-get!form` to submit its containing form or `vsn-form="#filters"` to select
another form. `vsn-body` and `vsn-headers` resolve a scope path first, then a
JSON literal, and finally a plain string. Object bodies default to JSON and
`vsn-swap="none"` makes a request data-only.

`vsn-loading` is set to `true` while the request is active and `false` when it
finishes. `vsn-error` receives an error message (or `""` after a new request)
and `vsn-data` receives the response text on success. Data is cleared while a
new request is active and after a failure. These state attributes are opt-in;
VSN does not create state paths when they are omitted.

Use `vsn-history="push"` or `vsn-history="replace"` (or the `!push` and
`!replace` modifiers) to update browser history after a successful request.
`vsn-history-url` overrides the URL written to history. Use `vsn-focus` with a
CSS selector, or the `!focus` modifier, to restore focus after a successful
swap. `!load` starts the request when the element mounts and `!trusted` permits
trusted HTML behavior processing, subject to the same explicit trust rules as
`vsn-html!trusted`.

Non-2xx responses reject as `RequestError`, do not swap HTML, and do not update
history or focus. They update `vsn-error` when configured and dispatch
`vsn:getError` with the error, response, status, and status text. Requests are
aborted when their trigger unmounts or a newer request starts. The equivalent
programmatic API is `engine.request(element, config)`, which returns the
response, response text, target, and whether a swap occurred.

`vsn-each` renders the content of a `<template>` once per array item. Add `vsn-key` to reuse rows across list updates and preserve their DOM identity, focus, form state, animations, and child behaviors:

```html
<template vsn-each="users as user, index" vsn-key="user.id">
  <li><input vsn-bind="user.name" /></li>
</template>
```

The key expression is evaluated in each item scope. Keys must be unique and
must not be `null` or `undefined`; omit `vsn-key` when index-based rendering is
acceptable.

Conditional transitions are opt-in with `vsn-transition` on a `vsn-if`
element. For `vsn-transition="fade"`, VSN applies `fade-enter`,
`fade-enter-active`, and `fade-enter-to` during entry, and the corresponding
`fade-leave` classes during exit. The transition ends on `transitionend` or
`animationend`, with a computed-duration fallback. `vsn-enter` and `vsn-leave`
run CFS lifecycle code when each phase starts; `vsn-destruct` runs after a leave
transition completes. Reopening an element during leave cancels the leave and
starts a fresh enter phase:

```html
<div
  vsn-if="open"
  vsn-transition="fade"
  vsn-enter="entered = true;"
  vsn-leave="leaving = true;"
>
  Dialog content
</div>
```

```css
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 150ms ease;
}
```

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

Custom attribute handlers and behavior modifier hooks receive `hydrating: true`
while they are attached by `hydrate()`.

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

### Behavior libraries

The first-party behavior library convention is `@vsnjs/behaviors`. A library
behavior opts in through a namespaced CSS class: `.vsn-<name>`, using a
lowercase kebab-case name such as `.vsn-dialog` or `.vsn-tabs`. The class is
the behavior's public activation hook as well as a styling hook; no custom
element registration or `data-vsn` attribute is required.

Reusable behavior packages publish raw CFS modules under `cfs/` and keep one
behavior per file:

```text
@vsnjs/behaviors/
  cfs/
    dialog.cfs
    tabs.cfs
```

A module should select its public root class directly:

```cfs
behavior .vsn-dialog !as(dialog) {
  open: false;

  on click() {
    dialog.open = !dialog.open;
  }
}
```

Applications opt in by loading only the modules they use. `text/vsn` scripts
may point at an npm-copied asset, a static asset, or a CDN URL:

```html
<script
  type="text/vsn"
  src="/node_modules/@vsnjs/behaviors/cfs/dialog.cfs"
></script>

<section class="vsn-dialog">
  <button type="button">Toggle</button>
</section>
```

The class prefix reserves `vsn-` for first-party behaviors. Independent
behavior packages should use their own stable prefix (for example,
`.acme-dialog`) and can use the same `script[type="text/vsn"]` loading path.
Loading a `.cfs` file is opt-in: an element without its public class does not
match the behavior, and applications do not need to load unrelated modules.
Every published behavior should follow the [behavior contract](./behaviors/CONTRACT.md),
including its markup, state, events, keyboard, accessibility, and cleanup
guarantees.

The [`examples/`](./examples/) directory contains focused cookbook entries for
behaviors, bindings, lifecycle, requests, templates, and accessibility. See
[`examples/README.md`](./examples/README.md) for the feature map.

## CFS syntax

Identifiers may contain hyphens so CSS-style names such as `data-value` remain intact. To subtract numbers, include whitespace around the operator: use `count - 1`, not `count-1`.

Named functions are synchronous unless declared with the `async` keyword. Async named functions return promises and may use `await` in their bodies.
