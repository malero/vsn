# VSN TODOs

This is a working roadmap for making VSN easier to scale without losing its
HTML-first, selector-driven character. The priority labels are directional:

- **P0**: reliability, correctness, and security foundations
- **P1**: features that make larger applications pleasant to build
- **P2**: ecosystem, tooling, and performance improvements

## P0 — Runtime foundations

- [x] Make reactivity reliable for nested objects and arrays using observable
  proxies while retaining the explicit `setPath()` update API.
- [x] Add `batch()`/transaction support so several state writes produce one
  reactive flush.
- [x] Add first-class computed/derived state and effects instead of requiring
  users to manually maintain values such as counts, filtered lists, and
  summaries.
- [x] Replace static-only dependency discovery with a more precise dependency
  model, including dynamic indexes and conditional reads.
- [x] Add a unified lifetime/disposer API for watchers, event listeners,
  timers, observers, dynamic behavior registrations, and plugin resources.
- [x] Add `AbortSignal`/cancellation support for async functions, bindings,
  and network requests; prevent stale work from mutating unmounted elements.
- [ ] Make HTML insertion safe by default. Keep explicit trusted HTML as an
  opt-in and integrate Trusted Types where available.

## P1 — DOM and application semantics

- [ ] Add keyed `vsn-each` rendering so updates preserve element identity,
  focus, input state, animations, and child behavior.
- [ ] Give `vsn-if` true conditional mount/unmount semantics and keep
  `vsn-show` as visibility-only; document lifecycle behavior for both.
- [ ] Prefer semantic visibility APIs (`hidden`, `aria-hidden`, or an
  equivalent managed attribute) over blindly overwriting `display`.
- [ ] Add transitions and lifecycle hooks for enter/leave behavior.
- [ ] Define an explicit hydration API and document how server state, form
  values, and client behavior interact during hydration.
- [ ] Expand `vsn-get` into a request primitive with methods, bodies, form
  submission, loading/error/data state, cancellation, history, focus
  restoration, and clear non-2xx behavior.
- [ ] Add explicit behavior/module boundaries, namespacing, state-root
  declarations, and collision diagnostics while preserving nested selectors.

## P1 — Reusable behavior library

- [ ] Define a package convention, tentatively `@vsnjs/behaviors`, with a
  stable opt-in selector convention such as `[data-vsn~="dialog"]`.
- [ ] Specify a behavior contract: required markup, state names, attributes,
  emitted events, keyboard behavior, accessibility expectations, and cleanup
  guarantees.
- [ ] Make raw, versioned `.cfs` files the primary public behavior-library
  artifact, loadable with `script[type="text/vsn"] src="..."`.
- [ ] Keep each behavior as a small, readable `.cfs` source module, with
  TypeScript adapters only where browser APIs or custom flags are needed.
- [ ] Provide optional ESM convenience helpers such as
  `registerDialog(engine)`, `registerTabs(engine)`, and `registerAll(engine)`.
- [ ] Build initial behaviors for disclosure/accordion, dialog, dropdown/menu,
  tabs, roving focus, focus trap, toast, tooltip/popover, sortable lists, and
  form validation.
- [ ] Add fixture-based tests for mouse, keyboard, ARIA state, focus
  restoration, dynamic insertion, fragment replacement, and teardown.
- [ ] Publish individual `.cfs` assets, an opt-in `all.cfs` bundle, and
  browser-friendly ESM helpers; avoid forcing applications to load every
  behavior.
- [ ] Document npm/static-copy, CDN, and external `script[type="text/vsn"]`
  installation paths, including CORS and CSP requirements.
- [ ] Add a behavior catalog with markup contracts, examples, accessibility
  notes, and copy/paste starter templates.

## P2 — Tooling and observability

- [ ] Create syntax highlighting, formatting, and language-server support for
  CFS and embedded `text/vsn` blocks.
- [ ] Add static diagnostics for unknown identifiers, invalid directives,
  selector collisions, unsafe HTML, unreachable code, and invalid lifecycle
  usage.
- [ ] Add devtools for inspecting matched behaviors, specificity/order,
  scopes, watchers, current values, and event execution.
- [ ] Add source locations/source maps to runtime errors from external `.cfs`
  files and inline behavior blocks.
- [ ] Add parser fuzz/property tests and browser integration tests for shadow
  roots, multiple documents, focus behavior, and mutation-heavy pages.
- [ ] Fix the current `npm run typecheck` failures in test files or separate
  production typechecking from test typechecking in the project scripts.

## P2 — Performance and packaging

- [ ] Index behaviors by selector features instead of scanning the complete
  behavior registry for every element and mutation.
- [ ] Add a scheduled reactive flush and benchmark large DOMs, fragment swaps,
  and repeated list updates.
- [ ] Consider compiling cached ASTs into a compact instruction form while
  retaining the safe evaluator model.
- [ ] Support mounting `ShadowRoot`/`DocumentFragment` roots where practical.
- [ ] Document versioning and compatibility rules for behavior packages,
  plugins, custom flags, and CFS syntax.
