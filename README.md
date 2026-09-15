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

Inline attributes include `vsn-bind`, `vsn-if`, `vsn-show`, `vsn-html`, `vsn-each`, `vsn-get`, and `vsn-on:<event>`. `vsn-if` and `vsn-show` are currently visibility-only aliases: both toggle `display` without removing the element from the DOM. `vsn-get` sends htmx-compatible partial-request headers: `HX-Request`, `HX-Current-URL`, and, when available, `HX-Target`, `HX-Trigger`, and `HX-Trigger-Name`.

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

HTML extensions should use `engine.registerHtmlTransformer(transform, { priority })`; lower priorities run first and the returned disposer removes a transformer. The templates transformer runs before sanitization. The sanitizer uses DOMPurify when available; its fallback is intentionally minimal and is not a substitute for a full sanitizer for hostile HTML.

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
