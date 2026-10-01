# Plugins

Optional modules extend the core runtime. Load or register them before mounting behaviors that depend on them.

## Plugins

Plugins are opt-in. With automatic mounting, load browser plugin modules before the core module:

```html
<script type="module" src="/dist/plugins/templates.min.js"></script>
<script type="module" src="/dist/plugins/sanitize-html.min.js"></script>
<script type="module" src="/dist/plugins/microdata.min.js"></script>
<script type="module" src="/dist/index.min.js" auto-mount></script>
```

For explicit engine setup, register the plugins you need:

```js
import { Engine } from "vsn";
import { registerTemplates } from "vsn/plugins/templates";
import { registerSanitizeHtml } from "vsn/plugins/sanitize-html";
import { registerMicrodata } from "vsn/plugins/microdata";

const engine = new Engine();
registerTemplates(engine);
registerSanitizeHtml(engine);
registerMicrodata(engine);
// Register behavior source, then await engine.mount(root).
```

- `registerTemplates(engine)` adds the `html` tagged-template helper and HTML transformation. Returns a function removing its transformer
- `registerSanitizeHtml(engine, options?)` installs a sanitizer and returns a restoration function. Options accept `sanitizer` and `dompurifyConfig`; DOMPurify is used when available
- `registerMicrodata(engine)` adds the `!microdata` behavior modifier and `microdata()` helper for extracting HTML microdata

Each plugin also has a default export for its registration function. See [templates](/play/templates) and [product filters](/play/product-filters) for working examples.
