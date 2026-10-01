package main

import (
	"encoding/xml"
	"html"
	"net/http"
	"net/http/httptest"
	"regexp"
	"sort"
	"strings"
	"testing"
)

func seoResponse(h http.Handler, path, accept string) *httptest.ResponseRecorder {
	r := httptest.NewRequest("GET", "http://localhost:8080"+path, nil)
	r.Header.Set("Accept", accept)
	// Neither canonical URLs nor redirect destinations may trust proxy headers.
	r.Header.Set("X-Forwarded-Host", "evil.example")
	r.Header.Set("X-Forwarded-Proto", "http")
	w := httptest.NewRecorder()
	h.ServeHTTP(w, r)
	return w
}

func seoText(t *testing.T, body, pattern string) string {
	t.Helper()
	matches := regexp.MustCompile(pattern).FindAllStringSubmatch(body, -1)
	if len(matches) != 1 {
		t.Fatalf("expected one %s, got %d", pattern, len(matches))
	}
	text := strings.ReplaceAll(matches[0][1], "<br>", " ")
	text = regexp.MustCompile(`<[^>]+>`).ReplaceAllString(text, "")
	return strings.Join(strings.Fields(html.UnescapeString(text)), " ")
}

func TestSEOAcrossEveryIndexablePage(t *testing.T) {
	h := handler("..")
	paths := make([]string, 0, 26)
	for path := range titles {
		paths = append(paths, path)
	}
	for _, name := range examples {
		paths = append(paths, "/play/"+name)
	}
	if len(paths) != 26 {
		t.Fatalf("unexpected page inventory: %d", len(paths))
	}
	seenTitles, seenDescriptions, seenHeadings := map[string]string{}, map[string]string{}, map[string]string{}
	for _, path := range paths {
		t.Run(path, func(t *testing.T) {
			w := seoResponse(h, path+"?campaign=test", "text/html")
			if w.Code != 200 || w.Header().Get("X-Robots-Tag") != "" {
				t.Fatalf("indexable page returned %d, %q", w.Code, w.Header().Get("X-Robots-Tag"))
			}
			body := w.Body.String()
			title := seoText(t, body, `<title>(.*?)</title>`)
			description := seoText(t, body, `<meta name="description" content="([^"]*)">`)
			heading := seoText(t, body, `(?s)<h1(?:\s[^>]*)?>(.*?)</h1>`)
			if !strings.Contains(title, "VSN.js") || len(title) < 20 || len(title) > 80 || len(description) < 100 || len(description) > 200 || len(heading) < 10 {
				t.Errorf("weak metadata: %q / %q / %q", title, description, heading)
			}
			if other := seenTitles[title]; other != "" {
				t.Errorf("duplicate title with %s", other)
			}
			if other := seenDescriptions[description]; other != "" {
				t.Errorf("duplicate description with %s", other)
			}
			if other := seenHeadings[heading]; other != "" {
				t.Errorf("duplicate H1 with %s", other)
			}
			seenTitles[title], seenDescriptions[description] = path, path
			seenHeadings[heading] = path
			if path == "/" && (title != "SEO Friendly JavaScript Framework | VSN.js" || heading != "SEO-friendly JavaScript framework.") {
				t.Errorf("homepage positioning missing: %q / %q", title, heading)
			}
			canonical := canonicalOrigin + path
			if seoText(t, body, `<link rel="canonical" href="([^"]*)">`) != canonical || w.Header().Get("Link") != "<"+canonical+">; rel=\"canonical\"" {
				t.Error("canonical must use fixed www HTTPS origin and omit campaign query")
			}
			for _, field := range []struct{ pattern, want string }{
				{`<meta property="og:url" content="([^"]*)">`, canonical},
				{`<meta property="og:title" content="([^"]*)">`, title},
				{`<meta property="og:description" content="([^"]*)">`, description},
				{`<meta name="twitter:title" content="([^"]*)">`, title},
				{`<meta name="twitter:description" content="([^"]*)">`, description},
			} {
				if seoText(t, body, field.pattern) != field.want {
					t.Errorf("inconsistent %s", field.pattern)
				}
			}
			if strings.Contains(body, `name="robots"`) {
				t.Error("indexable page must not carry utility-page robots metadata")
			}
		})
	}
}

func TestCascadingFunctionSheetsExpansion(t *testing.T) {
	w := seoResponse(handler(".."), "/reference/cfs", "text/html")
	for _, pattern := range []string{`<title>(.*?)</title>`, `<meta name="description" content="([^"]*)">`, `(?s)<h1(?:\s[^>]*)?>(.*?)</h1>`, `<p>(.*?)</p>`} {
		matches := regexp.MustCompile(pattern).FindStringSubmatch(w.Body.String())
		if len(matches) != 2 || !strings.Contains(html.UnescapeString(matches[1]), "Cascading Function Sheets") {
			t.Errorf("missing CFS expansion in %s", pattern)
		}
	}
	source := seoResponse(handler(".."), "/reference/cfs.md", "")
	if !strings.Contains(source.Body.String(), `type="text/vsn" src="/path/to/some.vsn"`) {
		t.Error("external CFS example must retain text/vsn MIME and .vsn extension")
	}
}

func TestNoindexUtilitiesAndMarkdown(t *testing.T) {
	h := handler("..")
	seen := map[string]bool{}
	for _, name := range examples {
		w := seoResponse(h, "/run/"+name, "")
		if w.Code != 200 || w.Header().Get("X-Robots-Tag") != "noindex" || !strings.Contains(w.Body.String(), `<meta name="robots" content="noindex, follow">`) {
			t.Errorf("%s: missing runner noindex", name)
		}
		title := seoText(t, w.Body.String(), `<title>(.*?)</title>`)
		if seen[title] || !strings.HasPrefix(title, "Live ") {
			t.Errorf("%s: poor runner title %q", name, title)
		}
		seen[title] = true
		seoText(t, w.Body.String(), `<meta name="description" content="([^"]*)">`)
		if w.Header().Get("Link") != "" || strings.Contains(w.Body.String(), `rel="canonical"`) {
			t.Errorf("%s: excluded runner has contradictory canonical", name)
		}
		raw := seoResponse(h, "/examples/raw/"+name+".html", "")
		if raw.Code != 200 || raw.Header().Get("X-Robots-Tag") != "noindex" {
			t.Errorf("%s: missing raw-source noindex", name)
		}
	}
	for path := range titles {
		explicit := path + ".md"
		if path == "/" {
			explicit = "/index.md"
		}
		md := seoResponse(h, path, "text/markdown")
		source := seoResponse(h, explicit, "text/html")
		if md.Code != 200 || source.Code != 200 || md.Body.String() != source.Body.String() || !strings.HasPrefix(md.Header().Get("Content-Type"), "text/markdown") || md.Header().Get("Vary") != "Accept" {
			t.Errorf("%s: Markdown representation changed", path)
		}
		if md.Header().Get("X-Robots-Tag") != "" || source.Header().Get("X-Robots-Tag") != "noindex" || md.Header().Get("Link") != "<"+canonicalOrigin+path+">; rel=\"canonical\"" || source.Header().Get("Link") != md.Header().Get("Link") {
			t.Errorf("%s: wrong Markdown canonical/index policy", path)
		}
	}
	for _, path := range []string{"/missing", "/play/nope", "/run/nope", "/examples/raw/nope.html"} {
		w := seoResponse(h, path, "")
		if w.Code != 404 || w.Header().Get("X-Robots-Tag") != "noindex" || w.Header().Get("Link") != "" {
			t.Errorf("%s: wrong 404 indexing policy", path)
		}
	}
}

func TestCanonicalHostMatrix(t *testing.T) {
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(204) })
	h := canonicalHost(next)
	for _, host := range []string{"vsnjs.org", "VSNJS.ORG", "vsnjs.org.", "vsnjs.org:80", "vsnjs.org:443", "vsnjs.org.:8080"} {
		for _, method := range []string{"GET", "HEAD", "POST"} {
			for _, target := range []string{"http://vsnjs.org/guide?a=1&b=%2F", "https://vsnjs.org/reference%2Fcfs?", "http://vsnjs.org//evil.example/guide?next=https%3A%2F%2Fevil.example"} {
				r := httptest.NewRequest(method, target, nil)
				r.Host = host
				r.Header.Set("Forwarded", "host=evil.example;proto=http")
				w := httptest.NewRecorder()
				h.ServeHTTP(w, r)
				want := canonicalOrigin + r.URL.EscapedPath()
				if r.URL.RawQuery != "" || r.URL.ForceQuery {
					want += "?" + r.URL.RawQuery
				}
				if w.Code != 308 || w.Header().Get("Location") != want {
					t.Errorf("%s %s %s: got %d %q, want %q", method, host, target, w.Code, w.Header().Get("Location"), want)
				}
			}
		}
	}
	for _, host := range []string{"www.vsnjs.org", "localhost:8080", "127.0.0.1:8080", "[::1]:8080", "evil.example", "vsnjs.org.evil.example", "vsnjs.org@evil.example", "vsnjs.org:bad", "vsnjs.org:65536", "vsnjs.org.."} {
		r := httptest.NewRequest("GET", "/guide", nil)
		r.Host = host
		r.Header.Set("X-Forwarded-Host", "vsnjs.org")
		r.Header.Set("Forwarded", "host=vsnjs.org;proto=https")
		w := httptest.NewRecorder()
		h.ServeHTTP(w, r)
		if w.Code != 204 || w.Header().Get("Location") != "" {
			t.Errorf("host %q redirected unexpectedly", host)
		}
	}
}

func TestRedirectsPreserveQueries(t *testing.T) {
	h := handler("..")
	paths := make(map[string]string)
	for from, to := range redirects {
		paths[from] = to
	}
	for path := range titles {
		if path != "/" {
			paths[path+"/"] = path
		}
	}
	for _, name := range examples {
		for _, prefix := range []string{"/play/", "/run/"} {
			paths[prefix+name+"/"] = prefix + name
		}
	}
	for from, to := range paths {
		w := seoResponse(h, from+"?a=1&b=%2F", "")
		if w.Code != 308 || w.Header().Get("Location") != to+"?a=1&b=%2F" {
			t.Errorf("%s: redirect lost path/query: %d %q", from, w.Code, w.Header().Get("Location"))
		}
	}
}

func TestSitemapAndRobots(t *testing.T) {
	h := handler("..")
	w := seoResponse(h, "/sitemap.xml", "")
	var doc sitemapDocument
	if w.Code != 200 || !strings.HasPrefix(w.Header().Get("Content-Type"), "application/xml") || xml.Unmarshal(w.Body.Bytes(), &doc) != nil {
		t.Fatal("invalid sitemap")
	}
	expected := []string{}
	for path := range titles {
		expected = append(expected, canonicalOrigin+path)
	}
	for _, name := range examples {
		expected = append(expected, canonicalOrigin+"/play/"+name)
	}
	sort.Strings(expected)
	if len(doc.URLs) != 26 || doc.XMLNS != "http://www.sitemaps.org/schemas/sitemap/0.9" {
		t.Fatal("wrong sitemap inventory/namespace")
	}
	for i, item := range doc.URLs {
		if item.Location != expected[i] {
			t.Errorf("sitemap location %d: %q", i, item.Location)
		}
		if seoResponse(h, strings.TrimPrefix(item.Location, canonicalOrigin), "text/html").Code != 200 {
			t.Errorf("dead sitemap URL %s", item.Location)
		}
	}
	robots := seoResponse(h, "/robots.txt", "")
	if robots.Code != 200 || robots.Body.String() != "User-agent: *\nAllow: /\nSitemap: https://www.vsnjs.org/sitemap.xml\n" {
		t.Fatal("robots must advertise sitemap and let crawlers read noindex")
	}
	for _, path := range []string{"/sitemap.xml", "/robots.txt"} {
		w := httptest.NewRecorder()
		h.ServeHTTP(w, httptest.NewRequest("HEAD", path, nil))
		if w.Code != 200 || w.Body.Len() != 0 {
			t.Errorf("bad HEAD %s", path)
		}
		w = httptest.NewRecorder()
		h.ServeHTTP(w, httptest.NewRequest("POST", path, nil))
		if w.Code != 405 || w.Header().Get("Allow") != "GET, HEAD" {
			t.Errorf("bad method handling %s", path)
		}
	}
}
