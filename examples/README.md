# VSN examples

The files in this directory are deliberately small, standalone VSN cookbook
entries. They are intended to show an agent how VSN behaves in real markup,
not to provide a component framework or an application architecture.

## Core examples

| File | Primary ideas |
| --- | --- |
| `counter-toggle.html` | Root state, event handlers, `vsn-bind:from`, and `vsn-show` |
| `tabs.html` | Nested behaviors and reactive ARIA attributes |
| `todo.html` | Forms, two-way binding, arrays, persistence, and `vsn-each` |
| `kanban.html` | Drag events, dynamic HTML, templates, and root scope access |
| `product-filters.html` | Derived display state, filters, HTML, and plugins |

## Cookbook examples

| File | Primary ideas |
| --- | --- |
| `modal.html` | State-driven dialog visibility, Escape, backdrop clicks, and focus restoration |
| `tooltip.html` | Hover/focus events, inherited state, and `aria-describedby` |
| `dropdown.html` | `!outside`, keyboard flags, nested scopes, and reactive selection |
| `form-validation.html` | Two-way form bindings, validation functions, and error attributes |
| `server-request.html` | `vsn-get`, partial swaps, async CFS functions, and request states |
| `fragment-lifecycle.html` | Dynamic `vsn-html`, templates, `construct`, and `destruct` |
| `nested-list.html` | `vsn-each`, item/index scopes, immutable array updates, and root functions |
| `async-search.html` | Debounced input, async functions, `await`, and list helpers |
| `toast-notifications.html` | Temporary state, timers, callbacks, and class maps |
| `accessible-table.html` | Selection state, reactive `checked`/ARIA attributes, and row scopes |
| `templates.html` | The templates plugin and sanitizing interpolated HTML |
| `bindings.html` | `vsn-bind`, `:from`, `:to`, two-way controls, and checked/select values |

## Reading these examples

The examples use the current runtime semantics. In particular, `vsn-if`
conditionally mounts and unmounts elements, `vsn-show` toggles visibility
without removing elements, `vsn-each` reuses rows when a unique `vsn-key` is
provided and recreates them otherwise, and `vsn-get`
swaps HTML fragments and processes new VSN behavior inside explicitly trusted
fragments. Binding attributes resolve scope paths, so dotted
paths such as `result.name` (or `item.0` for an array element) should be used
with `vsn-bind`; bracket indexing belongs in CFS expressions and behavior
declarations. The examples intentionally make those details visible so they can
serve as implementation references and regression fixtures.

The gallery loads the templates and sanitize plugins before mounting VSN. A
standalone page can use the same plugin entry points, or use the explicit
`Engine` API described in the root README.
