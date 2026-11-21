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
// What a page that lets people switch to any brand loads: tokens.css and brands/all.css.
const real = ['tokens.css', 'brands/all.css'].map((f) => fs.readFileSync(path.join(PROJECT, f), 'utf8')).join('\n');

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
// 17.0.0: tokens.css alone draws blue, and one brand's file is all a page needs for that brand. Each brand is read on
// the root (data-brand) and as a flat theme (data-theme), with --primary worked out to a color.
const primary = async (sheet, attrs) => {
  await page.setContent(`<!doctype html><html ${attrs}><head><style>${sheet}</style></head><body><i style="color: var(--primary)"></i></body></html>`);
  return page.evaluate(() => getComputedStyle(document.querySelector('i')).color);
};
const file = (f) => fs.readFileSync(path.join(PROJECT, f), 'utf8');
const blue = await primary(file('tokens.css'), 'data-brand="blue" data-mode="light"');
const own = { violet: await primary(file('tokens.css') + file('brands/violet.css'), 'data-brand="violet" data-mode="light"'), flat: await primary(file('tokens.css') + file('brands/violet.css'), 'data-theme="violet-dark"') };
const without = await primary(file('tokens.css'), 'data-brand="violet" data-mode="light"');
const fromAll = await primary(file('tokens.css') + file('brands/all.css'), 'data-brand="violet" data-mode="light"');
const others = await primary(file('tokens.css') + file('brands/pink.css'), 'data-brand="violet" data-mode="light"');
await b.close();
t('tokens.css alone has blue only: data-brand="violet" without brands/violet.css draws blue', without === blue, `${without} against ${blue}`);
t('brands/violet.css after tokens.css draws violet, on data-brand and on a flat data-theme, the same as brands/all.css', own.violet !== blue && own.violet === fromAll && own.flat !== blue && own.flat !== own.violet, JSON.stringify({ ...own, fromAll, blue }));
t('another brand\'s file doesn\'t draw violet', others === blue, `${others} against ${blue}`);

for (const where of Object.keys(shipped)) {
  const empty = names.filter((n) => shipped[where][n] !== '' && test[where][n] === '');
  t(`${where}: every token tokens.css sets has a value in tokens.test.css too`, !empty.length, empty.slice(0, 8).join(', '));
  const differ = names.filter((n) => test[where][n] !== '' && shipped[where][n] !== '' && test[where][n] !== shipped[where][n]);
  t(`${where}: and the same value`, !differ.length, differ.slice(0, 5).map((n) => `--${n}: ${test[where][n]} against ${shipped[where][n]}`).join('; '));
}
report('tokens.test.css', R);
done(R.every((r) => r.ok));
