// Cross-component consistency: things each component gets right alone and the system gets wrong together, measured
// on the stories the Visual check already has open (tools/test/visual.mjs calls measure() on each story's first
// load, before it turns transitions off, so this adds one page.evaluate per story and no page load of its own).
//   node tools/test/consistency.mjs            the same measurements on storybook-static/, alone (a few minutes)
//   node tools/test/consistency.mjs --strict   exit 1 on a finding
// It warns; it does not fail a run. It becomes a failing check once it has gone a few days without a false finding.
// Two rules so far (GR390, GR391):
//   fade      A control whose fill changes on hover fades at motion-hover, as Button does. Read from the page's own
//             CSS: every rule with :hover that sets a background names the class it changes, and each element with
//             that class the rule reaches must have a transition on background-color. Rows and options (ROWS) are passed over
//             hundreds of times a day and change at once (foundations.md, Motion), so they are left out.
//   end icon  The icon at the end of a field (a chevron, a calendar, a clock, show and hide) ends END_GAP from the
//             field's end edge in every kind of field, and is the same size as the other fields' of that height, so
//             the icons of a column of fields line up.
// A deliberate exception goes in EXEMPT with its reason, in the same pull request, so a reviewer sees it.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Rows, options and cells: hover changes at once. A class counts with its modifiers (dk-calendar__day--today).
const ROWS = [
  'dk-calendar__day', 'dk-period-picker__period', 'dk-cascade-select__option', 'dk-combobox__option', 'dk-command-palette__option',
  'dk-mention-input__option', 'dk-time-picker__option', 'dk-menu__item', 'dk-list__item', 'dk-tree-view__row', 'dk-table__row',
  'dk-data-grid__row', 'dk-data-grid__cell', 'dk-event-calendar__event', 'dk-event-calendar__more', 'dk-event-calendar__day',
  'dk-kanban__card', 'dk-notification-center__item', 'dk-sidebar__item', 'dk-sidebar__menu-item', 'dk-navbar__menu-link', 'dk-toc__link',
];
/** @type {Record<string, string>} */
const EXEMPT = {
  'dk-color-picker__swatch': 'a swatch shows its color: hover draws a ring, the fill never changes',
  'dk-table__resize': 'the resize line shows at once, so it is under the pointer the moment a drag can start',
  'dk-splitter__handle': 'as Table\'s resize line',
  'dk-toggle-button': 'the pressed fill is a state, set at once; Button\'s own transition covers hover',
};
// The end of a field: the element measured, and the field it sits in.
const FIELD = '.dk-input, .dk-select, .dk-cascade-select__button, .dk-period-picker__button';
const END_GAP = 9;   // 8px inside the 1px border
const END = ['.dk-combobox__toggle', '.dk-date-picker__button', '.dk-time-picker__button', '.dk-password-input__toggle', '.dk-select__icon--chevron', '.dk-cascade-select__chevron', '.dk-period-picker__icon'];

/** Runs in the page: the classes whose fill a :hover rule changes. The stylesheets are the same on every story, so
    this is read once a run (walking them is most of the cost: about 100 ms a page). */
/* c8 ignore start */
function hoverClasses() {
  const strip = (s) => { let p; do { p = s; s = s.replace(/\([^()]*\)/g, ''); } while (s !== p); return s; };
  const hover = new Map();   // class -> the selectors that fill it on hover, without :hover, so only an element the rule reaches is measured
  const walk = (rules) => {
    for (const r of rules) {
      if (r.cssRules?.length) walk(r.cssRules);
      if (!(r instanceof CSSStyleRule) || !r.selectorText.includes(':hover')) continue;
      if (!r.style.getPropertyValue('background-color') && !r.style.getPropertyValue('background')) continue;
      for (const part of r.selectorText.split(/,(?![^()]*\))/)) {
        const bare = strip(part);
        if (!bare.includes(':hover') || bare.includes('::')) continue;
        const cls = bare.trim().split(/[\s>+~]+/).pop().match(/\.(dk-[\w-]+)/);
        if (cls) hover.set(cls[1], [...(hover.get(cls[1]) || []), part.replace(/:hover/g, '').trim()]);
      }
    }
  };
  for (const sheet of document.styleSheets) { try { walk(sheet.cssRules); } catch { /* another origin's sheet */ } }
  return [...hover].map(([cls, sels]) => [cls, [...new Set(sels)].join(', ')]);
}
/** Runs in the page. One row per class with a hover fill that is on the page, and one per end-of-field icon. */
function inPage({ FIELD, END, hover }) {
  const out = [];
  for (const [cls, sel] of hover) {
    let el;
    try { el = [...document.getElementsByClassName(cls)].find((n) => n.getClientRects().length && n.matches(sel) && !n.matches(':disabled, [aria-disabled="true"]')); } catch { continue; }
    if (!el) continue;
    const s = getComputedStyle(el);
    const props = s.transitionProperty.split(',').map((p) => p.trim());
    const times = s.transitionDuration.split(',').map((t) => parseFloat(t));
    const fades = props.some((p, i) => /^(all|background|background-color)$/.test(p) && (times[i % times.length] || 0) > 0);
    out.push({ rule: 'fade', cls, fades });
  }
  if (document.documentElement.dir !== 'rtl') {
    for (const sel of END) {
      for (const el of document.querySelectorAll(sel)) {
        const field = el.closest(FIELD);
        const icon = el.matches('.dk-icon') ? el : el.querySelector('.dk-icon') || el;
        if (!field || !icon.getClientRects().length) continue;
        const f = field.getBoundingClientRect(), i = icon.getBoundingClientRect();
        const gap = Math.round((f.right - i.right) * 2) / 2;
        if (gap <= 40) out.push({ rule: 'end', cls: sel.slice(1), height: Math.round(f.height), gap, size: Math.round(i.width * 2) / 2 });   // further in, it isn't the end icon
      }
    }
  }
  return out;
}
/* c8 ignore stop */

/** The measurements of the page as it stands. Call it before transitions are turned off. */
let hover = null;
export async function measure(page) {
  try {
    hover ??= await page.evaluate(hoverClasses);
    return await page.evaluate(inPage, { FIELD, END, hover });
  } catch { return []; }
}

const isRow = (cls) => ROWS.some((r) => cls === r || cls.startsWith(r + '--'));
const mode = (values) => { const n = new Map(); for (const v of values) n.set(v, (n.get(v) || 0) + 1); return [...n].sort((a, b) => b[1] - a[1])[0][0]; };

/** What the rows, from every story, add up to: one line per finding. */
export function judge(rows) {
  const out = [];
  const fade = new Map();
  for (const r of rows) if (r.rule === 'fade' && !isRow(r.cls) && !EXEMPT[r.cls]) fade.set(r.cls, (fade.get(r.cls) ?? true) && r.fades);
  for (const [cls, ok] of fade) if (!ok) out.push(`.${cls} changes its fill on hover with no fade: add "transition: background-color var(--motion-hover) var(--ease-move)" (and none under reduced motion), list it in ROWS if it is a row or an option, or in EXEMPT with why`);
  const ends = rows.filter((r) => r.rule === 'end');
  for (const height of new Set(ends.map((r) => r.height))) {
    const here = ends.filter((r) => r.height === height);
    const kinds = new Map();
    for (const r of here) kinds.set(`${r.cls} ${r.gap} ${r.size}`, r);
    const size = mode([...kinds.values()].map((r) => r.size));
    for (const r of kinds.values()) {
      if (Math.abs(r.gap - END_GAP) > 0.5) out.push(`.${r.cls}: in a ${height}px field its icon ends ${r.gap}px from the edge; every field's end icon ends ${END_GAP}px from it`);
      if (Math.abs(r.size - size) > 0.5) out.push(`.${r.cls}: in a ${height}px field its icon is ${r.size}px, where the other fields' are ${size}px`);
    }
  }
  for (const k of Object.keys(EXEMPT)) if (isRow(k)) out.push(`.${k} is in both ROWS and EXEMPT: keep one`);
  return [...new Set(out)].sort();
}

/** Prints the findings as warnings, with what the measuring cost. */
export function print(rows, ms) {
  const found = judge(rows);
  console.log(`\nConsistency (warnings only; tools/test/consistency.mjs): ${found.length} finding${found.length === 1 ? '' : 's'} from ${rows.length} measurements, ${(ms / 1000).toFixed(1)}s of measuring`);
  for (const f of found) console.log(`WARN  ${f}`);
  if (process.env.GITHUB_STEP_SUMMARY && found.length) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n### Consistency (warnings)\n\n${found.map((f) => `- ${f}`).join('\n')}\n`);
  return found;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const { PROJECT, browser, fail, inParallel, openUrl, serve } = await import('./lib.mjs');
  const SB = path.join(PROJECT, 'storybook-static');
  if (!fs.existsSync(path.join(SB, 'index.json'))) fail('No storybook-static/: run npm run build-storybook first.');
  const stories = Object.values(JSON.parse(fs.readFileSync(path.join(SB, 'index.json'), 'utf8')).entries).filter((e) => e.type === 'story' && /^components-/.test(e.id));
  const { base, close } = await serve(SB);
  const b = await browser();
  const pages = await Promise.all([0, 1].map(async () => (await b.newContext({ viewport: { width: 1000, height: 800 } })).newPage()));
  const rows = [];
  let ms = 0;
  await inParallel(stories, pages, async (e, page) => {
    if (await openUrl(page, `${base}/iframe.html?id=${e.id}&viewMode=story`)) return [];
    await page.waitForFunction(() => document.querySelector('#storybook-root')?.children.length > 0, null, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(150);
    const t = performance.now();
    rows.push(...await measure(page));
    ms += performance.now() - t;
    return [];
  });
  await b.close();
  close();
  const found = print(rows, ms);
  process.exitCode = process.argv.includes('--strict') && found.length ? 1 : 0;
}
