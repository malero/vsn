# VSN.js examples

Seventeen small, runnable pages show VSN in real markup. Each one focuses on a few ideas rather than prescribing an application architecture. Open a demo, inspect its behavior, and borrow the part you need.

## Start here

- [Counter and toggle](/play/counter-toggle): root state, click handlers, one-way display bindings, and `vsn-show`
- [Bindings](/play/bindings): automatic bindings, `:from`, `:to`, two-way controls, checkboxes, and selects
- [Tabs](/play/tabs): nested behaviors and reactive ARIA attributes
- [Todo list](/play/todo): forms, two-way state, arrays, persistence, and repeated templates

New to CFS? Read [Get started](/get-started) first, then keep the [reference](/reference) nearby.

## Interaction patterns

- [Modal](/play/modal): state-driven visibility, Escape handling, backdrop clicks, and focus restoration
- [Tooltip](/play/tooltip): hover and focus events, inherited state, and `aria-describedby`
- [Dropdown](/play/dropdown): outside events, keyboard flags, nested scopes, and selection
- [Form validation](/play/form-validation): two-way inputs, validation functions, and error attributes
- [Toast notifications](/play/toast-notifications): temporary state, timers, callbacks, and class maps

These examples connect semantic markup to behavior. Keep labels, keyboard access, focus, and ARIA state together when adapting them. See [events and actions](/guide#events-and-actions).

## Lists and richer UI

- [Kanban](/play/kanban): drag events, dynamic HTML, templates, and root scope access
- [Product filters](/play/product-filters): derived display state, filters, HTML, and plugins
- [Nested list](/play/nested-list): item/index scopes, immutable array updates, and root functions
- [Accessible table](/play/accessible-table): selection state, reactive checked/ARIA attributes, and row scopes

For lists you plan to reorder, use a unique, stable `vsn-key` to preserve identity. See [lists and row identity](/guide#lists-and-row-identity).

## Data and dynamic content

- [Server request](/play/server-request): partial HTML swaps, async CFS functions, and request state
- [Async search](/play/async-search): debounced input, async functions, `await`, and list helpers
- [Fragment lifecycle](/play/fragment-lifecycle): dynamic HTML, templates, construction, and destruction
- [Templates](/play/templates): the templates plugin and sanitizing interpolated HTML

The gallery loads templates and sanitize plugins before mounting VSN. For a standalone page, include the required plugin modules or register them through the [Engine API](/reference#plugins).

## Details worth noticing

- `vsn-if` mounts and unmounts; `vsn-show` keeps elements mounted and toggles `hidden`
- Repeated rows are reused when a unique `vsn-key` is supplied and recreated otherwise
- Binding paths use dots, including `item.0`; bracket indexing belongs in CFS expressions
- Requests can submit forms, expose loading/error/data state, and perform inner, outer, or no swap
- Dynamic VSN behavior activates only inside explicitly trusted fragments
- Conditional transitions are opt-in through `vsn-transition`, with `vsn-enter` and `vsn-leave` hooks

The [Guide](/guide) explains the shared model behind these patterns. The [Reference](/reference) gives the directives and signatures without the sightseeing.
