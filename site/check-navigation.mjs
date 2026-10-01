import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {JSDOM} from 'jsdom';

const base = process.argv[2] || 'http://localhost:8080';
const script = await readFile(new URL('./assets/navigation.js', import.meta.url), 'utf8');
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const paths = [...sitemap.matchAll(/<loc>https:\/\/www.vsnjs.org([^<]*)<\/loc>/g)].map(match => match[1]);
assert.equal(paths.length, 26);

for (const path of [...paths, '/missing']) {
  const dom = new JSDOM(await (await fetch(base + path)).text(), {url:base + path});
  const {window} = dom;
  const destinations = [];
  try {
    // jsdom cannot navigate documents; record the real script's navigation calls.
    vm.runInNewContext(script, {
      document:window.document,
      window:{
        location:{assign:destination => destinations.push(destination)},
        addEventListener:window.addEventListener.bind(window),
      },
    });
    for (const menu of window.document.querySelectorAll('.mobile-navigation select')) {
      assert.equal(menu.value, menu.dataset.current, `${path}: initial selection`);
      menu.dispatchEvent(new window.Event('change', {bubbles:true}));
      assert.equal(destinations.length, 0, `${path}: current page should not navigate`);
      const target = [...menu.options].find(option => option.value && option.value !== menu.dataset.current).value;
      menu.value = target;
      menu.dispatchEvent(new window.Event('change', {bubbles:true}));
      assert.equal(destinations.pop(), target, `${path}: chosen destination`);
      for (const persisted of [true, false]) {
        menu.value = target;
        window.dispatchEvent(new window.PageTransitionEvent('pageshow', {persisted}));
        assert.equal(menu.value, menu.dataset.current, `${path}: history restoration`);
        assert.equal(destinations.length, 0, `${path}: restoration should not navigate`);
      }
    }
  } finally {
    window.close();
  }
}
console.log('27 pages: dropdown navigation, initial selection and cached/uncached history restoration PASS');
