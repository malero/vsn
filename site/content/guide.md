# Guide

VSN keeps the page as the starting point. Write useful HTML, attach behavior to selected elements, and make the parts that change reactive. This guide explains how those pieces fit together; the [reference](/reference) lists the individual APIs.

## Behaviors and scopes

A CFS behavior uses a CSS selector to find its roots. Declarations initialize state, functions provide actions, and nested selectors attach behavior to descendants:

```cfs
#dialog !as(dialog) {
  open: false;

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
```

Use `!as(name)` when a stable alias makes ownership clearer. `self`, `parent`, and `root` refer to the current, parent, and behavior-root scopes. Nested selectors normally match descendants; `&` substitutes the parent selector, as in `&.active`. A nested behavior can use `!group("name")` to expose its live instances as a collection on its parent behavior.

Scopes inherit from their parents. An assignment can update state owned by an ancestor rather than creating an unrelated local copy. Prefer an explicit alias when several nested behaviors have similarly named state.

CFS supports plain objects and arrays. Mutations to nested reactive values are observable as well as replacing a whole value. Keep expressions readable, and remember the whitespace around subtraction.

## Bindings and form state

Use explicit direction when you know who owns the value:

- `vsn-bind:from="name"`: state writes to the element
- `vsn-bind:to="name"`: the element supplies state
- `vsn-bind="name"`: automatic behavior, including two-way form controls

On display elements, an automatic binding can seed state from existing text during normal mounting or hydration. If the state is already authoritative, `:from` avoids ambiguity.

Binding values are scope paths, such as `profile.name` or `item.0`. Use dotted paths with `vsn-bind`; bracket indexing belongs in CFS expressions. For plain text output, `vsn-text` writes `textContent`. For HTML output, see [safe dynamic HTML](#safe-dynamic-html).

CFS directives express the same direction explicitly:

```cfs
.profile {
  name: "Ada";
  active: false;

  input {
    @value := name;
  }
  .status {
    @class :< { selected: active };
    @aria-label :< name;
  }
}
```

`@` addresses DOM attributes/properties; `$` addresses styles. `:<` means state to element, `:>` means element to state, and `:=` means two-way. Try the [bindings example](/play/bindings) and [form validation example](/play/form-validation).

## Events and actions

Inline event attributes run CFS in the element's scope:

```html
<form vsn-on:submit!prevent="save();">
  <input vsn-bind="name" />
  <button type="submit">Save</button>
</form>
```

Define `save()` in the containing behavior. Functions are synchronous unless declared `async`. CFS event blocks are useful when the behavior should live outside the markup:

```cfs
.profile {
  name: "Ada";
  saved: false;

  save() {
    saved = true;
  }

  on keyup!escape() {
    saved = false;
  }
}
```

Flags specialize event handling. `!prevent` prevents the default action, `!stop` stops propagation, `!once` runs once, and `!outside` listens for an event outside the element. Keyboard and modifier-key flags filter events; `!debounce(300)` delays a burst of input events. See the [event flag reference](/reference/html#event-flags).

Use native controls and meaningful labels first. Then connect ARIA state to the same state driving visibility. The [tabs](/play/tabs), [modal](/play/modal), and [dropdown](/play/dropdown) examples show the surrounding interaction details.

## Conditional UI and lifecycle

Choose the lifetime you need:

- `vsn-show="open"` keeps the element mounted and toggles `hidden`
- `vsn-if="open"` mounts and unmounts it as the condition changes

A conditional element's `construct`, `destruct`, and event cleanup follow its mounted lifetime. Use CFS `construct { ... }` and `destruct { ... }` blocks, or inline `vsn-construct` and `vsn-destruct` attributes, for work tied to binding and unbinding.

Transitions are opt-in:

```html
<div vsn-if="open" vsn-transition="fade">Panel content</div>
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

The runtime applies enter/leave phase classes and waits for a leave before completing removal. `vsn-enter` and `vsn-leave` run CFS hooks when their phases start. Keep the containing state declarations in the owning behavior. See [fragment lifecycle](/play/fragment-lifecycle) for dynamic content and cleanup.

## Lists and row identity

Repeat the contents of a template with `vsn-each`:

```html
<ul>
  <template vsn-each="users as user, index" vsn-key="user.id">
    <li>
      <strong vsn-bind:from="user.name"></strong>
      <span>Row <span vsn-bind:from="index"></span></span>
    </li>
  </template>
</ul>
```

Declare `users` as an array in the owning behavior. Each row receives item and optional index state. A unique, stable `vsn-key` preserves row identity through updates and reorders, including focus, form values, animations, and child behaviors. Without a key, rows are recreated. An array index is usually not the identity you want when reordering.

The [todo](/play/todo), [nested list](/play/nested-list), and [accessible table](/play/accessible-table) examples cover different row structures.

## Requests and partial pages

`vsn-get` connects an element or form to a request and optional HTML swap. A form can submit its fields while existing markup displays request state:

```html
<section id="search">
  <form vsn-get="/search" method="get"
        vsn-target="#results" vsn-swap="inner"
        vsn-loading="loading" vsn-error="error" vsn-data="response">
    <label>Search <input name="query" value="vsn" /></label>
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

Your server supplies `/search`. `vsn-swap="none"` makes a data-only request. Other options cover methods, headers, bodies, form selection, history, and focus restoration; see [request directives](/reference#request-directives). A non-2xx response does not swap HTML and dispatches `vsn:getError`.

For custom workflows, use an async CFS function:

```cfs
use fetch as request;

.profile {
  name: "Ada";

  async load() {
    response = await request("/api/profile");
    name = await response.text();
  }
}
```

`use` resolves an available global; it is not a package import. Custom fetch workflows should handle response status and failure according to the application's needs. Explore [server requests](/play/server-request) and [async search](/play/async-search).

## Safe dynamic HTML

`vsn-html` and request swaps sanitize untrusted HTML by default. Untrusted fragments do not activate scripts or `vsn-*` behavior attributes. Prefer text bindings for text, and keep executable behavior in application-owned markup.

Explicit trust is for fragments under your application's control:

```html
<button type="button" vsn-get!trusted="/trusted/fragment"
        vsn-target="#panel">Load fragment</button>
<div id="panel"></div>
```

Trusted fragments can contain VSN behavior scripts, which the engine processes. Trust is a security boundary, not a convenient way to make a sanitizer complaint disappear. Never use it for arbitrary user-supplied content.

The [templates plugin](/reference/plugins) adds the `html` tagged template for composing HTML in CFS. The sanitize plugin configures the sanitizer, including DOMPurify when available. Neither makes untrusted executable behavior safe merely by existing.

## Server rendering and hydration

Serve semantic HTML, initial text, and form values from the server. The ordinary auto-mount path enhances those elements in place. For an explicit hydration path, register your behavior source and pass the serialized state to `hydrate()`:

```js
import { Engine } from "vsn";

const engine = new Engine();
engine.registerBehaviors("#profile { name: 'Ada'; }");
await engine.hydrate(document.getElementById("profile"), {
  state: { name: "Grace" }
});
```

Hydration preserves existing server-rendered values when a client state path has not been initialized. Provided state is applied to the mounted root scope. Use either explicit initialization or automatic mounting for the same page; do not mount it twice hoping for extra reactivity.

## Reusable behaviors

A reusable behavior needs a clear markup contract: selectors, expected state, emitted events, accessibility requirements, and cleanup. Keep one CFS behavior per module and use a stable namespaced class:

```html
<section class="acme-dialog">
  <button class="acme-dialog__trigger" type="button">Toggle</button>
  <div class="acme-dialog__panel" vsn-show="open">Content</div>
</section>
<script type="text/vsn" src="/behaviors/dialog.vsn"></script>
```

The external `.vsn` file supplies plain CFS source. The loader also accepts `.cfs`; see [inline and external sources](/reference/cfs#inline-scripts-and-external-vsn-files). Reserve the `vsn-` class prefix for first-party behavior libraries. Continue to the [reference](/reference) for extension points, or use the [examples](/examples) as small implementation starting points.
