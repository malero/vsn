// Check real runner responses with the built runtime, independently of visual QA.
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';

const base = process.argv[2] || 'http://localhost:8080';
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
for (const name of ['counter-toggle', 'tabs', 'bindings']) {
  const response = await fetch(`${base}/run/${name}`);
  assert.equal(response.status, 200);
  const dom = new JSDOM(await response.text(), {url: `${base}/run/${name}`});
  for (const key of ['window', 'document', 'HTMLElement', 'Element', 'Node', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement', 'HTMLTemplateElement', 'HTMLFormElement', 'MutationObserver', 'CustomEvent', 'Event', 'MouseEvent', 'Document', 'NodeFilter']) globalThis[key] = dom.window[key];
  document.querySelectorAll('script[type="module"]').forEach(script => script.remove());
  const {Engine} = await import('../dist/index.js');
  const {registerTemplates} = await import('../dist/plugins/templates.js');
  const {registerSanitizeHtml} = await import('../dist/plugins/sanitize-html.js');
  const {registerMicrodata} = await import('../dist/plugins/microdata.js');
  const engine = new Engine();
  try {
    registerTemplates(engine);
    registerSanitizeHtml(engine);
    registerMicrodata(engine);
    const source = [...document.querySelectorAll('script[type="text/vsn"]')].map(script => script.textContent).join('\n');
    if (source.trim()) engine.registerBehaviors(source);
    await engine.mount(document.body);
    if (name === 'counter-toggle') {
      const count = document.querySelector('.count');
      assert.equal(count.textContent, '0');
      document.querySelector('.btn').click(); await tick();
      assert.equal(count.textContent, '1');
      document.querySelector('.btn.secondary').click(); await tick();
      assert.equal(count.textContent, '0');
      assert.equal(document.querySelector('.status').hidden, true);
      document.querySelector('.toggle').click(); await tick();
      assert.equal(document.querySelector('.status').hidden, false);
    } else if (name === 'tabs') {
      const details = document.querySelector('.tab[data-id="details"]');
      assert.equal(details.getAttribute('aria-selected'), 'false');
      details.click(); await tick();
      assert.equal(details.getAttribute('aria-selected'), 'true');
      assert.equal(document.querySelector('.panel[data-id="details"]').style.display, 'block');
      assert.equal(document.querySelector('.panel[data-id="overview"]').style.display, 'none');
    } else {
      const input = document.querySelector('input[type="text"]');
      input.value = 'Grace';
      input.dispatchEvent(new Event('input', {bubbles: true})); await tick();
      assert.equal([...document.querySelectorAll("strong")].find(element => element.getAttribute("vsn-bind:from") === "name").textContent, "Grace");
      const select = document.querySelector('select');
      select.value = 'editor';
      select.dispatchEvent(new Event('change', {bubbles: true})); await tick();
      assert.equal(document.querySelector('.cookbook-status strong').textContent, 'Grace / editor');
    }
    console.log(`${name}: served live runner interactions PASS`);
  } finally {
    engine.dispose();
    dom.window.close();
  }
}
