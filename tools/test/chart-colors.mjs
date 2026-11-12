// Chart colors (CH1): the tokens a chart draws with, in every theme. The WCAG pairs (each series 3:1 on the page and
// on a raised card, the ramps' strong ends 3:1, the axis 3:1, labels 4.5:1) are in tools/tokens/contrast-pairs.mjs
// with the rest, checked by foundation.mjs. This checks what a pair can't say:
// - neighbouring series (1 and 2 … 8 and 1) differ by hue for every reader: OKLab ΔE ×100 of 15+ as seen, and 8+
//   under protanopia and deuteranopia (Machado 2009, severity 1), the dataviz method's floors (GR171);
// - the first four series differ as every pair, for charts where any two marks can meet (a scatter, or two lines
//   that cross between their markers): ΔE 15+ as seen, 10+ under protanopia and deuteranopia, and 8+ under
//   tritanopia (Machado 2009, severity 1);
// - in light themes neighbours also alternate darker and lighter, 1.7:1 apart at least. Dark themes keep their series
//   in the mid-tone band (OKLCH L 0.48 to 0.72), where pale steps of blue and violet looked alike (GR171); 0.72 leaves
//   room for the dark themes' orange and cyan, which keep the first four apart under deuteranopia;
// - chart-gap is the page, so each series has 3:1 against the gap between them;
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
// OKLab, and colour vision deficiency by Machado, Oliveira and Fernandes (2009) at severity 1, on linear sRGB.
const linear = (h) => [1, 3, 5].map((i) => { const c = parseInt(h.slice(i, i + 2), 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
const MACHADO = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
  tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
};
const oklab = (h, cvd) => {
  let c = linear(h);
  if (cvd) c = MACHADO[cvd].map((r) => Math.min(1, Math.max(0, r[0] * c[0] + r[1] * c[1] + r[2] * c[2])));
  const [l, m, s] = [[0.4122214708, 0.5363325363, 0.0514459929], [0.2119034982, 0.6806995451, 0.1073969566], [0.0883024619, 0.2817188376, 0.6299787005]].map((r) => Math.cbrt(r[0] * c[0] + r[1] * c[1] + r[2] * c[2]));
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
};
const dE = (a, b, cvd) => { const x = oklab(a, cvd), y = oklab(b, cvd); return 100 * Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
const apart = (a, b) => dE(a, b) >= 15 && dE(a, b, 'protan') >= 8 && dE(a, b, 'deutan') >= 8;
const gaps = (a, b) => `${fmt(dE(a, b))}/${fmt(dE(a, b, 'protan'))}/${fmt(dE(a, b, 'deutan'))}/${fmt(dE(a, b, 'tritan'))}`;
const distinct = (a, b) => dE(a, b) >= 15 && dE(a, b, 'protan') >= 10 && dE(a, b, 'deutan') >= 10 && dE(a, b, 'tritan') >= 8;

const series = all.map((x) => x.name).filter((n) => /^chart-\d+$/.test(n));
const seq = all.map((x) => x.name).filter((n) => /^chart-seq-\d+$/.test(n));
const div = all.map((x) => x.name).filter((n) => /^chart-div-\d+$/.test(n));
t('8 series, a 5-step sequential ramp and a 7-step diverging one, in order', series.length === 8 && seq.length === 5 && div.length === 7
  && series.every((n, i) => n === `chart-${i + 1}`) && seq.every((n, i) => n === `chart-seq-${i + 1}`) && div.every((n, i) => n === `chart-div-${i + 1}`));

for (const th of THEMES) {
  const c = (n) => resolve(n, th), page = c('surface');
  const near = series.map((n, i) => [n, series[(i + 1) % series.length], ratio(c(n), c(series[(i + 1) % series.length]))]);
  const sides = series.map((n) => lum(c(n)) > lum(page));
  const close = near.filter(([a, b]) => !apart(c(a), c(b)));
  t(`${th}: neighbouring series differ by hue, as seen (ΔE 15+) and under protanopia and deuteranopia (8+)`, !close.length, close.map(([a, b]) => `${a}/${b} ${gaps(c(a), c(b))}`).join(', '));
  const first = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]].filter(([a, b]) => !distinct(c(series[a]), c(series[b])));
  t(`${th}: the first four series differ as every pair, as seen (15+) and under protanopia and deuteranopia (10+) and tritanopia (8+)`, !first.length, first.map(([a, b]) => `${series[a]}/${series[b]} ${gaps(c(series[a]), c(series[b]))}`).join(', '));
  t(`${th}: every series is on the same side of the page (all darker, or all lighter)`, sides.every((s) => s === sides[0]));
  if (th.endsWith('-dark')) {
    const L = (h) => oklab(h)[0];
    const out = series.filter((n) => L(c(n)) < 0.48 || L(c(n)) > 0.72);
    t(`${th}: every series is a mid-tone (OKLCH L 0.48 to 0.72), so none of them is pale`, !out.length, out.map((n) => `${n} ${fmt(L(c(n)))}`).join(', '));
  } else {
    const low = near.filter(([, , r]) => r < 1.7);
    t(`${th}: neighbouring series are 1.7:1 apart`, !low.length, low.map(([a, b, r]) => `${a}/${b} ${fmt(r)}`).join(', '));
    t(`${th}: neighbouring series alternate darker and lighter`, near.every(([a, b]) => (lum(c(a)) > lum(c(b))) !== (lum(c(b)) > lum(c(series[(series.indexOf(b) + 1) % 8])))), series.map((n) => fmt(lum(c(n)))).join(' '));
  }
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
