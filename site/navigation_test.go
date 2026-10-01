package main

import (
	"regexp"
	"strings"
	"testing"
)

func TestMobileNavigationAcrossEveryPage(t *testing.T) {
	h := handler("..")
	paths := []string{"/", "/get-started", "/guide", "/reference", "/reference/html", "/reference/cfs", "/reference/runtime", "/reference/plugins", "/examples", "/missing"}
	for _, name := range examples {
		paths = append(paths, "/play/"+name)
	}
	selects := regexp.MustCompile(`(?s)<select id="([^"]+)" data-current="([^"]*)">(.*?)</select>`)
	selected := regexp.MustCompile(`<option value="([^"]*)" selected(?: disabled)?>`)
	for _, path := range paths {
		t.Run(path, func(t *testing.T) {
			body := seoResponse(h, path, "text/html").Body.String()
			primary, contextual := path, false
			if path == "/reference" || strings.HasPrefix(path, "/reference/") {
				primary, contextual = "/reference", true
			} else if path == "/examples" || strings.HasPrefix(path, "/play/") {
				primary, contextual = "/examples", true
			} else if path == "/missing" {
				primary = ""
			}
			menus := selects.FindAllStringSubmatch(body, -1)
			want := 1
			if contextual {
				want = 2
			}
			if len(menus) != want {
				t.Fatalf("got %d dropdowns, want %d", len(menus), want)
			}
			for i, menu := range menus {
				current := primary
				if i == 1 {
					current = path
				}
				options := selected.FindAllStringSubmatch(menu[3], -1)
				if menu[2] != current || len(options) != 1 || options[0][1] != current {
					t.Errorf("wrong current selection for %s", menu[1])
				}
				if !strings.Contains(body, `<label for="`+menu[1]+`">`) {
					t.Errorf("missing accessible label for %s", menu[1])
				}
			}
			for _, target := range []string{"/", "/get-started", "/guide", "/reference", "/examples"} {
				if !strings.Contains(menus[0][3], `<option value="`+target+`"`) {
					t.Errorf("missing primary destination %s", target)
				}
			}
			if contextual {
				destinations := []string{"/reference", "/reference/html", "/reference/cfs", "/reference/runtime", "/reference/plugins"}
				if primary == "/examples" {
					destinations = []string{"/examples"}
					for _, name := range examples {
						destinations = append(destinations, "/play/"+name)
					}
				}
				for _, target := range destinations {
					if !strings.Contains(menus[1][3], `<option value="`+target+`"`) {
						t.Errorf("missing contextual destination %s", target)
					}
				}
			}
			if !strings.Contains(body, `nav aria-label="Main navigation"`) || !strings.Contains(body, `src="/assets/navigation.js"`) {
				t.Error("desktop navigation or mobile script missing")
			}
		})
	}
}
