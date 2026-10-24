// Opening a Dialog or Drawer locks the page's scrolling without shifting it: with classic scrollbars (Windows, Linux,
// macOS set to show them) the page keeps the scrollbar's space while it is gone, and a page with no scrollbar gets no
// extra space. Chromium with its scrollbars shown (Playwright hides them by default). Build first (npm run build).
//   node tools/test/scroll-lock.mjs
import { chromium } from 'playwright';
import { writePage, cleanup, report, done, fail } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
let b;
try { b = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] }); } catch (e) { fail(`Can't start Chromium: ${e.message.split('\n')[0]}`); }

const page = (tall) => writePage(`scroll-lock-${tall ? 'tall' : 'short'}.html`, `<div id="bar" style="height:20px;background:#ccc"></div>
<div style="height:${tall ? 3000 : 10}px"></div><div id="root"></div>
<script>
var h = React.createElement, S = window.Serupa;
function App() {
  var d = React.useState(null), which = d[0], set = d[1];
  window.show = set;
  return h(React.Fragment, null,
    h(S.Dialog, { open: which === 'dialog', onOpenChange: function () { set(null); }, title: 'Dialog' }, 'Body'),
    h(S.Drawer, { open: which === 'drawer', onOpenChange: function () { set(null); }, title: 'Drawer' }, 'Body'));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`, { react: true });

const width = (p) => p.evaluate(() => document.getElementById('bar').getBoundingClientRect().width);
const scrollbar = (p) => p.evaluate(() => innerWidth - document.documentElement.clientWidth);
for (const tall of [true, false]) {
  const p = await b.newPage({ viewport: { width: 800, height: 600 } });
  await p.goto(page(tall));
  await p.waitForFunction(() => typeof window.show === 'function');
  const bar = await scrollbar(p);
  if (tall && !bar) { t('the page shows a classic scrollbar (else nothing here can be checked)', false, 'Chromium drew no scrollbar'); await p.close(); continue; }
  const before = await width(p);
  for (const which of ['dialog', 'drawer']) {
    await p.evaluate((w) => window.show(w), which);
    await p.waitForSelector(`dialog[open]`);
    const open = { width: await width(p), scrolls: await p.evaluate(() => getComputedStyle(document.documentElement).overflow) };
    await p.evaluate(() => window.show(null));
    await p.waitForFunction(() => !document.querySelector('dialog[open]'));
    const after = await width(p);
    const name = which === 'dialog' ? 'Dialog' : 'Drawer';
    t(`${name}, ${tall ? `a page with a ${bar}px scrollbar` : 'a page that doesn\'t scroll'}: scrolling locks while open, and the page doesn't move (${before}px wide before, while open and after)`,
      open.scrolls === 'hidden' && open.width === before && after === before, JSON.stringify({ before, open, after }));
  }
  await p.close();
}
await b.close();
cleanup();
done(report('Scroll lock', R));
