package main

import (
	"encoding/xml"
	"net"
	"net/http"
	"sort"
	"strconv"
	"strings"
)

const canonicalOrigin = "https://www.vsnjs.org"

type metadata struct {
	Title, Description, Heading string
}

var documentSEO = map[string]metadata{
	"/": {
		"SEO Friendly JavaScript Framework | VSN.js",
		"VSN.js adds reactive state, events and bindings to server-rendered HTML with CSS-like CFS behaviors. Build interactive pages without replacing your markup.",
		"SEO-friendly JavaScript framework.",
	},
	"/get-started": {
		"Get Started with VSN.js: Install and Mount Behaviors",
		"Install VSN.js, add reactive state and form bindings, and mount your first CFS behavior. Learn inline scripts, external .vsn files and explicit setup.",
		"Get started with VSN.js",
	},
	"/guide": {
		"VSN.js Guide: State, Bindings and CFS Behaviors",
		"Learn VSN.js scopes, bindings, events, lists, lifecycle and HTML requests. Enhance server-rendered pages with CFS behaviors and safe dynamic content.",
		"VSN.js guide: state, bindings, and behaviors",
	},
	"/reference": {
		"VSN.js Reference: HTML Attributes, CFS and Runtime API",
		"Find VSN.js HTML attributes, CFS syntax, JavaScript runtime APIs and optional plugins. Jump to the reference section you need for your implementation.",
		"VSN.js reference",
	},
	"/reference/html": {
		"VSN.js HTML Attributes: Bindings, Events and Requests",
		"Reference VSN.js HTML attributes for data binding, events, conditional UI, lists and HTTP requests, including event flags, swap targets and form state.",
		"VSN.js HTML attributes",
	},
	"/reference/cfs": {
		"CFS: Cascading Function Sheets Reference | VSN.js",
		"Write Cascading Function Sheets (CFS) for VSN.js: selectors, state, bindings, functions and events. Learn inline text/vsn scripts and external .vsn files.",
		"CFS: Cascading Function Sheets reference",
	},
	"/reference/runtime": {
		"VSN.js Runtime API: Engine, Scopes and Reactivity",
		"Reference the VSN.js Engine, mounting, hydration, scopes, computed values and effects. Configure globals, extensions, HTML processing and HTTP requests.",
		"VSN.js runtime API",
	},
	"/reference/plugins": {
		"VSN.js Plugins: Templates, Sanitization and Microdata",
		"Set up VSN.js templates, HTML sanitization and microdata plugins. Learn browser module loading, explicit engine registration and plugin options.",
		"VSN.js plugins",
	},
	"/examples": {
		"VSN.js Examples: Interactive HTML and CFS Demos",
		"Explore 17 runnable VSN.js examples, from counters and bindings to tabs, forms, lists and async search. Try each demo and inspect its HTML and CFS source.",
		"VSN.js examples",
	},
}

type exampleInfo struct {
	Label, Description string
}

var exampleSEO = map[string]exampleInfo{
	"counter-toggle":      {"Counter and Toggle", "Build a VSN.js counter and visibility toggle with reactive state, click handlers, display bindings and vsn-show. Try the demo and inspect its HTML source."},
	"tabs":                {"Tabs", "Explore VSN.js tabs with CFS-selected state, reactive ARIA attributes and panel visibility. Try the tab buttons and inspect the behavior source."},
	"todo":                {"Todo List", "Build a VSN.js todo list with form bindings, reactive arrays, repeated templates and browser persistence. Try the demo and inspect its CFS behavior."},
	"kanban":              {"Kanban Board", "Explore a VSN.js kanban board with drag events, dynamic HTML, templates and shared state. Try the demo and inspect how its CFS behavior connects the board."},
	"product-filters":     {"Product Filters", "Filter products with VSN.js reactive state, derived display values, HTML and optional plugins. Try the product filters and inspect the example source."},
	"modal":               {"Modal Dialog", "Explore a VSN.js modal with state-driven visibility, Escape handling, backdrop clicks and focus restoration. Try the dialog and inspect its CFS source."},
	"tooltip":             {"Tooltip", "Add a VSN.js tooltip using hover and focus events, inherited state and aria-describedby. Try the tooltip interaction and inspect its HTML and CFS."},
	"dropdown":            {"Dropdown Menu", "Build a VSN.js dropdown with outside events, keyboard flags, nested scopes and selection state. Try the menu and inspect its HTML and CFS behavior."},
	"form-validation":     {"Form Validation", "Validate a form with VSN.js two-way inputs, CFS validation functions and reactive error attributes. Try the form and inspect how state drives feedback."},
	"server-request":      {"Server Requests", "Explore VSN.js HTML request directives, partial swaps, async CFS functions and request state. Inspect the demo source and its request-handling patterns."},
	"fragment-lifecycle":  {"Fragment Lifecycle", "Explore dynamic VSN.js fragments with templates, construction and destruction hooks. Try the demo and inspect behavior activation and lifecycle cleanup."},
	"nested-list":         {"Nested Lists", "Render nested lists with VSN.js item and index scopes, array updates and root functions. Try the demo and inspect its repeated-template bindings."},
	"async-search":        {"Async Search", "Explore VSN.js debounced input, async CFS functions, await and list helpers in a search demo. Try a query and inspect the behavior that updates results."},
	"toast-notifications": {"Toast Notifications", "Show VSN.js toast notifications with temporary state, timers, callbacks and reactive class maps. Try the notifications and inspect the example source."},
	"accessible-table":    {"Table Selection", "Explore VSN.js table selection with row scopes, reactive checkboxes and ARIA attributes. Try selecting rows and inspect the shared selection state."},
	"templates":           {"HTML Templates", "Use the VSN.js templates plugin to compose HTML and sanitize interpolated values. Try the template demo and inspect its tagged-template behavior."},
	"bindings":            {"Form Binding Directions", "Compare VSN.js automatic, one-way and two-way bindings on text inputs, checkboxes and selects. Try the controls and inspect how scope state stays in sync."},
}

func metadataForExample(name string) metadata {
	info := exampleSEO[name]
	return metadata{Title: info.Label + " Example | VSN.js", Description: info.Description, Heading: info.Label + " example with VSN.js"}
}

// Only the actual request Host selects the apex redirect. Proxy headers never
// influence the destination or canonical URLs, and local preview hosts stay local.
func canonicalHost(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		host := strings.ToLower(r.Host)
		if strings.Contains(host, ":") {
			name, port, err := net.SplitHostPort(host)
			number, portErr := strconv.Atoi(port)
			if err != nil || portErr != nil || number < 1 || number > 65535 {
				next.ServeHTTP(w, r)
				return
			}
			host = name
		}
		if strings.TrimSuffix(host, ".") == "vsnjs.org" {
			path := r.URL.EscapedPath()
			if path == "" {
				path = "/"
			}
			permanentRedirect(w, r, canonicalOrigin+path)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func permanentRedirect(w http.ResponseWriter, r *http.Request, destination string) {
	if r.URL.RawQuery != "" || r.URL.ForceQuery {
		destination += "?" + r.URL.RawQuery
	}
	http.Redirect(w, r, destination, http.StatusPermanentRedirect)
}

type sitemapURL struct {
	Location string `xml:"loc"`
}

type sitemapDocument struct {
	XMLName xml.Name     `xml:"urlset"`
	XMLNS   string       `xml:"xmlns,attr"`
	URLs    []sitemapURL `xml:"url"`
}

func serveSitemap(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		w.Header().Set("Allow", "GET, HEAD")
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	paths := make([]string, 0, len(documentSEO)+len(examples))
	for path := range documentSEO {
		paths = append(paths, path)
	}
	for _, name := range examples {
		paths = append(paths, "/play/"+name)
	}
	sort.Strings(paths)
	document := sitemapDocument{XMLNS: "http://www.sitemaps.org/schemas/sitemap/0.9"}
	for _, path := range paths {
		document.URLs = append(document.URLs, sitemapURL{Location: canonicalOrigin + path})
	}
	w.Header().Set("Content-Type", "application/xml; charset=utf-8")
	if r.Method == http.MethodHead {
		return
	}
	w.Write([]byte(xml.Header))
	xml.NewEncoder(w).Encode(document)
}

func serveRobots(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		w.Header().Set("Allow", "GET, HEAD")
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	if r.Method == http.MethodGet {
		// Let crawlers read noindex responses for standalone demos and source files.
		w.Write([]byte("User-agent: *\nAllow: /\nSitemap: " + canonicalOrigin + "/sitemap.xml\n"))
	}
}
