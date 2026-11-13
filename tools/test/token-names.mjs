// A component token names the part, then the property, then the state: --button-bg-disabled, --tabs-text-selected,
// --checkbox-bg-checked-hover (CONTRIBUTING.md, Token names). Most do; the state put before the property
// (--button-disabled-bg) reads as a part called "disabled" and sorts away from its siblings in the token table.
//   node tools/test/token-names.mjs
// GAPS lists the tokens still to rename, each with the name it moves to; the list only shrinks. A rename keeps the
// old name as an inner fallback (var(--button-bg-disabled, var(--button-disabled-bg, …))) until 15.0.0.
// ALLOW lists names where the word is a part, not a state, with why.
import fs from 'node:fs';
import { done, report } from './lib.mjs';
import { components } from '../tokens/readme-tables.mjs';

const STATE = 'hover|active|pressed|disabled|selected|current|checked|error|open|expanded|invalid|dragging';
const PROPERTY = 'bg|text|color|border|width|shadow|depth|outline|fill|layer';
const WRONG = new RegExp(`-(?:${STATE})-(?:${PROPERTY})(?:-|$)`);

const GAPS = {};
const ALLOW = {
  '--badge-hover-layer': 'the hover layer is a part: the shade laid over any tone on hover, not a color of the badge',
  '--badge-active-layer': 'the press layer, as the hover layer above',
  '--field-error-color': 'the error is a part: the message under the field',
  '--file-upload-error-color': 'the error message under the drop area, as Field\'s',
};

/** Every cssVar in one tokens.json, but a renamed token's old name, deprecated until the next major. */
const vars = (o, out = []) => {
  for (const v of Object.values(o)) {
    if (!v || typeof v !== 'object') continue;
    const c = v.$extensions?.['com.serupa']?.cssVar;
    if (c) { if (!v.$deprecated) out.push(c); } else vars(v, out);
  }
  return out;
};
const all = components().flatMap((c) => vars(JSON.parse(fs.readFileSync(c.tokens, 'utf8'))).map((v) => ({ v, file: c.file })));
const names = new Set(all.map((x) => x.v));
const wrong = all.filter((x) => WRONG.test(x.v) && !GAPS[x.v] && !ALLOW[x.v]);

done(report('Token names', [
  { name: 'a component token names the part, then the property, then the state (--button-bg-disabled)', ok: wrong.length === 0,
    detail: wrong.map((x) => `${x.v} (${x.file})`).join(', ') + ': put the state last, or, if the word is a part, list it in ALLOW in tools/test/token-names.mjs with why' },
  ...Object.entries(GAPS).filter(([old]) => !names.has(old)).map(([old, to]) => ({ name: `${old} is still to be renamed ${to}`, ok: false, detail: `it is gone: take it out of GAPS in tools/test/token-names.mjs` })),
  ...Object.keys(ALLOW).filter((k) => !names.has(k)).map((k) => ({ name: `${k} is still a token`, ok: false, detail: 'take it out of ALLOW in tools/test/token-names.mjs' })),
  // The rule itself, on names it must catch and names it must leave.
  { name: 'the rule catches a state before the property and leaves a state after it', ok:
    ['--x-disabled-bg', '--x-selected-text', '--x-selected-depth', '--x-hover-bg-raised'].every((n) => WRONG.test(n)) &&
    !['--x-bg-disabled', '--x-text-selected', '--x-bg-checked-hover', '--x-focus-ring', '--x-today-color', '--x-loading-duration'].some((n) => WRONG.test(n)),
    detail: String(WRONG) },
]));
