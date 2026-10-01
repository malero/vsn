# Get started with VSN.js

Start with a page, give it a little state, and let VSN connect the two. VSN enhances HTML that already exists, using CFS behavior blocks and `vsn-*` attributes. No component renderer required.

## Install

```bash
npm install vsn
```

The package includes JavaScript modules, a CommonJS build, TypeScript declarations, and browser builds. In a bundled application, import from `vsn`. For a plain HTML page, serve the package's `dist/index.min.js` from your own static assets.

The complete page below assumes that file is available at `/dist/index.min.js`. That URL is a file served by your application, not a CDN address. If your asset directory is different, change the script's `src`.

## Your first page

Save this as an HTML page and serve it over HTTP alongside the browser build:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>My first VSN page</title>
  </head>
  <body>
    <main id="counter">
      <h1>A small counter</h1>
      <p>Count: <strong vsn-bind:from="count">0</strong></p>
      <button type="button" vsn-on:click="count = count - 1;">−1</button>
      <button type="button" vsn-on:click="count = count + 1;">+1</button>
      <button type="button" vsn-on:click="active = !active;">
        Toggle status
      </button>
      <p vsn-show="active" hidden>The counter is active.</p>
    </main>

    <script type="text/vsn">
      #counter {
        count: 0;
        active: false;
      }
    </script>
    <script type="module" src="/dist/index.min.js" auto-mount></script>
  </body>
</html>
```

[Run the counter example](/play/counter-toggle), or browse all [17 examples](/examples).

## What just happened?

1. `#counter` selects a behavior root. Its declarations initialize reactive state
2. Descendants inherit that state through their scopes
3. `vsn-bind:from="count"` writes the current count into the element
4. `vsn-on:click` runs CFS when a button is clicked
5. Assignments update dependent bindings; `vsn-show` toggles the native `hidden` state

The module's `auto-mount` setup reads `script[type="text/vsn"]` blocks and mounts the document body. It can also fetch CFS from a script's `src` attribute. To keep behavior source in an external `.vsn` file, replace the inline behavior script with:

```html
<script type="text/vsn" src="/path/to/some.vsn"></script>
```

Keep the runtime module with `auto-mount`. The file contains plain CFS, without script tags. VSN fetches it before mounting; a nonempty `src` takes precedence over inline text. The extension is a naming convention, so `.cfs` also works. See [CFS source loading](/reference/cfs#inline-scripts-and-external-vsn-files) for ordering and error behavior. Put plugin modules before the core module when using [plugins](/reference/plugins).

CFS is a small JavaScript-like language with CSS-like selectors. It is not JavaScript inside a differently named script tag. One particularly useful detail: hyphenated names are valid identifiers, so subtraction needs whitespace. Write `count - 1`, not `count-1`.

## Add a form binding

A plain `vsn-bind` on a form control is two-way. An explicit `:from` binding is a good choice for the display:

```html
<section id="greeting">
  <label>Your name <input vsn-bind="name" /></label>
  <p>Hello, <span vsn-bind:from="name"></span>.</p>
</section>
<script type="text/vsn">
  #greeting {
    name: "Ada";
  }
</script>
```

Add this before the existing core module script. Mount once for the page; each example does not need its own engine.

## Mount explicitly

For a bundled application, create an engine, register the behavior source, and await mounting:

```js
import { Engine } from "vsn";

const engine = new Engine();
engine.registerBehaviors(`
  #counter {
    count: 0;
    active: false;
  }
`);
await engine.mount(document.getElementById("counter"));
```

Run this after the markup exists, and omit the `auto-mount` script when taking this route. `mount()` does not perform the auto-loader's source fetching for you: supply the CFS to `registerBehaviors()` yourself. Use `engine.dispose()` when tearing down the engine.

For server-rendered content with serialized client state, see [hydration](/guide#server-rendering-and-hydration). For signatures and options, see the [Engine reference](/reference#engine).

## Where next?

- [Guide](/guide): scopes, events, forms, lists, requests, and lifecycle
- [Reference](/reference): HTML directives, CFS syntax, and public JavaScript APIs
- [Examples](/examples): small runnable pages you can inspect and adapt
