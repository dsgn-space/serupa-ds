// Chart colors (CH1): the tokens a chart draws with, in every theme. The WCAG pairs (each series 3:1 on the page and
// on a raised card, the ramps' strong ends 3:1, the axis 3:1, labels 4.5:1) are in tools/tokens/contrast-pairs.mjs
// with the rest, checked by foundation.mjs. This checks what a pair can't say:
// - neighbouring series (1 and 2 … 8 and 1) alternate darker and lighter, 1.7:1 apart at least, so two that touch
//   aren't told apart by hue alone; chart-gap is the page, so each series has 3:1 against the gap between them;
// - the sequential ramp stands out more from the page at each step, and the diverging one from its middle outward,
//   each step 1.15:1 from the next at least;
// - base.css gives every chart token a forced-colors value, and none of them makes utility classes.
//   node tools/test/chart-colors.mjs
import { read, report, done } from './lib.mjs';
import { families } from '../utilities/families.mjs';

const R = [];
const t = (name, ok, detail = '') => R.push({ name, ok: !!ok, detail });
const json = JSON.parse(read('tokens.json'));
const all = json.color.tokens;
const byName = new Map(all.map((x) => [x.name, x.value]));
const THEMES = json.color.themes.map((x) => x.id);
const resolve = (name, th) => {
  const v = byName.get(name);
  const raw = typeof v === 'object' ? (v[th] ?? Object.values(v)[0]) : v;
  const m = /^\{(.+)\}$/.exec(raw);
  return m ? resolve(m[1], th) : raw;
};
const lum = (h) => {
  h = h.replace(/^#/, '');
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = [0, 2, 4].map((i) => f(parseInt(h.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const fmt = (n) => n.toFixed(2);

const series = all.map((x) => x.name).filter((n) => /^chart-\d+$/.test(n));
const seq = all.map((x) => x.name).filter((n) => /^chart-seq-\d+$/.test(n));
const div = all.map((x) => x.name).filter((n) => /^chart-div-\d+$/.test(n));
t('8 series, a 5-step sequential ramp and a 7-step diverging one, in order', series.length === 8 && seq.length === 5 && div.length === 7
  && series.every((n, i) => n === `chart-${i + 1}`) && seq.every((n, i) => n === `chart-seq-${i + 1}`) && div.every((n, i) => n === `chart-div-${i + 1}`));

for (const th of THEMES) {
  const c = (n) => resolve(n, th), page = c('surface');
  const near = series.map((n, i) => [n, series[(i + 1) % series.length], ratio(c(n), c(series[(i + 1) % series.length]))]);
  const low = near.filter(([, , r]) => r < 1.7);
  t(`${th}: neighbouring series are 1.7:1 apart`, !low.length, low.map(([a, b, r]) => `${a}/${b} ${fmt(r)}`).join(', '));
  const sides = series.map((n) => lum(c(n)) > lum(page));
  t(`${th}: neighbouring series alternate darker and lighter`, near.every(([a, b]) => (lum(c(a)) > lum(c(b))) !== (lum(c(b)) > lum(c(series[(series.indexOf(b) + 1) % 8])))) && sides.every((s) => s === sides[0]), series.map((n) => fmt(lum(c(n)))).join(' '));
  t(`${th}: chart-gap is the page`, c('chart-gap') === page, `${c('chart-gap')} vs ${page}`);
  const s = seq.map((n) => ratio(c(n), page));
  t(`${th}: each sequential step stands out more from the page, 1.15:1 from the last`, s.every((r, i) => !i || (r > s[i - 1] && ratio(c(seq[i]), c(seq[i - 1])) >= 1.15)), s.map(fmt).join(' '));
  const d = div.map((n) => ratio(c(n), page)), mid = 3;
  const out = (i) => (i < mid ? d[i] > d[i + 1] && ratio(c(div[i]), c(div[i + 1])) >= 1.15 : i > mid ? d[i] > d[i - 1] && ratio(c(div[i]), c(div[i - 1])) >= 1.15 : true);
  t(`${th}: the diverging ramp stands out more from the page away from its middle, 1.15:1 a step`, d.every((_, i) => out(i)), d.map(fmt).join(' '));
}

const base = read('src/styles/base.css');
const forced = /@media \(forced-colors: active\) \{([\s\S]*?)\n\}/.exec(base)?.[1] || '';
const chartNames = all.map((x) => x.name).filter((n) => n.startsWith('chart-'));
const missing = chartNames.filter((n) => !new RegExp(`--${n}:\\s*[A-Za-z]+;`).test(forced));
t('base.css: every chart token has a forced-colors value', forced && !missing.length, missing.join(', '));
const made = families(json).color.map((x) => x.t).filter((n) => n.startsWith('chart-'));
t('the chart tokens make no utility classes (a chart reads them as variables)', !made.length, made.join(', '));

done(report('Chart colors', R));
