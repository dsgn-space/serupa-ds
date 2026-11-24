// A part that fills on hover shows it's held down too (GR385): rows, tabs, days, page buttons, the small buttons in
// fields and lists. Hover is only for a pointer that hovers, so on a touch screen the held fill is the only sign a
// press landed. This fails a component stylesheet where a selector's :hover sets a background and no rule for the
// same selector has :active.
//   node tools/test/held-states.mjs
// EXEMPT holds the ones that show a press another way, or aren't pressed at all, each with why. GAPS holds the
// ones still to do, and only shrinks.
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT, done, report } from './lib.mjs';

const EXEMPT = {
  'Calendar .srp-calendar__day--in-range': 'a day in the range keeps its range fill; the plain day has the held fill',
  'Calendar .srp-calendar__day:where([data-selected])': 'the chosen day keeps its primary fill; the plain day has the held fill',
  'Calendar .srp-calendar__period:where([data-selected])': 'the chosen month or year keeps its primary fill, as the chosen day does; the plain one has the held fill',
  'Navbar .srp-navbar__link:where([data-current])': 'the current page keeps its fill; the plain link has the held fill',
  'Navbar .srp-navbar__menu-link:where([data-current])': 'the current page keeps its fill; the plain menu link has the held fill',
};
const GAPS = {};

const DIR = path.join(PROJECT, 'src', 'components');
// A part is its classes and any state attributes on it (.srp-calendar__day:where([data-selected]), ADR-0025: wrapped in :where() so the state adds no weight, as the old modifier class did).
const HOVER = /(?:^|[\s,{(>])((?:[a-z]+)?(?:\.srp-[a-z0-9_-]+)+(?:\[data-[a-z-]+\]|:where\(\[data-[a-z-]+\]\))*):hover[^{]*\{([^{}]*)\}/gm;
const missing = new Set();
for (const name of fs.readdirSync(DIR).sort()) {
  const file = path.join(DIR, name, `${name}.css`);
  if (!fs.existsSync(file)) continue;
  const css = fs.readFileSync(file, 'utf8');
  for (const m of css.matchAll(HOVER)) {
    if (!/background(?:-color)?\s*:/.test(m[2])) continue;
    const sel = m[1], esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const held = new RegExp(`${esc}(?:[^\\s{,]*:active|:is\\([^)]*:active)`).test(css);
    if (!held) missing.add(`${name} ${sel}`);
  }
}
const left = [...missing].filter((k) => !EXEMPT[k] && !GAPS[k]);

done(report('Held states', [
  { name: 'every part that fills on hover shows it\'s held down too (:active)', ok: left.length === 0,
    detail: `${left.join(', ')}: give it an :active fill one step past its hover (a …-bg-pressed component token), or, if it shows a press another way, list it in EXEMPT in tools/test/held-states.mjs with why` },
  ...Object.keys(EXEMPT).filter((k) => !missing.has(k)).map((k) => ({ name: `${k} is still exempt`, ok: false, detail: 'it has a held state now, or is gone: take it out of EXEMPT in tools/test/held-states.mjs' })),
  ...Object.keys(GAPS).filter((k) => !missing.has(k)).map((k) => ({ name: `${k} still has no held state`, ok: false, detail: 'it has one now: take it out of GAPS in tools/test/held-states.mjs' })),
]));
