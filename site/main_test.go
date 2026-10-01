package main

import (
	"net/http"
	"net/http/httptest"
	"os"
	"regexp"
	"strings"
	"testing"
)

func TestNegotiation(t *testing.T) {
	cases := []struct {
		path, accept, kind string
		status             int
	}{
		{"/guide", "", "text/html", 200}, {"/guide", "*/*", "text/html", 200}, {"/guide", "text/markdown", "text/markdown", 200}, {"/guide", "text/markdown;q=0.2,text/html;q=0.9", "text/html", 200}, {"/guide", "text/html;q=0.2,text/markdown;q=0.9", "text/markdown", 200}, {"/guide", "text/markdown;q=0,text/html", "text/html", 200}, {"/guide", "text/html;q=0,text/*;q=0.8", "text/markdown", 200}, {"/guide", "text/markdown;q=0,text/*;q=0.8", "text/html", 200}, {"/guide", "text/html;q=0,text/markdown;q=0,*/*;q=1", "text/plain", 406}, {"/guide", "application/json", "text/plain", 406}, {"/guide", "text/html;q=0.5,text/markdown;q=0.5", "text/html", 200}, {"/guide.md", "text/html", "text/markdown", 200}, {"/index.md", "", "text/markdown", 200}, {"/guide", "text/html;q=NaN", "text/plain", 406},
	}
	h := handler("..")
	for _, c := range cases {
		t.Run(c.path+c.accept, func(t *testing.T) {
			r := httptest.NewRequest("GET", c.path, nil)
			r.Header.Set("Accept", c.accept)
			w := httptest.NewRecorder()
			h.ServeHTTP(w, r)
			if w.Code != c.status || !strings.HasPrefix(w.Header().Get("Content-Type"), c.kind) {
				t.Fatalf("got %d %s", w.Code, w.Header().Get("Content-Type"))
			}
			if w.Header().Get("Vary") != "Accept" {
				t.Fatal("missing Vary")
			}
		})
	}
}
func TestRoutes(t *testing.T) {
	h := handler("..")
	for path := range titles {
		w := httptest.NewRecorder()
		h.ServeHTTP(w, httptest.NewRequest("GET", path, nil))
		if w.Code != 200 {
			t.Fatalf("%s: %d", path, w.Code)
		}
	}
	for path, to := range redirects {
		w := httptest.NewRecorder()
		h.ServeHTTP(w, httptest.NewRequest("GET", path, nil))
		if w.Code != 308 || w.Header().Get("Location") != to {
			t.Fatalf("bad redirect %s", path)
		}
	}
	for _, e := range examples {
		for _, prefix := range []string{"/play/", "/run/"} {
			w := httptest.NewRecorder()
			h.ServeHTTP(w, httptest.NewRequest("GET", prefix+e, nil))
			if w.Code != 200 {
				t.Fatalf("%s%s: %d", prefix, e, w.Code)
			}
		}
	}
	for _, path := range []string{"/missing", "/docs/not-a-topic/", "/play/nope", "/run/nope", "/examples/raw/missing-fragment.html", "/.git/config", "/examples/raw/README.md"} {
		w := httptest.NewRecorder()
		h.ServeHTTP(w, httptest.NewRequest("GET", path, nil))
		if w.Code != 404 {
			t.Fatalf("%s: %d", path, w.Code)
		}
	}
	w := httptest.NewRecorder()
	h.ServeHTTP(w, httptest.NewRequest("POST", "/guide", nil))
	if w.Code != http.StatusMethodNotAllowed {
		t.Fatal(w.Code)
	}
}
func TestMarkdownIsCanonical(t *testing.T) {
	h := handler("..")
	for path := range titles {
		base := strings.ReplaceAll(strings.TrimPrefix(path, "/"), "/", "-")
		if base == "" {
			base = "index"
		}
		expected, err := os.ReadFile("content/" + base + ".md")
		if err != nil {
			t.Fatal(err)
		}
		explicit := path + ".md"
		if path == "/" {
			explicit = "/index.md"
		}
		for _, requestPath := range []string{path, explicit} {
			r := httptest.NewRequest("GET", requestPath, nil)
			r.Header.Set("Accept", "text/markdown")
			w := httptest.NewRecorder()
			h.ServeHTTP(w, r)
			if w.Body.String() != string(expected) {
				t.Fatalf("source differs: %s", path)
			}
		}
	}
}
func TestDocsLinks(t *testing.T) {
	h := handler("..")
	link := regexp.MustCompile(`\]\((/[^)#]+)(?:#([^)]*))?\)`)
	for _, file := range []string{"index", "get-started", "guide", "reference", "reference-html", "reference-cfs", "reference-runtime", "reference-plugins", "examples"} {
		b, _ := os.ReadFile("content/" + file + ".md")
		for _, m := range link.FindAllSubmatch(b, -1) {
			w := httptest.NewRecorder()
			h.ServeHTTP(w, httptest.NewRequest("GET", string(m[1]), nil))
			if w.Code != 200 {
				t.Errorf("%s -> %s: %d", file, m[1], w.Code)
			}
			if len(m[2]) > 0 && !strings.Contains(w.Body.String(), `id="`+string(m[2])+`"`) {
				t.Errorf("%s -> %s#%s: missing anchor", file, m[1], m[2])
			}
		}
	}
}

func TestReferenceNavigationAndBookmarks(t *testing.T) {
	h := handler("..")
	old := httptest.NewRecorder()
	h.ServeHTTP(old, httptest.NewRequest("GET", "/reference", nil))
	for _, id := range []string{"html-directives", "event-flags", "request-directives", "cfs", "state-functions-and-selectors", "dom-directives", "engine", "initialization-and-teardown", "globals-and-extensions", "html-and-requests", "scope-and-reactivity", "plugins"} {
		if !strings.Contains(old.Body.String(), `id="`+id+`"`) {
			t.Errorf("missing old reference bookmark %s", id)
		}
	}
	for _, section := range []string{"html", "cfs", "runtime", "plugins"} {
		path := "/reference/" + section
		w := httptest.NewRecorder()
		h.ServeHTTP(w, httptest.NewRequest("GET", path, nil))
		if !strings.Contains(w.Body.String(), `href="`+path+`" aria-current="page"`) {
			t.Errorf("missing active reference navigation %s", path)
		}
		slash := httptest.NewRecorder()
		h.ServeHTTP(slash, httptest.NewRequest("GET", path+"/", nil))
		if slash.Code != 308 || slash.Header().Get("Location") != path {
			t.Errorf("bad reference trailing slash %s", path)
		}
	}
	logo := httptest.NewRecorder()
	h.ServeHTTP(logo, httptest.NewRequest("GET", "/assets/logo.svg", nil))
	if logo.Code != 200 || !strings.Contains(logo.Body.String(), `viewBox="0 0 3500 2730.02"`) {
		t.Fatal("original logo unavailable")
	}
}

func TestContextualSidebar(t *testing.T) {
	h := handler("..")
	paths := []string{"/", "/get-started", "/guide", "/reference", "/reference/html", "/reference/cfs", "/reference/runtime", "/reference/plugins", "/examples"}
	for _, name := range examples {
		paths = append(paths, "/play/"+name)
	}
	for _, path := range paths {
		w := httptest.NewRecorder()
		h.ServeHTTP(w, httptest.NewRequest("GET", path, nil))
		body := w.Body.String()
		reference := path == "/reference" || strings.HasPrefix(path, "/reference/")
		example := path == "/examples" || strings.HasPrefix(path, "/play/")
		if strings.Contains(body, `class="sidebar-group" role="navigation" aria-label="Reference"`) != reference {
			t.Errorf("%s: wrong reference submenu visibility", path)
		}
		if strings.Contains(body, `class="sidebar-group examples-menu" role="navigation" aria-label="Examples"`) != example {
			t.Errorf("%s: wrong examples submenu visibility", path)
		}
		if path != "/" && !strings.Contains(body, "THE DOCUMENTATION") {
			t.Errorf("%s: missing main documentation navigation", path)
		}
		if example {
			for _, name := range examples {
				if !strings.Contains(body, `href="/play/`+name+`"`) {
					t.Errorf("%s: missing example link %s", path, name)
				}
			}
		}
		if strings.HasPrefix(path, "/play/") {
			if !strings.Contains(body, `href="`+path+`" aria-current="page"`) {
				t.Errorf("%s: current example not highlighted", path)
			}
			name := strings.TrimPrefix(path, "/play/")
			if !strings.Contains(body, `src="/run/`+name+`"`) {
				t.Errorf("%s: missing isolated live demo", path)
			}
		}
	}
}
