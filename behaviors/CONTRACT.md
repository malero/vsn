# VSN behavior contract

This is the v1 authoring contract for reusable behavior modules. It describes
what a package such as `@vsnjs/behaviors` must document for every behavior so
that its CFS source, markup, CSS, and accessibility behavior can evolve
independently without surprising consumers.

## Module identity

Each behavior has one public root class using the package prefix:

```text
behavior: dialog
root class: .vsn-dialog
source: cfs/dialog.cfs
```

The root selector should match the public class directly. A behavior must not
activate through a broad element selector, an undocumented ancestor, or a
global side effect. A module may use descendant part classes such as
`.vsn-dialog__trigger` and `.vsn-dialog__panel`; those parts are part of the
markup contract and must be documented.

The `vsn-` prefix is reserved for first-party behaviors. Other packages should
choose a stable package-specific prefix, such as `.acme-dialog`.

## Required behavior record

Every published behavior needs a catalog entry containing these fields:

| Field | Requirement |
| --- | --- |
| Name and version | A stable kebab-case name and behavior-library version. |
| Root selector | The exact class that opts an element into the behavior. |
| Required markup | Required element types, part classes, native attributes, and IDs. |
| Optional markup | Optional parts and the behavior when they are omitted. |
| Configuration | Every `data-vsn-<name>-*` or documented `vsn-*` attribute, including defaults. |
| State | Public state names, types, initial values, and whether consumers may write them. |
| Input events | Event type, listening element, keyboard modifiers, and default-action behavior. |
| Output events | Event names, `detail` fields, bubbling, cancelability, and dispatch timing. |
| Keyboard behavior | Supported keys, focus movement, and modifier-key behavior. |
| Accessibility | Required roles, names, relationships, state attributes, and focus rules. |
| Cleanup | Resources owned by the behavior and what `destruct` guarantees. |

## Markup and attributes

- The root class is the only required activation hook. Use native semantic
  elements where they provide the needed behavior; add an ARIA role only when
  native semantics are insufficient.
- Required parts use the behavior's part-class namespace. A behavior must
  state whether a missing part is an error, a no-op, or an optional feature.
- Native HTML and ARIA attributes are the public semantic surface. Use
  `data-vsn-<name>-<option>` for behavior-specific configuration that has no
  native equivalent. Document the accepted values and defaults.
- Use documented VSN directives such as `vsn-show`, `vsn-text`, and
  `vsn-bind` only when their behavior is part of the contract. Do not require
  consumers to add undocumented implementation attributes.
- IDs are required only when needed for an ARIA relationship or an external
  integration. A behavior must document who owns each ID and must not silently
  replace author-provided IDs.
- A behavior may update only the attributes, classes, and properties it owns.
  It must preserve unrelated author markup and classes.

## State and scope

- State names use lower camel case and have deterministic initial values.
- State belongs to the behavior's root scope. Use `!as(name)` when code in a
  nested selector needs a stable reference to that root, for example
  `!as(dialog)` followed by `dialog.open`.
- The behavior record must distinguish internal state from state intentionally
  exposed for consumers to read or write. Consumers should not depend on
  incidental locals or on `parent.parent` chains.
- State changes are the source of truth for rendered state. Derived ARIA,
  visibility, and styling declarations should react to state instead of being
  manually synchronized in several event handlers.

## Events

Input events must be listed with their target and default-action policy. A
behavior should use ordinary bubbling DOM events whenever possible and should
not install a document-wide listener for an element-local interaction.

CFS modules can consume native events directly. The runtime does not define a
generic top-level event-bus helper, so a module that produces output events
should use a TypeScript adapter or another documented integration to call the
element's standard `dispatchEvent()` API.

Output events use the single `dispatch` convention: a `CustomEvent` named
`vsn:<behavior>:<event>`, with a plain-data `detail` object. Unless a behavior's
record says otherwise, output events use `bubbles: true`, `cancelable: false`,
and `composed: false`, and are dispatched from the behavior root after the
state change succeeds. A behavior must not emit an event during initial mount
unless that is explicitly documented.

The event name and every `detail` field are public API. Keep them stable across
patch releases, and document whether a consumer may cancel an action before
the state change or only observe the resulting state.

## Keyboard and focus

- Preserve native keyboard behavior for buttons, links, form controls, and
  other interactive elements. Do not turn a non-interactive element into a
  control without supplying its complete keyboard and focus behavior.
- Document the exact keys and phases used by the behavior. Use `keydown` for
  commands that need to prevent a default action and use the framework's key
  flags consistently.
- Escape behavior must be scoped to the active behavior and must not trap or
  consume unrelated keyboard input.
- When a behavior moves focus, it must document the target, the reason, and
  where focus is restored after close, removal, or unmount.
- Focus must never remain inside content that the behavior hides or removes.

## Accessibility

The behavior record must state the required role, accessible name, and
relationships for every interactive part. State changes must update the
corresponding native or ARIA state, such as `hidden`, `aria-expanded`,
`aria-selected`, `aria-pressed`, or `aria-current`.

Prefer the native `hidden` state for visibility. Never leave focus inside a
hidden subtree, and do not use `aria-hidden="true"` on an element that still
contains the active element. IDs referenced by `aria-controls`,
`aria-labelledby`, or `aria-describedby` must be present, unique, and stable
for the lifetime of the relationship.

## Lifecycle and cleanup

`construct` is for setup after the behavior binds; `destruct` is for releasing
behavior state when it unbinds. Every listener, timer, observer, subscription,
and asynchronous operation owned by a behavior must be tied to the behavior
lifetime with `onCleanup` and, for async work, the current `signal`.

Cleanup must be safe when it runs more than once or after partial setup. It
must remove only resources owned by the behavior, stop stale async work from
writing state, and leave author-owned attributes, classes, and DOM nodes
intact. The same guarantees apply when a matching class is added or removed,
when a trusted fragment is replaced, and when an engine is unmounted.

## Starter template

This is the smallest useful contract-shaped module. A real behavior should
replace `example` with its public name and publish the markup and event table
alongside the source file.

```html
<section class="vsn-example">
  <button
    class="vsn-example__trigger"
    type="button"
    aria-expanded="false"
    aria-controls="example-panel"
  >
    Toggle
  </button>
  <div id="example-panel" class="vsn-example__panel" vsn-show="open">
    Content
  </div>
</section>
```

```cfs
behavior .vsn-example !as(example) {
  open: false;

  on keydown!escape() {
    example.open = false;
  }

  .vsn-example__trigger {
    @aria-expanded :< example.open;

    on click() {
      example.open = !example.open;
    }
  }

  .vsn-example__panel {
    @aria-hidden :< !example.open;
  }
}
```
