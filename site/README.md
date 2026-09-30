# VSN website

Small server-rendered website and canonical Markdown docs, in the framework repository. No database, JavaScript build system, or frontend router for the docs. The existing VSN build powers the live examples.

## Run

From the repository root, with Go 1.25+:

```sh
go run ./site -addr :8080
```

Open http://localhost:8080. The committed `dist/` works as-is. To rebuild the runtime, use `npm ci && npm run build`.

Run tests with `go test ./site` and `go vet ./site`. Use `go build -o vsn-site ./site` for a binary; run it from the repository root, or pass `-root /path/to/vsn`. Markdown, templates, and site assets are embedded in the binary. Restart/rebuild after editing them; example HTML and runtime assets are read from the repository.

## Editing

- `site/content/*.md`: canonical docs and Markdown landing overview
- `site/layout.html`: shared shell and custom visual landing page
- `site/assets/`: responsive CSS and favicon
- `examples/*.html`: the existing 17 runnable recipes, unchanged
- `site/main.go`: routing, rendering, example wrappers, redirects, negotiation

Homepage plus four destinations: `/get-started`, `/guide`, `/reference`, `/examples`. Cookbook pages are `/play/{name}`, with a full-screen runner at `/run/{name}`. Their HTML source is displayed on each cookbook page. Example fragments are served under `/examples/raw/` so relative requests work.

## Markdown representations

Every documentation URL serves HTML by default. Ask for `Accept: text/markdown` to receive the exact source. Quality values and specific exclusions are honored; HTML wins equal quality. Unsupported representations return 406. Responses vary on `Accept`.

Explicit `.md` URLs always serve Markdown, regardless of `Accept`: `/get-started.md`, `/guide.md`, `/reference.md`, `/examples.md`, `/index.md`.

The 42 known legacy `/docs/{topic}/` paths redirect permanently to their new section. Unknown URLs remain 404 instead of silently becoming a documentation page. The old examples index redirects to the new index.

## Boundaries

This is a local preview implementation, not a production deployment. No deployment, database, analytics, search index, or authentication is configured. The long-form reference is a verified practical API reference, not a generated listing of every internal TypeScript type. Legacy topics are consolidated; redirects point to destination pages rather than claiming old APIs still exist.
