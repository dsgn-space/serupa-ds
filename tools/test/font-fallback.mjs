// "Inter Fallback" (144, tools/fonts/fallback.mjs): until Inter arrives, text draws in Arial (or Liberation Sans,
// which has Arial's metrics) sized like Inter, so it doesn't move when Inter swaps in. Checks, for each face in
// tokens.json's type.fallbacks (upright 400, 500, 600 and 700; italic 400 and 700):
//   - tokens.css writes it, and --font-sans lists it right after Inter;
//   - it finds a font on this machine (Liberation Sans on Linux: playwright install-deps installs it);
//   - a line of English is within 2% of its width in Inter, and its ascent and descent (at 100px, where a pixel's
//     rounding doesn't hide them) are within a pixel of Inter's;
//   - at every size of the type scale, a line's baseline and its line box are on the same pixel as Inter's (less than a
//     pixel apart in an engine that keeps fractions of one, where Chromium rounds to whole pixels) (Inter's
//     ascent is 15.5px at 16px: a fallback a hair under it rounds down, and all body text sits 1px higher until Inter
//     arrives);
//   - a paragraph in a 320px column (a phone) wraps within a line of Inter's (lines within 2% of each other's width
//     can still break at another word, so the same count can't be promised), and, where plain Arial is more than 3%
//     off, the line is at least 3 times closer to Inter's width than plain Arial's, which is what a Mac or Windows page
//     drew before. Where plain Arial is already within 3% (WebKit's bold faces: just over 2.0 and 2.5% off, against 1.1%
//     for the fallback), "3 times closer" would ask for under 0.7 to 0.8%, tighter than the 2% bound every engine is
//     held to.
//   node tools/test/font-fallback.mjs
import { read, browser, report, done, servePages } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const tokens = JSON.parse(read('tokens.json'));
const fallbacks = tokens.type.fallbacks || [];
const css = read('tokens.css');

t('tokens.json has an Inter Fallback face for upright 400, 500, 600 and 700, and italic 400 and 700', fallbacks.length === 6
  && ['normal 400', 'normal 500', 'normal 600', 'normal 700', 'italic 400', 'italic 700'].every((k) => fallbacks.some((f) => `${f.style} ${f.weight}` === k)),
fallbacks.map((f) => `${f.style} ${f.weight}`).join(', '));
t('tokens.css writes each one with its size-adjust and overrides', fallbacks.every((f) => css.includes(`size-adjust: ${f.sizeAdjust};\n  ascent-override: ${f.ascentOverride};`)), '');
t('--font-sans lists Inter Fallback right after Inter', /--font-sans: Inter, "Inter Fallback",/.test(css), (/--font-sans:[^;]*/.exec(css) || [''])[0]);

const pages = servePages('fallback');
const inter = fallbacks.map((f) => `@font-face{font-family:I;src:url("${pages.at(f.style === 'italic' ? 'tools/fonts/source/InterVariable-Italic.woff2' : 'tools/fonts/source/InterVariable.woff2')}");font-weight:100 900;font-style:${f.style}}`);
const fall = fallbacks.map((f) => `@font-face{font-family:F;src:${f.local.map((n) => `local("${n}")`).join(',')};font-weight:${f.weight};font-style:${f.style};size-adjust:${f.sizeAdjust};ascent-override:${f.ascentOverride};descent-override:${f.descentOverride};line-gap-override:${f.lineGapOverride}}`);
const TEXT = 'Your changes are saved. Invite people to this project by email, then choose what each of them can see and edit.';
const PARA = 'Invite people to this project by email. Each of them gets a link that works for seven days, and you choose what they can see and edit before they join. You can change it later in Settings, under Members.';
const rows = fallbacks.map((f) => `<div data-k="${f.style} ${f.weight}" style="font-style:${f.style};font-weight:${f.weight}"><p><span class="i">${TEXT}</span><br><span class="f">${TEXT}</span></p><p class="col i">${PARA}</p><p class="col f">${PARA}</p><p><span class="s">${TEXT}</span></p></div>`).join('');
const page = pages.write('page.html', `<!doctype html><meta charset="utf-8"><style>${[...new Set(inter)].join('')}${fall.join('')}@font-face{font-family:A;src:local("Arial"),local("ArialMT"),local("Liberation Sans"),local("LiberationSans")}@font-face{font-family:A;src:local("Arial Italic"),local("Arial-ItalicMT"),local("Liberation Sans Italic"),local("LiberationSans-Italic"),local("Arial"),local("Liberation Sans");font-style:italic}@font-face{font-family:A;src:local("Arial Bold"),local("Arial-BoldMT"),local("Liberation Sans Bold"),local("LiberationSans-Bold"),local("Arial"),local("Liberation Sans");font-weight:700}@font-face{font-family:A;src:local("Arial Bold Italic"),local("Arial-BoldItalicMT"),local("Liberation Sans Bold Italic"),local("LiberationSans-BoldItalic"),local("Arial"),local("Liberation Sans");font-weight:700;font-style:italic}
body{margin:8px;font-size:16px;line-height:1.5} p{width:max-content} p.col{width:320px} .i{font-family:I} .f{font-family:F} .s{font-family:A}</style>${rows}`);

// Without hinting, as font-subsets.mjs: CI's Chromium hints by default, which rounds each glyph's advance to a whole
// pixel at 16px and moves a line's width by up to 4%, more than the 2% this checks. Hinting is the device's, not the face's.
const b = await browser(['--font-render-hinting=none']);
const p = await b.newPage();
await p.goto(page);
const got = await p.evaluate(async () => {
  await Promise.all([...document.fonts].map((f) => f.load().catch(() => {})));
  await document.fonts.ready;
  const faces = [...document.fonts].filter((f) => f.family === 'F').map((f) => `${f.style} ${f.weight} ${f.status}`);
  // Inter itself: measured against a font that never loaded, every comparison below would mean nothing.
  const interMissing = [...document.fonts].filter((f) => f.family === 'I' && f.status !== 'loaded').map((f) => `${f.style} ${f.status}`);
  const rows = [...document.querySelectorAll('[data-k]')].map((d) => {
    const [i, f] = [d.querySelector('span.i'), d.querySelector('span.f')].map((s) => s.getBoundingClientRect());
    const [ci, cf] = ['i', 'f'].map((c) => d.querySelector(`p.col.${c}`).getBoundingClientRect().height / 24);
    const ws = d.querySelector('span.s').getBoundingClientRect().width;
    const g = document.createElement('canvas').getContext('2d');
    const metric = (family) => { g.font = `${d.style.fontStyle} ${d.style.fontWeight} 100px ${family}`; const m = g.measureText('Hxg'); return [m.fontBoundingBoxAscent, m.fontBoundingBoxDescent]; };
    const line = (family, px) => {
      const e = document.createElement('div');
      e.style.cssText = `position:absolute;top:0;left:0;font:${d.style.fontStyle} ${d.style.fontWeight} ${px}px/normal ${family};white-space:nowrap`;
      e.innerHTML = 'Hg<span style="display:inline-block;width:1px;height:0"></span>';
      document.body.appendChild(e);
      const r = `${e.firstElementChild.getBoundingClientRect().bottom}/${e.getBoundingClientRect().height}`;
      e.remove();
      return r;
    };
    // Chromium rounds a line's ascent and height to whole pixels, so there the two are equal or a pixel apart. Firefox
    // and WebKit keep fractions (11.86 against 12): less than a pixel apart is the same pixel there, and the swap
    // moves the text by that fraction, not a pixel.
    const apart = (a, b) => a.split('/').some((v, k) => Math.abs(Number(v) - Number(b.split('/')[k])) >= 1);
    const lines = [12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96, 128].map((px) => [px, line('I', px), line('F', px)]).filter((r) => apart(r[1], r[2]));
    return { k: d.dataset.k, wi: i.width, wf: f.width, ws, ci, cf, mi: metric('I'), mf: metric('F'), lines };
  });
  return { faces, interMissing, rows };
});
await b.close();
pages.close();

t('Inter itself loads, upright and italic (else nothing here is measured against it)', !got.interMissing.length, got.interMissing.join(', '));
const missing = got.faces.filter((s) => !s.endsWith('loaded'));
t('each Inter Fallback face finds a font on this machine (Arial, Helvetica, Liberation Sans or Arimo)', got.faces.length === 6 && !missing.length,
  `${missing.join(', ')}: none of its local() names is installed; on Linux, apt install fonts-liberation`);
for (const r of got.rows) {
  const off = r.wf / r.wi - 1;
  const plain = r.ws / r.wi - 1;
  t(`${r.k}: a line of English in Inter Fallback is within 2% of its width in Inter, and 3 times closer than plain Arial where that is more than 3% off`, Math.abs(off) <= 0.02 && (Math.abs(plain) <= 0.03 || Math.abs(off) * 3 <= Math.abs(plain)),
    `${(off * 100).toFixed(1)}% (${r.wf.toFixed(1)} vs ${r.wi.toFixed(1)} px); plain Arial ${(plain * 100).toFixed(1)}%`);
  t(`${r.k}: its ascent and descent at 100px are within a pixel of Inter's`, Math.abs(r.mf[0] - r.mi[0]) <= 1 && Math.abs(r.mf[1] - r.mi[1]) <= 1, `${r.mf.join('/')} vs ${r.mi.join('/')} px`);
  t(`${r.k}: at every size of the type scale, a line's baseline and line box are on Inter's pixel`, !r.lines.length, r.lines.map((l) => `${l[0]}px: baseline/box ${l[2]} against Inter's ${l[1]}`).join('; '));
  t(`${r.k}: a paragraph in a 320px column wraps within a line of Inter's`, Math.abs(r.cf - r.ci) <= 1, `${r.cf} lines against Inter's ${r.ci}`);
}

done(report('Inter Fallback', R));
