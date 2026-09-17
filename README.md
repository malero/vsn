# VSN

VSN is an HTML-first JavaScript/TypeScript framework for server-rendered
pages. It adds state, events, bindings, conditional rendering, lists, and
requests to HTML that already exists. There is no component renderer to learn
and no virtual DOM to keep in sync: your markup is the starting point, and CFS
behavior makes it reactive.

The important idea is this:

> Write the HTML first, put behavior in a `script[type="text/vsn"]` block next
> to it, and mount VSN once.

## Install

```bash
npm install vsn
```

## A complete page

The usual browser setup has three parts.

### 1. Server-rendered HTML

```html
<main id="counter">
  <h1>Counter</h1>

  <p>Count: <strong vsn-bind:from="count">0</strong></p>

  <button type="button" vsn-on:click="count = count - 1;">−1</button>
  <button type="button" vsn-on:click="count = count + 1;">+1</button>
  <button type="button" vsn-on:click="active = !active;">Toggle status</button>

  <p vsn-show="active">The counter is active.</p>
</main>

<script type="text/vsn">
  #counter {
    count: 0;
    active: false;
  }
</script>

<script type="module" src="/src/main.ts"></script>
```

### 2. One small JavaScript entry point

```ts
// src/main.ts
import { autoMount } from "vsn";

autoMount();
```

`autoMount()` finds the `text/vsn` blocks in the document, registers their
behaviors, and mounts the document body. It returns the `Engine` if the
application needs to inspect or dispose it later.

If the application mounts a smaller root, pass it explicitly:

```ts
import { autoMount } from "vsn";

const root = document.querySelector("#app");
if (root instanceof HTMLElement) {
  autoMount(root);
}
```

With a static server, copy or serve the built browser file and add the
`auto-mount` attribute to that module:

```html
<script type="module" src="/assets/vsn.min.js" auto-mount></script>
```

## How the example works

The CFS block selects `#counter`, so that element becomes the behavior root.
Its declarations (`count` and `active`) are reactive state in that root's
scope. Descendants inherit the scope.

- `vsn-bind:from="count"` writes scope state into the element.
- `vsn-on:click="..."` runs CFS when the button is clicked.
- `vsn-show="active"` toggles the element's native `hidden` state while
  keeping it mounted.
- Assigning `count` or `active` automatically updates every dependent binding.

`script[type="text/vsn"]` contains CFS, not JavaScript. CFS uses CSS-like
selectors for behavior roots and a small JavaScript-like language for state,
functions, expressions, and control flow.

## CFS behaviors

The `behavior` keyword is optional. These two forms are equivalent:

```cfs
#counter {
  count: 0;
}
```

A behavior can contain state declarations, lifecycle blocks, functions, event
handlers, and nested selectors:

```html
<section id="dialog">
  <button class="dialog-toggle" type="button">Open</button>
  <div class="dialog-panel" vsn-show="open">
    Dialog content
  </div>
</section>

<script type="text/vsn">
  #dialog !as(dialog) {
    open: false;

    construct {
      console.log("dialog mounted");
    }

    .dialog-toggle {
      @aria-expanded :< dialog.open;

      on click() {
        dialog.open = !dialog.open;
      }
    }

    .dialog-panel {
      @aria-hidden :< !dialog.open;
    }
  }
</script>
```

Nested selectors match descendants. Use `&` when the nested selector should
replace the parent selector, for example `&.active`.

Useful CFS constructs include:

```cfs
use fetch as request;

.profile {
  name: "Ada";
  saved: false;

  save() {
    saved = true;
  }

  async load() {
    response = await request("/api/profile");
    name = await response.text();
  }

  on keyup!escape() {
    saved = false;
  }
}
```

Named functions are synchronous unless declared `async`. Async functions can
use `await` and return promises. State can contain plain objects and arrays;
nested mutations are observable as well as assignments to a whole value.

### Directives in CFS

Directives connect state to DOM attributes, properties, and styles:

```cfs
@aria-label :< label;                       // scope -> attribute
@data-id :> id;                             // attribute -> scope
@value := name;                             // two-way form binding
@class :< { selected: active };             // reactive class map
$display :< (visible ? "block" : "none"); // reactive style
```

The direction operators mean:

| Operator | Direction |
| --- | --- |
| `:<` | scope to element |
| `:>` | element to scope |
| `:=` | two-way |

`self`, `parent`, and `root` refer to the current, parent, and behavior-root
scopes. `!as(name)` gives a behavior a stable scope alias. A nested behavior
can use `!group("name")` to expose its live instances as a collection on the
parent behavior.

## HTML directives

For simple behavior, keep the logic in the markup and use inline `vsn-*`
attributes:

| Attribute | What it does |
| --- | --- |
| `vsn-bind="name"` | Automatic binding; use an explicit direction when ownership matters. |
| `vsn-bind:from="name"` | Writes scope state to a display element or control. |
| `vsn-bind:to="name"` | Reads an element or control into scope state. |
| `vsn-text="message"` | Writes text with `textContent`. |
| `vsn-html="markup"` | Writes HTML through the configured sanitizer. |
| `vsn-if="visible"` | Mounts and unmounts the element as the condition changes. |
| `vsn-show="visible"` | Toggles `hidden` without unmounting the element. |
| `vsn-on:event="..."` | Runs CFS in response to a DOM event. |
| `vsn-construct="..."` | Runs CFS when the element binds. |
| `vsn-destruct="..."` | Runs CFS when the element unbinds. |
| `vsn-each="items as item, index"` | Repeats a `<template>` for an array. |
| `vsn-get="/url"` | Fetches a response and optionally swaps it into the page. |

For form controls, `vsn-bind` is two-way. For display elements it can seed
state from existing text during normal mounting or hydration. Prefer
`:from`, `:to`, and `:=` when the direction should be obvious to a reader.

Event flags can be added after `!`:

```html
<form vsn-on:submit!prevent="save();">
  <input vsn-bind="name" />
  <button type="submit">Save</button>
</form>

<button vsn-on:click!once="notify();">Notify once</button>
<input vsn-on:input!debounce(300)="search();" />
```

Built-in flags include `prevent`, `stop`, `self`, `outside`, `once`,
`passive`, `capture`, `debounce`, modifier keys, keyboard keys such as
`enter` and `escape`, and viewport flags such as `minwidth` and `maxwidth`.

## Lists and conditional UI

Repeat a template with `vsn-each`. A unique `vsn-key` preserves row identity,
focus, form values, animations, and child behaviors when the array is reordered
or updated:

```html
<ul>
  <template vsn-each="users as user, index" vsn-key="user.id">
    <li>
      <strong vsn-bind:from="user.name"></strong>
      <span>#<span vsn-bind:from="index"></span></span>
    </li>
  </template>
</ul>
```

`vsn-if` really mounts and unmounts its element, so `construct`, `destruct`,
and event cleanup run for each lifecycle. `vsn-show` leaves the element in the
DOM and toggles `hidden`.

Transitions are opt-in:

```html
<div
  vsn-if="open"
  vsn-transition="fade"
  vsn-enter="entered = true;"
  vsn-leave="leaving = true;"
>
  Panel
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

## Requests and partial HTML

`vsn-get` is a request trigger and an HTML swap primitive. It supports forms,
methods, request bodies, headers, loading/error/data state, history, focus
restoration, and cancellation:

```html
<section id="search">
  <form
    vsn-get="/search"
    method="get"
    vsn-target="#results"
    vsn-swap="inner"
    vsn-loading="loading"
    vsn-error="error"
    vsn-data="response"
  >
    <input name="query" value="vsn" />
    <button type="submit">Search</button>
  </form>

  <p vsn-show="loading">Loading…</p>
  <p vsn-show="error" vsn-text="error"></p>
  <div id="results">Results appear here.</div>
</section>

<script type="text/vsn">
  #search {
    loading: false;
    error: "";
    response: "";
  }
</script>
```

Responses are sanitized by default. A non-2xx response does not swap HTML and
dispatches `vsn:getError`. Add `!trusted` only for a response that is under
the application's control:

```html
<button
  type="button"
  vsn-get!trusted="/trusted/fragment"
  vsn-target="#panel"
>
  Load fragment
</button>
```

Trusted fragments may contain VSN behavior scripts and are processed by the
engine. Untrusted fragments do not activate scripts or `vsn-*` attributes.

## Server rendering and hydration

Use `hydrate()` when the application owns the server-rendered state and needs
to attach behavior without treating the existing DOM as a fresh client render:

```ts
import { Engine } from "vsn";

const engine = new Engine();
engine.registerBehaviors(`
  behavior #app {
    count: 0;
  }
`);

const root = document.querySelector("#app");
if (!(root instanceof HTMLElement)) {
  throw new Error("#app was not found");
}

await engine.hydrate(root, {
  state: { count: 3 }
});
```

Hydration applies the supplied state before behavior declarations and
`construct` hooks. Existing server-rendered text, HTML, and form values are
preserved when the corresponding client state is not supplied. Use either
`autoMount()` or an explicit `Engine`, not both for the same root.

## Plugins

Plugins are opt-in package subpaths.

For an explicit engine:

```ts
import { Engine } from "vsn";
import { registerTemplates } from "vsn/plugins/templates";
import { registerSanitizeHtml } from "vsn/plugins/sanitize-html";
import { registerMicrodata } from "vsn/plugins/microdata";

const engine = new Engine();
registerTemplates(engine);
registerSanitizeHtml(engine);
registerMicrodata(engine);

engine.registerBehaviors(behaviorSource);
await engine.mount(document.body);
```

The templates plugin adds the `html` tagged template for composing HTML in
CFS. The sanitize plugin replaces the engine's default sanitizer with a
configured sanitizer (including DOMPurify when available). The microdata
plugin adds the `!microdata` behavior modifier and the `microdata()` helper.

For auto-mount, import plugin entry points before calling `autoMount()`:

```ts
import { autoMount } from "vsn";
import "vsn/plugins/templates";
import "vsn/plugins/sanitize-html";

autoMount();
```

## Explicit engine API

The `Engine` API is useful for tests, embedded widgets, custom bootstrapping,
and applications that keep CFS outside the HTML document:

```ts
import { Engine } from "vsn";

const engine = new Engine({ diagnostics: true });
engine.registerBehaviors(behaviorSource);

await engine.mount(root);
// await engine.hydrate(root, { state });

engine.unmount(child);
engine.dispose();
```

`Engine.mount()` attaches VSN to a root; it does not discover behavior source
blocks. `autoMount()` is the convenience API that loads inline or external
`script[type="text/vsn"]` sources first.

Applications and plugins can also use `registerGlobals`,
`registerAttributeHandler`, `registerFlag`, `registerBehaviorModifier`, and
`registerHtmlTransformer`. Attribute, flag, and behavior-modifier callbacks
receive a lifetime and an `AbortSignal`; register cleanup with `onCleanup` so
listeners, timers, and async work stop when the owning element or behavior
unmounts.

## Behavior libraries

Reusable behavior packages should opt in through a namespaced class, keep one
CFS behavior per module, and document the markup contract around it:

```html
<section class="vsn-dialog">
  <button class="vsn-dialog__trigger" type="button">Toggle</button>
  <div class="vsn-dialog__panel" vsn-show="open">Content</div>
</section>

<script type="text/vsn" src="/behaviors/dialog.cfs"></script>
```

The `vsn-` prefix is reserved for first-party behaviors. Independent packages
should use their own stable prefix, such as `.acme-dialog`. See the
[behavior contract](./behaviors/CONTRACT.md) for the required markup, state,
event, accessibility, and cleanup documentation.

## Examples and development

The [examples](./examples/) directory is a runnable cookbook covering
bindings, forms, lists, requests, templates, lifecycle, accessibility, and
more. Its [README](./examples/README.md) maps each example to the feature it
demonstrates.

```bash
npm run build       # build ESM, CommonJS, browser, plugin, and type outputs
npm test            # run the test suite
npm run typecheck   # type-check source and tests
```

For CFS syntax, remember that hyphenated identifiers are supported. To
subtract numbers, put whitespace around the operator: use `count - 1`, not
`count-1`.
