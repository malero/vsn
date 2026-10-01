# HTML attributes

HTML attributes connect existing markup to behavior state. See [CFS](/reference/cfs) for selectors and actions, or [the Guide](/guide) for complete interactions.

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

