# CFS

CFS is VSN's behavior language. A CSS selector chooses elements; state declarations, functions, events, and DOM bindings describe how those elements behave. CFS source is parsed by VSN, rather than executed as JavaScript by the browser.

## Inline scripts and external .vsn files

Inline CFS belongs in a `text/vsn` script. Load the browser runtime with `auto-mount` to read the sources and mount the document body:

```html
<section id="counter">
  <strong vsn-bind:from="count">0</strong>
  <button type="button" vsn-on:click="count = count + 1;">Add one</button>
</section>
<script type="text/vsn">
  #counter { count: 0; }
</script>
<script type="module" src="/dist/index.min.js" auto-mount></script>
```

To move that same behavior into an external file, replace the inline behavior script with:

```html
<script type="text/vsn" src="/path/to/some.vsn"></script>
<script type="module" src="/dist/index.min.js" auto-mount></script>
```

Serve `/path/to/some.vsn` as plain CFS source, without HTML script tags:

```cfs
#counter {
  count: 0;
}
```

The loader identifies scripts by `type="text/vsn"`; it does not require a particular filename extension. `.vsn` and `.cfs` both work. It resolves `src` against the document's base URL, fetches each external source, and joins sources in script order before registration and mounting. A script with a nonempty `src` uses the fetched source and ignores its inline text. Serve files over HTTP with a successful response; cross-origin sources need the browser's normal CORS permission.

`autoMount()` reads scripts within its supplied document or element. Startup waits for the sources before mounting; a failed response stops that startup and reports `vsn:mountError` to the console and a bubbling `vsn:error` event on the mount target. The returned engine is available before startup finishes. For awaitable setup, fetch the text yourself, call `engine.registerBehaviors(source)`, then `await engine.mount(root)`; see [Runtime API](/reference/runtime#initialization-and-teardown).

This external-source loading is the initial auto-mount path. When processing trusted dynamic HTML, the runtime reads inline behavior text; it does not fetch fragment scripts' `src` attributes. Untrusted dynamic HTML removes behavior scripts. See [safe dynamic HTML](/guide#safe-dynamic-html).

## Behaviors, state, and scope

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

Each matching root gets a behavior instance and its own state. `name: value;` initializes state; `name = value;` assigns a value during an action. Descendant scopes inherit state; assignments can update an ancestor's existing state. `!as(panel)` gives the owning scope an explicit alias. `self`, `parent`, and `root` refer to the current, parent, and behavior-root scopes. Keep shared state on its owner and use an alias when ownership would otherwise be ambiguous.

Nested selectors select descendants. `&` substitutes the parent selector, so `&.active` targets the parent selector with an additional class. `!group("name")` exposes live nested behavior instances as a collection on their parent. See [the scope guide](/guide#behaviors-and-scopes).

Within a behavior, put declarations first, then construction, functions and event blocks, and finally nested behaviors. The parser requires declarations before executable blocks, `construct` before functions/events, and nested behaviors last. Use semicolons after declarations, assignments, and calls. Hyphenated identifiers are valid: write `count - 1` with spaces to subtract, since `count-1` is an identifier.

## DOM bindings

| Syntax | Direction and purpose |
| --- | --- |
| `@aria-label :< label;` | State to DOM attribute/property |
| `@data-id :> id;` | DOM attribute/property to state |
| `@value := name;` | Two-way form control binding |
| `@checked := selected;` | Two-way checkbox state |
| `@class :< { selected: active };` | Reactive class map |
| `$display :< (visible ? "block" : "none");` | Reactive inline style property |

`@` addresses DOM attributes/properties; `$` addresses styles. `:<`, `:>`, and `:=` specify binding direction. CFS binding expressions can compute a value; HTML attributes such as `vsn-bind` read a scope path. See [HTML attributes](/reference/html#html-directives) and the [bindings example](/play/bindings).

## Functions and events

```cfs
#counter {
  count: 0;

  add(amount) {
    count = count + amount;
    return count;
  }

  on click!prevent() {
    add(1);
  }
}
```

`add(amount) { ... }` declares a synchronous function. Parameters, calls, and `return` let actions share logic. `on event() { ... }` attaches a listener to each behavior element. Append event flags after the event name: `on input!debounce(300)() { ... }` delays execution until the burst stops; `on keyup!escape() { ... }` filters the key. For all flags and equivalent HTML event attributes, see [event flags](/reference/html#event-flags).

`construct { ... }` runs during binding; `destruct { ... }` runs during teardown. Keep resource cleanup with the owning behavior's lifetime. Unmounting removes its event listeners. See [lifecycle](/guide#conditional-ui-and-lifecycle).

## Expressions and control flow

Values include strings, numbers, booleans, `null`, arrays, and objects. Read members with `user.name` or `items[index]`; call functions with `save()`. Arithmetic, comparisons, `&&`, `||`, `??`, `!`, and conditional `test ? yes : no` expressions support everyday state calculations. Arrays, objects, and function calls support spread; assignment supports object/array destructuring. Template literals interpolate values with `${value}`. Tagged `html` templates require the [templates plugin](/reference/plugins).

```cfs
#summary {
  items: [2, 4, 6];
  total: 0;
  status: "";

  calculate() {
    total = 0;
    for (i = 0; i < items.length; i = i + 1) {
      total = total + items[i];
    }
    if (total > 10) {
      status = "Over ten";
    } else {
      status = "Ten or less";
    }
    return total;
  }
}
```

Control flow includes `if`/`else if`/`else`, `while`, counted `for` loops, `for (item of items)`, and `for (key in object)`. Use `break` and `continue` inside loops, and `try { ... } catch (error) { ... }` to handle action failures. In functions and event blocks, assign with `=`; state declarations using `:` belong at a behavior root.

## Async actions and globals

```cfs
use fetch as request;

#profile {
  name: "";
  loading: false;
  error: "";

  async load() {
    loading = true;
    error = "";
    try {
      response = await request("/api/profile");
      if (response.ok) {
        profile = await response.json();
        name = profile.name;
      } else {
        error = "Could not load profile";
      }
    } catch (failure) {
      error = "Request failed";
    }
    loading = false;
  }

  .reload {
    on click() {
      load();
    }
  }
}
```

Declare a function `async` to use `await` in its body. The `/api/profile` endpoint above is supplied by your application and should return a JSON object with a `name` field. `use fetch as request;` resolves a global by name and exposes an alias; it does not import a JavaScript module or fetch a CFS file. Expose application helpers with `engine.registerGlobal()` before mounting. See [runtime globals](/reference/runtime#globals-and-extensions).

## Pipes and DOM queries

```cfs
use JSON as json;

#export {
  data: [1, 2];
  encoded: "";

  encode() {
    encoded = data |> json.stringify;
  }
}
```

`|>` passes a value as the first argument of the next stage. A function reference such as `json.stringify` receives that value as its argument. A call such as `items |> list.filter((value) => value > 1)` becomes `list.filter(items, (value) => value > 1)`. The engine supplies `list` helpers including `filter` and `map`. Async stages can use `|> await` inside an async function.

Queries return arrays of elements: `?(".item")` queries the document, `?>(".item")` queries descendants of the current element, and `?<(".panel")` finds matching ancestors. They are DOM queries rather than behavior-scope aliases. Prefer ordinary selectors and bindings for routine UI; use queries when an action needs actual elements.

Try the [counter](/play/counter-toggle), [tabs](/play/tabs), and [async search](/play/async-search) examples alongside the [Guide](/guide).
