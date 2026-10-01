// Documentation smoke checks against the built runtime; no visual browser claims.
import {readFile, readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';

const dom = new JSDOM('<body></body>', {url: 'http://localhost:8080/'});
for (const key of ['window', 'document', 'HTMLElement', 'Element', 'Node', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement', 'HTMLTemplateElement', 'HTMLFormElement', 'MutationObserver', 'CustomEvent', 'Event', 'MouseEvent', 'Document', 'NodeFilter']) {
  globalThis[key] = dom.window[key];
}
const {Engine, autoMount} = await import('../dist/index.js');
const sources = new Map();
let count = 0;
for (const file of await readdir('site/content')) {
  if (!file.endsWith('.md')) continue;
  const text = await readFile(`site/content/${file}`, 'utf8');
  const blocks = [...text.matchAll(/```cfs\n([\s\S]*?)```/g)].map(match => match[1]);
  sources.set(file, blocks);
  for (const block of blocks) {
    const engine = new Engine();
    // An event-only reference fragment needs a behavior root.
    engine.registerBehaviors(/^on\s/.test(block) ? `#fixture { ${block} }` : block);
    engine.dispose();
    count++;
  }
}

const cfs = sources.get('reference-cfs.md');
document.body.innerHTML = '<section id="summary"></section>';
const summary = new Engine();
summary.registerBehaviors(cfs.find(source => source.startsWith('#summary')));
await summary.mount(document.body);
const summaryScope = summary.getScope(document.getElementById('summary'));
assert.equal(await summaryScope.get('calculate')(), 12);
assert.equal(summaryScope.get('status'), 'Over ten');
summary.dispose();

document.body.innerHTML = '<section id="panel"><button class="trigger">Toggle</button></section>';
const panel = new Engine();
panel.registerBehaviors(cfs.find(source => source.startsWith('#panel')));
await panel.mount(document.body);
const trigger = document.querySelector('.trigger');
assert.equal(trigger.getAttribute('aria-expanded'), 'false');
trigger.click();
await new Promise(resolve => setTimeout(resolve, 0));
assert.equal(trigger.getAttribute('aria-expanded'), 'true');
panel.dispose();

const originalFetch = globalThis.fetch;
try {
  globalThis.fetch = async () => ({ok: true, json: async () => ({name: 'Ada'})});
  document.body.innerHTML = '<section id="profile"><button class="reload">Load</button></section>';
  const profile = new Engine();
  profile.registerBehaviors(cfs.find(source => source.startsWith('use fetch')));
  await profile.mount(document.body);
  const profileScope = profile.getScope(document.getElementById('profile'));
  await profileScope.get('load')();
  assert.equal(profileScope.get('name'), 'Ada');
  assert.equal(profileScope.get('loading'), false);
  profile.dispose();

  document.body.innerHTML = '<section id="export"></section>';
  const exporter = new Engine();
  exporter.registerBehaviors(cfs.find(source => source.startsWith('use JSON')));
  await exporter.mount(document.body);
  const exportScope = exporter.getScope(document.getElementById('export'));
  await exportScope.get('encode')();
  assert.equal(exportScope.get('encoded'), '[1,2]');
  exporter.dispose();

  // Exercise the documented .vsn URL through autoMount, including src precedence.
  const doc = await readFile('site/content/reference-cfs.md', 'utf8');
  const externalTag = doc.match(/<script type="text\/vsn" src="\/path\/to\/some\.vsn"><\/script>/)[0];
  document.body.innerHTML = `<section id="counter"><strong vsn-bind:from="count">0</strong><button vsn-on:click="count = count + 1;">Add one</button></section>${externalTag}`;
  document.querySelector('script').textContent = '#counter { count: 99; }';
  let requested;
  globalThis.fetch = async (url, options) => {
    requested = url;
    assert.ok(options.signal);
    return {ok: true, text: async () => cfs[0]};
  };
  const automatic = autoMount(document);
  for (let i = 0; i < 50 && !requested; i++) await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(requested, 'http://localhost:8080/path/to/some.vsn');
  const value = document.querySelector('strong');
  assert.equal(value.textContent, '0');
  document.querySelector('button').click();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(value.textContent, '1');
  automatic.dispose();
} finally {
  globalThis.fetch = originalFetch;
  dom.window.close();
}
console.log(`${count} documented CFS blocks parsed; scope alias, loop, async action, pipe, external .vsn loading and counter PASS`);
