# Validation report

## Local follow-up: 2026-10-01

The existing SEO implementation was preserved and its saved regression test added as `site/seo_test.go`. CFS now expands to Cascading Function Sheets in its title, description, H1 and first paragraph. Mobile navigation uses one primary dropdown, plus an adjacent contextual dropdown on reference/example pages, while retaining desktop links, the original SVG logo and framework quotes.

Passed on the iMac:

- `go test ./site -count=1`, `go vet ./site` and Go binary build. A temporary writable `GOCACHE` and offline module resolution avoided sandbox cache restrictions; the binary build used `-buildvcs=false`.
- SEO regression checks for all 26 indexable pages: unique titles, descriptions and H1s, homepage positioning, social metadata, fixed HTTPS/www canonicals, query exclusion, sitemap inventory, robots, source/demo noindex and exact Markdown negotiation. Apex redirect tests cover GET/HEAD/POST, escaped paths, queries, local hosts and untrusted forwarded headers.
- `npm test`: 130 files, 288 tests. `npm run build`: runtime, plugins and declarations; original `dist/` files are byte-identical after the build.
- `node site/check-docs.mjs` and `node site/check-dom.mjs`: documented CFS, external `.vsn` loading and homepage counter.
- Served example checks for counter/toggle, tabs and binding interactions.
- `node site/check-navigation.mjs`: all 26 pages plus 404, dropdown destinations and cached/uncached history selection restoration.
- Separate local headless Chrome: rendered metadata and layout on all 26 pages at 320px, representative home/guide/reference/example pages at 375, 768, 850, 851 and 1280px; correct dropdown count, labels, selection, adjacent layout, 44px controls, no horizontal overflow, desktop/sidebar visibility, keyboard focus order, actual dropdown navigation and Back/Forward restoration. The live homepage counter and JavaScript-disabled mobile link fallback also passed, with no browser runtime exceptions.
- `git diff --check`.

Remaining limitations:

- `npm run typecheck` still fails with the pre-existing errors listed below in unchanged TypeScript tests; site changes do not touch those files.
- The built-in browser automation tool failed to initialize. Browser verification used a separate local headless Chrome profile. Native macOS picker selection via injected arrow keys was inconclusive; browser focus, change handlers and real history navigation passed. Physical iOS/Android and other browser engines were not tested.
- No push or deployment was requested. Production DNS, certificates and the live apex redirect have not been verified; the redirect is implemented and tested in the local server.

The original cloud report below is retained as historical context.

Date: 2026-09-30. Base repository: malero/vsn, master.

## Passed

- Official Go toolchain installed into the cloud workspace's temporary tool area
- Go server compiled and started on port 8080
- Actual HTTP requests against the running listener: HTML 200, negotiated Markdown 200 with `Vary: Accept`, unsupported `Accept` 406, legacy redirect 308, missing route 404
- `go test ./site`: four test groups covering all five document routes, 42 legacy topics (both trailing slash forms), 17 play routes, 17 full-screen runner routes, unknown paths, POST rejection, internal Markdown links, exact canonical Markdown identity, and 14 negotiation cases
- `go vet ./site`
- `npm test`: 130 test files, 288 tests passed
- `npm run build`: ESM, CJS, browser bundles, plugins, and declarations built successfully, with no changes to committed dist outputs
- `node site/check-dom.mjs`: real VSN homepage counter initialization, repeated increments, decrements, negative state, and disposal passed in jsdom
- Every CFS code block in the four docs registered with the built Engine; every cookbook link points to an existing example

## Not passed / limitations

- `npm run typecheck` fails on existing TypeScript test errors, including DOMTokenList.values, a MediaQueryList mock, missing node:fs/promises types, fetch mock casts, and AssignmentTarget narrowing. This change does not modify TypeScript source or tests
- Cloud Chromium returned `net::ERR_BLOCKED_BY_CLIENT` for the local preview URL. Browser navigation, live browser interaction, visual screenshots, and mobile viewport QA were therefore not completed. The responsive CSS is implemented but its visual result is not browser-verified
- The Go command listener is reachable from its own command session; this cloud environment does not provide a verified user-accessible preview URL
- Existing cookbook behaviors were preserved; the 17 examples are all routed, but not every individual interaction was manually exercised

## Scope

Validation above was performed before publishing this review branch. No deployment or pull request. Framework TypeScript and existing examples are unchanged. New work is the Go module, `site/`, and a README entry.
