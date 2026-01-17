Design Document
1. Project Vision
Cascade Functioning Sheets (CFS) is a declarative DSL for the DOM that applies logic and state to elements using CSS-style selectors. It aims to replace heavy framework boilerplate with a "logic layer" that feels like CSS.

Primary Goal: To decouple logic from HTML structure.

Design Philosophy: The "Logic Cascade." State and behaviors should flow down the DOM tree, respecting selector specificity.

2. Core Architecture
The system is divided into three distinct phases to ensure a small memory footprint and high performance.

A. The Parser (Static)
Input: A string of CFS code.

Process: Tokenizes and builds an Abstract Syntax Tree (AST).

Output: A Registry of BehaviorNodes grouped by selector.

Constraint: Use a Recursive Descent Parser (no substring() calls; use a pointer).

B. The Runner / Binder (Reactive)
Process: Uses a MutationObserver to watch the DOM.

Logic: When an element is added or a class changes:

Match the element against the Registry.

Calculate Specificity Score (ID > Class > Element).

Instantiate and bind behaviors in order of specificity.

C. The Scope Tree (Runtime)
Logic: Each bound element gets a Scope.

Cascade: If a variable is not found in the local scope, it lookups the DOM tree to the parent element's scope.

3. The Grammar (CFS Syntax)
Behaviors
Replaces class. Supports nested selectors (similar to SCSS).

CFS / Cascade Functioning Sheets

<script type="text/vsn">
behavior .card {
    active: false !important;
    count: 0;
    @aria-pressed : active;
    @aria-pressed := active;
    $background-color :< theme.cardBg;
    @data-id :> id;

    construct {
        // run once per element
    }

    destruct {
        // cleanup
    }

    on click() {
        active = !active;
    }

    behavior > .btn-close {
        on click() { active = false; }
    }
}
</script>

Directives
@attr: References an element attribute (e.g., @disabled, @value).
$style: References a CSS style (e.g., $display, $background-color).

?>(selector): Scoped DOM query.

Binding Operators
':' default/one-time set
':=' two-way binding
':<' read-only binding
':>' write-only binding

Modifiers
- !important: prevents more specific selectors from overriding state or attributes.
- !trusted: allows unsafe HTML insertion + behavior parsing; defaults to sanitized/no-behavior.

4. Specificity & Merging
When multiple behaviors target one element, CFS applies the Conflict Resolution Rules:

Event Listeners: All matching on [event] blocks are registered (Cumulative).

State Initialization: The most specific selector defines the initial value of a state variable (Override).

Important Flag: Use !important to prevent more specific selectors from overriding state or attributes.
Trusted Flag: Use !trusted for @html insertion to bypass sanitizer and enable behavior parsing.

Specificity Implementation (Planner)
- Compute selector specificity score (id > class/attr > element).
- Merge order: inline vsn-* declarations first (highest), then behaviors by specificity, tie-break by source order.
- Merge strategy: state init and one-time bindings use override; events are cumulative; bindings re-evaluate on change.

Declaration Zone
- Top-level declarations (state + bindings) must appear before construct/destruct/on/behavior blocks.
- Declarations are only recognized at the behavior root, not inside construct/on.

5. Technical Requirements for the Agent
I. Use a Token Stream
The agent must implement a Lexer that produces a stream of tokens and a Parser that consumes them via peek() and next() to avoid memory bloat.

II. AST Node Structure
Every Node must implement a standard interface:

TypeScript

interface CFSNode {
    type: string;
    prepare(context: ExecutionContext): Promise<void>;
    evaluate(context: ExecutionContext): Promise<any>;
}
III. MutationObserver Strategy
Instead of manual polling, the agent should implement a centralized DOMObserver that debounces matches to prevent layout thrashing.

6. Feature "Kill List" (What NOT to build)
To keep the library under 50KB:

No XHR/Custom Networking: Use native fetch.

No Explicit Type Casting: No int, float, or bool keywords.

No vsn-name: Reference by standard DOM selectors only.

No vsn-controller: Everything is a behavior.

7. Future "Joke" Extensions (The April Fool's Layer)
@media logic: Different behaviors based on screen size.

@keyframes for logic: Sequential state changes over time.

Conditional Blocks (Future-Proofing)
- Reserve @when (expr) { ... } for conditional behavior activation.
- @media can be implemented as a specialized @when using matchMedia.

8. Scopes & Access Rules
- Scope lookup: local -> parent -> root.
- One scope per element. All matching behaviors merge into that scope.
- Inline element declarations (vsn-*) are most specific, then behaviors by selector specificity (tie-break by source order).
- Assignments inside construct/on are local to that block; they do not create new state vars.
- No direct method or state access outside the current nested behavior tree.
- Cross-behavior communication uses events, not direct calls.

9. Attribute Compatibility Layer
- Any vsn-* attribute implicitly creates/attaches a behavior to that element.
- This keeps scope/variable rules consistent with explicit behaviors.
- Core attributes to support: vsn-on:*, vsn-bind, vsn-if, vsn-show, vsn-html, vsn-get, vsn-target, vsn-swap.
- !trusted on vsn-html/vsn-get allows unsafe HTML insertion + behavior parsing.
- Defer/deprecate: list/template, controller/model/service, exec/script.

10. Timing & Modifier Controls
- Use ! flags for modifiers (ex: !important, !trusted, !debounce(50)).
- !debounce without args uses default interval (200ms).

11. Grammar Rules
- Declaration zone is top of behavior body only (state + bindings).
- After first construct/destruct/on/behavior block, no more declarations.

12. Binding Semantics
- ':' one-time set (expression -> target).
- ':=' two-way binding, initial sync scope -> target, then listen both ways.
- ':<' read-only binding (scope -> target).
- ':>' write-only binding (target -> scope).
- !debounce applies to the incoming side of the binding.

13. Scope Access Syntax
- Prefer explicit self/parent/root keywords.
- Allow parent.parent chains for clarity; avoid implicit this.
- root resolves to the root element of the current behavior tree (not document root).

14. Lifecycle Ordering
- Create scope.
- Apply declarations (state + bindings setup).
- Run construct.
- Register on handlers.
- Destruct runs on unbind/removal.

15. Security Policy
- @html is sanitized by default; !trusted bypasses sanitizer.
- Behavior parsing in injected HTML only allowed with !trusted.
- Document CSP guidance (no unsafe-inline).

16. Lists & Templates (Open)
- Omit list/repeat features in core v1; rely on server-rendered HTML (htmx-style).
- Keep list/repeat as an optional extension in a separate package.

17. Engine & Execution Context
- VSN Engine instance owns registries, observers, caches, and schedulers (no static singletons).
- BehaviorRegistry maps selector -> behavior AST nodes.
- BehaviorRunner uses MutationObserver to detect changes and bind/unbind behaviors.
- ScopeTree: one scope per element with parent pointer (DOM tree).
- ExecutionContext passed into prepare/evaluate (no global meta object).
- Behaviors are data-only; Engine binds them to elements and invokes construct/destruct.

18. Behavior Registry & Caching
- Hash normalized behavior AST for caching.
- Cache AST by hash; bind per scope/element.

19. Error & Reporting
- Syntax errors include line/column and snippet.
- Runtime errors include element path/selector context.
- Fail soft in DOM: warn and skip behavior instead of crashing.

20. Flag Handling
- Parse flags into normalized data: flags set + args map.
- Store flags on AST nodes for declarations/bindings.
- !important affects merge/override decisions.
- !trusted affects HTML injection + behavior parsing.
- !debounce affects binding scheduling (default 200ms).

21. Extensibility
- Engine-scoped registries for flags, attributes, behaviors, and tags.
- Custom flags can register parse/apply hooks.
- Custom vsn-* attributes can be added without core changes.
- Keep core minimal (fast, lightweight); richer features live in extensions.

22. Implementation TODOs
- CFS language parity essentials:
  - None right now (keep scope rules simple).

23. Maybes
- `#id` selector expression in CFS (resolve element by id, usable in expressions).
