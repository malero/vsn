package main

import (
	"bytes"
	"embed"
	"flag"
	"fmt"
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"html/template"
	"log"
	"math"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

//go:embed content/*.md assets/* *.html
var site embed.FS
var markdown = goldmark.New(goldmark.WithExtensions(extension.GFM), goldmark.WithParserOptions(parser.WithAutoHeadingID()))
var layout = template.Must(template.ParseFS(site, "layout.html"))
var runnerLayout = template.Must(template.ParseFS(site, "runner.html"))

type navItem struct {
	Path, Label string
}

type page struct {
	Title, Path, Source       string
	Body                      template.HTML
	Home, Reference, Examples bool
	ExampleLinks              []navItem
	SEO                       metadata
	Canonical                 string
	NoIndex                   bool
	PrimaryPath               string
}

var titles = map[string]string{"/": "VSN.js", "/get-started": "Get Started", "/guide": "Guide", "/reference": "Reference", "/reference/html": "HTML attributes", "/reference/cfs": "CFS", "/reference/runtime": "Runtime API", "/reference/plugins": "Plugins", "/examples": "Examples"}
var examples = []string{"counter-toggle", "tabs", "todo", "kanban", "product-filters", "modal", "tooltip", "dropdown", "form-validation", "server-request", "fragment-lifecycle", "nested-list", "async-search", "toast-notifications", "accessible-table", "templates", "bindings"}

func knownExample(s string) bool {
	for _, e := range examples {
		if e == s {
			return true
		}
	}
	return false
}

// Specific ranges override wildcards, including q=0 exclusions. HTML wins ties.
func quality(accept, kind string) float64 {
	best, q := -1, 0.0
	for _, item := range strings.Split(accept, ",") {
		media, params, err := mime.ParseMediaType(strings.TrimSpace(item))
		if err != nil {
			continue
		}
		spec := -1
		if media == kind {
			spec = 2
		} else if media == strings.Split(kind, "/")[0]+"/*" {
			spec = 1
		} else if media == "*/*" {
			spec = 0
		}
		if spec < 0 {
			continue
		}
		n := 1.0
		if s, ok := params["q"]; ok {
			n, err = strconv.ParseFloat(s, 64)
			if err != nil || n < 0 || n > 1 || math.IsNaN(n) {
				continue
			}
		}
		if spec > best {
			best, q = spec, n
		} else if spec == best && n > q {
			q = n
		}
	}
	return q
}
func render(w http.ResponseWriter, p page, status int) {
	if meta, ok := documentSEO[p.Path]; ok && status == http.StatusOK {
		p.SEO = meta
		p.Canonical = canonicalOrigin + p.Path
	} else if strings.HasPrefix(p.Path, "/play/") && knownExample(strings.TrimPrefix(p.Path, "/play/")) && status == http.StatusOK {
		p.SEO = metadataForExample(strings.TrimPrefix(p.Path, "/play/"))
		p.Canonical = canonicalOrigin + p.Path
	} else {
		p.SEO = metadata{Title: "Page Not Found | VSN.js", Description: "This VSN.js page could not be found. Explore the documentation, language reference and runnable examples to find what you need."}
		p.NoIndex = true
	}
	if p.Canonical != "" {
		w.Header().Set("Link", "<"+p.Canonical+">; rel=\"canonical\"")
	}
	if p.NoIndex {
		w.Header().Set("X-Robots-Tag", "noindex")
	}
	p.Reference = p.Path == "/reference" || strings.HasPrefix(p.Path, "/reference/")
	p.Examples = p.Path == "/examples" || strings.HasPrefix(p.Path, "/play/")
	p.PrimaryPath = p.Path
	if p.Reference {
		p.PrimaryPath = "/reference"
	} else if p.Examples {
		p.PrimaryPath = "/examples"
	}
	if p.Examples {
		for _, name := range examples {
			label := exampleSEO[name].Label
			p.ExampleLinks = append(p.ExampleLinks, navItem{Path: "/play/" + name, Label: label})
		}
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(status)
	if err := layout.Execute(w, p); err != nil {
		log.Print(err)
	}
}
func handler(root string) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/sitemap.xml", serveSitemap)
	mux.HandleFunc("/robots.txt", serveRobots)
	mux.Handle("/assets/", http.FileServer(http.FS(site)))
	mux.Handle("/dist/", http.StripPrefix("/dist/", http.FileServer(http.Dir(filepath.Join(root, "dist")))))
	mux.HandleFunc("/examples/raw/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Robots-Tag", "noindex")
		file := strings.TrimPrefix(r.URL.Path, "/examples/raw/")
		stem := strings.TrimSuffix(file, ".html")
		if file != "styles.css" && !(strings.HasSuffix(file, ".html") && knownExample(stem)) {
			http.NotFound(w, r)
			return
		}
		http.ServeFile(w, r, filepath.Join(root, "examples", file))
	})
	mux.HandleFunc("/run/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Robots-Tag", "noindex")
		name := strings.TrimPrefix(r.URL.Path, "/run/")
		if strings.HasSuffix(name, "/") && knownExample(strings.TrimSuffix(name, "/")) {
			permanentRedirect(w, r, strings.TrimSuffix(r.URL.Path, "/"))
			return
		}
		if !knownExample(name) {
			http.NotFound(w, r)
			return
		}
		fragment, err := os.ReadFile(filepath.Join(root, "examples", name+".html"))
		if err != nil {
			http.Error(w, "Example unavailable", 500)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		meta := metadataForExample(name)
		meta.Title = "Live " + exampleSEO[name].Label + " Demo | VSN.js"
		meta.Description = "Live " + exampleSEO[name].Label + " demo. " + meta.Description
		if err := runnerLayout.Execute(w, page{SEO: meta, Body: template.HTML(fragment), NoIndex: true}); err != nil {
			log.Print(err)
		}
	})
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "GET" && r.Method != "HEAD" {
			w.Header().Set("Allow", "GET, HEAD")
			http.Error(w, "Method not allowed", 405)
			return
		}
		path := r.URL.Path
		if to, ok := redirects[path]; ok {
			permanentRedirect(w, r, to)
			return
		}
		if path != "/" && strings.HasSuffix(path, "/") {
			to := strings.TrimSuffix(path, "/")
			if _, ok := titles[to]; ok || (strings.HasPrefix(to, "/play/") && knownExample(strings.TrimPrefix(to, "/play/"))) {
				permanentRedirect(w, r, to)
				return
			}
		}
		if strings.HasPrefix(path, "/play/") {
			name := strings.TrimPrefix(path, "/play/")
			if knownExample(name) {
				source, _ := os.ReadFile(filepath.Join(root, "examples", name+".html"))
				b := fmt.Sprintf(`<p class="eyebrow">COOKBOOK / LIVE EXAMPLE</p><h1>%s</h1><p>Real markup. Real VSN. Try it below.</p><p><a href="/examples">← All examples</a> · <a href="/run/%s" target="_blank" rel="noopener">Open full screen ↗</a></p><iframe title="%s live example" src="/run/%s"></iframe><details><summary>View example source</summary><pre><code>%s</code></pre></details>`, template.HTMLEscapeString(metadataForExample(name).Heading), name, name, name, template.HTMLEscapeString(string(source)))
				render(w, page{Title: exampleSEO[name].Label, Path: path, Body: template.HTML(b)}, 200)
				return
			}
		}
		explicit := strings.HasSuffix(path, ".md")
		if explicit {
			path = strings.TrimSuffix(path, ".md")
			if path == "/index" {
				path = "/"
			}
		}
		title, ok := titles[path]
		if !ok {
			render(w, page{Title: "Page not found", Body: template.HTML(`<p class="eyebrow">404</p><h1>Page not found. This selector matches nothing.</h1><p>The page may have moved, or never existed. Both are valid states.</p><a class="button" href="/get-started">Get started →</a>`)}, 404)
			return
		}
		file := strings.ReplaceAll(strings.TrimPrefix(path, "/"), "/", "-")
		if file == "" {
			file = "index"
		}
		raw, err := site.ReadFile("content/" + file + ".md")
		if err != nil {
			http.Error(w, "Page unavailable", 500)
			return
		}
		w.Header().Set("Vary", "Accept")
		w.Header().Set("Link", "<"+canonicalOrigin+path+">; rel=\"canonical\"")
		accept := r.Header.Get("Accept")
		if accept == "" {
			accept = "*/*"
		}
		htmlQ, mdQ := quality(accept, "text/html"), quality(accept, "text/markdown")
		if explicit || (mdQ > htmlQ && mdQ > 0) {
			if explicit {
				w.Header().Set("X-Robots-Tag", "noindex")
			}
			w.Header().Set("Content-Type", "text/markdown; charset=utf-8")
			w.Write(raw)
			return
		}
		if htmlQ == 0 {
			http.Error(w, "Supported representations: text/html, text/markdown", 406)
			return
		}
		var body bytes.Buffer
		if err := markdown.Convert(raw, &body); err != nil {
			http.Error(w, "Rendering failed", 500)
			return
		}
		source := path + ".md"
		if path == "/" {
			source = "/index.md"
		}
		render(w, page{Title: title, Path: path, Source: source, Body: template.HTML(body.String()), Home: path == "/"}, 200)
	})
	return canonicalHost(mux)
}

var redirects = map[string]string{"/docs/": "/get-started", "/docs": "/get-started", "/examples/index.html": "/examples"}

func init() {
	groups := map[string][]string{"/get-started": {"installation", "quick-start", "first-behavior", "what-is-vsn", "build-bundler-usage-esm-cjs"}, "/guide": {"behaviors-selectors", "bindings", "debounce", "destructure-spread", "error-handling", "event-modifiers", "events", "expressions", "functions", "htmx-style-partials", "lifecycle", "root-scope-behavior", "scope-chain-rules", "security-sanitization", "ssr-patterns", "state-merge-specificity", "state-scope", "template-literals"}, "/reference": {"browser-support", "cli-api", "debugging-diagnostics", "extending", "full-grammar", "important", "microdata", "performance-caching", "pipes", "queries", "sanitize-html", "syntax-reference", "vsn-bind", "vsn-each", "vsn-get-vsn-target-vsn-swap", "vsn-html", "vsn-if", "vsn-on", "vsn-show"}}
	for dest, slugs := range groups {
		for _, slug := range slugs {
			redirects["/docs/"+slug+"/"] = dest
			redirects["/docs/"+slug] = dest
		}
	}
}
func main() {
	addr := flag.String("addr", ":8080", "listen address")
	root := flag.String("root", ".", "repository root")
	flag.Parse()
	s := &http.Server{Addr: *addr, Handler: handler(*root), ReadHeaderTimeout: 5 * time.Second}
	urlAddr := *addr
	if strings.HasPrefix(urlAddr, ":") {
		urlAddr = "localhost" + urlAddr
	}
	log.Printf("VSN website: http://%s", urlAddr)
	log.Fatal(s.ListenAndServe())
}
