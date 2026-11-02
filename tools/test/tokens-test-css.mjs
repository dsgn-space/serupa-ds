// The tokens the browser checks draw with (tokensCss() in lib.mjs, written to .test-tmp/tokens.test.css from
// tokens.json, so a token edit is tested before npm run tokens) give the page what tokens.css gives it: every
// token, on :root and in each theme, has a value in both, and the same one. A name with a dot (spacing-3.5) has to be
// escaped in a declaration and in var() alike; when it wasn't, --icon-size-xs read var(--spacing-3.5), which is
// invalid, and every page drew size="xs" icons at the inherited size (GR111).
//   node tools/test/tokens-test-css.mjs
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT, browser, tokens, tokensCss, report, done } from './lib.mjs';

const R = [];
const t = (name, ok, detail = '') => R.push({ name, ok: !!ok, detail });
const json = tokens();
const names = Object.values(json).flatMap((g) => (g && Array.isArray(g.tokens) ? g.tokens.map((x) => x.name) : []));
const { css, themes } = tokensCss(json);
const real = fs.readFileSync(path.join(PROJECT, 'tokens.css'), 'utf8');

const b = await browser();
const page = await b.newPage();
// Each property's computed value on :root (var() worked out; an invalid one is empty), per theme.
const read = async (sheet) => {
  await page.setContent(`<!doctype html><html><head><style>${sheet}</style></head><body></body></html>`);
  return page.evaluate(({ names, themes }) => {
    const out = {};
    for (const th of [null, ...themes]) {
      if (th) document.documentElement.setAttribute('data-theme', th); else document.documentElement.removeAttribute('data-theme');
      const s = getComputedStyle(document.documentElement);
      out[th || ':root'] = Object.fromEntries(names.map((n) => [n, s.getPropertyValue('--' + n).replace(/\s+/g, ' ').trim()]));
    }
    return out;
  }, { names, themes });
};
const test = await read(css), shipped = await read(real);
await b.close();

for (const where of Object.keys(shipped)) {
  const empty = names.filter((n) => shipped[where][n] !== '' && test[where][n] === '');
  t(`${where}: every token tokens.css sets has a value in tokens.test.css too`, !empty.length, empty.slice(0, 8).join(', '));
  const differ = names.filter((n) => test[where][n] !== '' && shipped[where][n] !== '' && test[where][n] !== shipped[where][n]);
  t(`${where}: and the same value`, !differ.length, differ.slice(0, 5).map((n) => `--${n}: ${test[where][n]} against ${shipped[where][n]}`).join('; '));
}
report('tokens.test.css', R);
done(R.every((r) => r.ok));
