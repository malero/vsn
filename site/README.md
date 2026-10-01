# VSN website

Small server-rendered website and canonical Markdown docs, in the framework repository. No database, JavaScript build system, or frontend router for the docs. The existing VSN build powers the live examples.

## Run

From the repository root, with Go 1.25+ and Node 18.18+:

```sh
npm run site:dev
```

Open http://localhost:8080. Keep this terminal open. Saving Go files, templates, Markdown content, embedded assets, `go.mod`, or `go.sum` automatically rebuilds and restarts the server. Refresh the browser to see changes; this command does not inject browser live reload. Rapid saves are coalesced and builds run one at a time. The last successful server stays running when compilation fails; fix the error and save to retry. You can also type `rs` followed by Enter to rebuild manually.

Press Ctrl+C to stop the watcher and its Go processes and remove temporary binaries. The preview runs in the foreground, with no launchd or background service required. The runner uses only Node built-ins and the Go toolchain; it needs no additional npm dependency or global watcher installation.

For a foreground server without watching:

```sh
npm run site
```

Both commands bind to `127.0.0.1:8080` by default. To choose another address or port:

```sh
npm run site:dev -- -addr 127.0.0.1:8081
```

An occupied port is reported by the Go server; the runner does not stop other processes. Stop the conflicting server or choose another port, then type `rs` to retry. Example HTML and `dist/` files are read directly on requests, so those changes only need a browser refresh. To rebuild the JavaScript runtime, use `npm ci && npm run build`. The committed `dist/` works as-is. You can still run Go directly with `go run ./site -addr 127.0.0.1:8080`.

Run tests with `go test ./site` and `go vet ./site`. With the project Node dependencies installed, use `node site/check-docs.mjs` for documented CFS examples and external `.vsn` loading, and `node site/check-dom.mjs` for the homepage counter. With a preview running, `node site/check-examples.mjs` checks served counter, tabs, and form-binding interactions; pass a URL such as `http://localhost:8081` for a custom port. Use `go build -o vsn-site ./site` for a binary; run it from the repository root, or pass `-root /path/to/vsn`. Markdown, templates, and site assets are embedded in the binary. Restart/rebuild after editing them; example HTML and runtime assets are read from the repository.

## Editing

- `site/content/*.md`: canonical docs and Markdown landing overview
- `site/layout.html`: shared shell and custom visual landing page
- `site/assets/`: responsive CSS and favicon
- `examples/*.html`: the existing 17 runnable recipes, unchanged
- `site/main.go`: routing, rendering, example wrappers, redirects, negotiation

Homepage plus four destinations: `/get-started`, `/guide`, `/reference`, `/examples`. The reference has dedicated `/reference/html`, `/reference/cfs`, `/reference/runtime`, and `/reference/plugins` pages. Existing `/reference#...` bookmarks lead to links into the new sections. The REFERENCE submenu appears within the reference section. The EXAMPLES submenu appears on the gallery and every `/play/{name}` page, links directly to all 17 examples, and highlights the current example. Cookbook pages keep their demos in isolated iframes, with a standalone runner at `/run/{name}`. Their HTML source is displayed on each cookbook page. Example fragments are served under `/examples/raw/` so relative requests work.

At widths up to 850px, the header and sidebar links are replaced by a labeled primary navigation dropdown. Reference and example pages add a second, adjacent dropdown for the current section or example, including its overview. Native selects use full-page navigation; their current selection resets when returning with browser Back/Forward. Desktop links remain unchanged. With JavaScript disabled, mobile visitors retain the link navigation.

With a preview running, `node site/check-navigation.mjs` verifies dropdown navigation and history restoration on every page; pass a custom URL such as `http://localhost:8081` as needed. This complements Go's rendered navigation checks; it uses jsdom and does not verify browser layout.

## Markdown representations

Every documentation URL serves HTML by default. Ask for `Accept: text/markdown` to receive the exact source. Quality values and specific exclusions are honored; HTML wins equal quality. Unsupported representations return 406. Responses vary on `Accept`.

Explicit `.md` URLs always serve Markdown, regardless of `Accept`: `/get-started.md`, `/guide.md`, `/reference.md`, `/examples.md`, `/index.md`, and each reference section, such as `/reference/cfs.md`.

The 42 known legacy `/docs/{topic}/` paths redirect permanently to their new section. Unknown URLs remain 404 instead of silently becoming a documentation page. The old examples index redirects to the new index.

## Boundaries

This is a local preview implementation, not a production deployment. No deployment, database, analytics, search index, or authentication is configured. The long-form reference is a verified practical API reference, not a generated listing of every internal TypeScript type. Legacy topics are consolidated; redirects point to destination pages rather than claiming old APIs still exist.

## Search metadata and canonical host

`site/seo.go` supplies unique titles and descriptions for the homepage, documentation, and 17 example detail pages. Indexable HTML and its canonical HTTP Link header use `https://www.vsnjs.org`; tracking queries do not enter canonical URLs. The homepage keeps the SEO Friendly JavaScript Framework title and its CSS-inspired copy.

Requests whose actual Host is `vsnjs.org` or `vsn.fly.dev` permanently redirect to `https://www.vsnjs.org`, preserving the escaped path and query. Localhost, loopback, and other hosts are not redirected. Forwarded host/protocol headers do not determine redirects or canonical URLs. Fly's existing HTTPS enforcement handles HTTP requests before they reach the app.

`/sitemap.xml` lists the 26 canonical HTML pages; `/robots.txt` advertises it. Standalone `/run/` demos, raw example sources, explicit Markdown source URLs, and error pages send `noindex`. They remain crawlable so robots can read the directive. Negotiated Markdown retains its content and canonical HTML Link header. Standalone demo templates are in `site/runner.html`; normal pages use `site/layout.html`.
