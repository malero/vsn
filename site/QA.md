# Validation report

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
