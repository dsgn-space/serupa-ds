// Kbd: a single key, combinations (nested <kbd>, + between), named keys as words or Apple symbols with their
// names for screen readers, sizes, baseline alignment in text, contrast in every theme and tokens.
//   node tools/test/kbd.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = () => `<style>body { background: var(--surface); margin: 0; }</style><div id="root" style="padding:16px;display:flex;flex-direction:column;gap:12px"></div>
<script>
var D = window.Diki, h = React.createElement;
ReactDOM.createRoot(document.getElementById('root')).render(h(React.Fragment, null,
  h(D.Kbd, { id: 'one', ref: window.kr = React.createRef(), className: 'extra' }, 'Esc'),
  h(D.Kbd, { id: 'k' }, 'k'),
  h(D.Kbd, { id: 'combo', keys: ['mod', 'shift', 'P'] }),
  h(D.Kbd, { id: 'arrows', keys: ['up', 'enter'] }),
  h(D.Kbd, { id: 'sm', size: 'sm', keys: ['alt', 'F4'] }),
  h('p', { id: 'para', style: { margin: 0 } }, 'Press ', h(D.Kbd, { id: 'inline' }, '/'), ' to search.'),
  h(D.Kbd, { id: 'tok', style: { '--kbd-bg': 'rgb(1, 2, 3)' } }, 'T')));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const keys = (p, id) => p.evaluate((id) => [...document.querySelectorAll('#' + id + ' .dk-kbd__key')].map((k) => k.textContent + (k.title ? '(' + k.title + ')' : '')).join(' '), id);
const spoken = (p, id) => p.evaluate((id) => { const el = document.getElementById(id).cloneNode(true); el.querySelectorAll('[aria-hidden]').forEach((x) => x.remove()); return [...el.querySelectorAll('.dk-kbd__key')].map((k) => k.textContent).join(' + '); }, id);

// Playwright's WebKit sends a Mac user agent even on Linux, and Kbd reads it too, so fake both the platform and the user agent.
const p = await (await b.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)' })).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.addInitScript(() => Object.defineProperty(navigator, 'platform', { get: () => 'Win32' }));
await p.goto(writePage('kbd.html', APP(), { react: true }));
await p.waitForTimeout(300);
const a = await p.evaluate(() => { const el = document.getElementById('one'), k = el.querySelector('.dk-kbd__key').getBoundingClientRect(); return { tag: el.tagName, inner: el.querySelector('.dk-kbd__key').tagName, text: el.textContent, ref: window.kr.current === el, cls: el.className, comp: el.dataset.component, h: k.height, w: k.width, font: getComputedStyle(el).fontFamily }; });
t('one key: a <kbd> holding a 24px keycap <kbd>, at least square, in the sans font, "Esc" read as "Escape"; ref and className reach the outer <kbd>', a.tag === 'KBD' && a.inner === 'KBD' && a.text === 'EscEscape' && (await spoken(p, 'one')) === 'Escape' && a.ref && /extra/.test(a.cls) && a.comp === 'kbd' && a.h === 24 && a.w >= 24 && /Inter/.test(a.font), JSON.stringify(a));
t('a single letter shows in capitals', (await keys(p, 'k')) === 'K');
const c = await p.evaluate(() => { const el = document.getElementById('combo'); return { keys: el.querySelectorAll('.dk-kbd__key').length, plus: [...el.querySelectorAll('.dk-kbd__plus')].map((x) => x.textContent + x.getAttribute('aria-hidden')).join() }; });
t('a combination: one keycap per key, with a hidden + between them', c.keys === 3 && c.plus === '+true,+true', JSON.stringify(c));
t('elsewhere than Apple: mod is Ctrl, shift is Shift, alt is Alt', (await keys(p, 'combo')) === 'CtrlControl(Control) Shift P' && (await keys(p, 'sm')).startsWith('Alt'), await keys(p, 'combo'));
t('arrows and Enter show as symbols with their names read out', (await spoken(p, 'arrows')) === 'Up arrow + Enter' && (await keys(p, 'arrows')).startsWith('↑'), await spoken(p, 'arrows'));
const sm = await p.evaluate(() => document.querySelector('#sm .dk-kbd__key').getBoundingClientRect().height);
t('sm: 20px keycaps', sm === 20, String(sm));
const base = await p.evaluate(() => { const r = document.createRange(); const para = document.getElementById('para'); r.setStart(para.firstChild, 0); r.setEnd(para.firstChild, 5); const word = r.getBoundingClientRect(), key = document.querySelector('#inline .dk-kbd__key').getBoundingClientRect(); return { wordMid: (word.top + word.bottom) / 2, keyMid: (key.top + key.bottom) / 2 }; });
t('inline in a sentence it sits with the text (centered within 3px of the words)', Math.abs(base.wordMid - base.keyMid) <= 3, JSON.stringify(base));
const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const k = getComputedStyle(document.querySelector('#combo .dk-kbd__key')), plus = getComputedStyle(document.querySelector('#combo .dk-kbd__plus')), page = getComputedStyle(document.body).backgroundColor;
    for (const [name, fg, bg, min] of [['label', k.color, k.backgroundColor, 4.5], ['+', plus.color, page, 4.5]]) { const r = ratio(rgb(fg), rgb(bg)); n++; if (r < min) low.push(`${th} ${name}: ${r.toFixed(2)}`); }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: labels and the + keep 4.5:1 in all six themes', contrast.low.length === 0 && contrast.n === 12, contrast.low.join('; '));
t('--kbd-bg overrides one key', await p.evaluate(() => getComputedStyle(document.querySelector('#tok .dk-kbd__key')).backgroundColor === 'rgb(1, 2, 3)'));

const mac = await (await b.newContext({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)' })).newPage();
mac.on('pageerror', (e) => errors.push(e.message));
await mac.addInitScript(() => Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' }));
await mac.goto(writePage('kbd-mac.html', APP(), { react: true }));
await mac.waitForTimeout(300);
t('on Apple devices: mod is ⌘ (read "Command"), shift ⇧, alt ⌥ (read "Option")', (await keys(mac, 'combo')).startsWith('⌘Command(Command) ⇧Shift(Shift) P') && (await spoken(mac, 'combo')) === 'Command + Shift + P' && (await spoken(mac, 'sm')) === 'Option + F4', await keys(mac, 'combo') + ' | ' + await spoken(mac, 'sm'));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Kbd', R) ? 0 : 1);
