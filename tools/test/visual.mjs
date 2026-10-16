// Visual snapshots: renders each component preview (components/*/preview.html) in every theme,
// with hover and focus states, and compares it with the saved image in baseline-visual/.
//   node tools/test/visual.mjs            check
//   node tools/test/visual.mjs --update   accept the current look as the new baseline
// Small anti-aliasing differences between machines are tolerated (TOLERANCE of pixels may differ).
import fs from 'node:fs';
import path from 'node:path';
import { HERE, PROJECT, read, writePage, browser, cleanup, tokensCss, report, suffix } from './lib.mjs';

const TOLERANCE = 0.002;          // share of pixels allowed to differ
const DIR = path.join(HERE, `baseline-visual${suffix}`);
const update = process.argv.includes('--update');
fs.mkdirSync(DIR, { recursive: true });

const comps = fs.readdirSync(path.join(PROJECT, 'components')).filter((c) => fs.existsSync(path.join(PROJECT, 'components', c, 'preview.html')) && c !== 'Cover');
const { themes } = tokensCss();
const b = await browser();
const page = await b.newPage({ viewport: { width: 900, height: 600 }, deviceScaleFactor: 1 });
const R = [];

async function diff(a, bb) {   // share of differing pixels, computed in the browser (no image libraries needed)
  return page.evaluate(async ([a, bb]) => {
    const load = (s) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = 'data:image/png;base64,' + s; });
    const [x, y] = await Promise.all([load(a), load(bb)]);
    if (x.width !== y.width || x.height !== y.height) return 1;
    const c = (i) => { const cv = document.createElement('canvas'); cv.width = i.width; cv.height = i.height; const g = cv.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height).data; };
    const d1 = c(x), d2 = c(y); let n = 0;
    for (let k = 0; k < d1.length; k += 4) if (Math.abs(d1[k] - d2[k]) + Math.abs(d1[k + 1] - d2[k + 1]) + Math.abs(d1[k + 2] - d2[k + 2]) > 24) n++;
    return n / (d1.length / 4);
  }, [a, bb]);
}

for (const c of comps) {
  const src = read(`components/${c}/preview.html`);
  const style = (src.match(/<style>[\s\S]*?<\/style>/) || [''])[0];
  const body = src.slice(src.indexOf('<body>') + 6, src.lastIndexOf('</body>'));
  const url = writePage(`${c}.html`, body, { react: true, extraHead: style + '<style>.dk-btn__spinner,.animate-spin,.dk-loader,.dk-loader *{animation:none!important}*{transition:none!important;caret-color:transparent}</style>' });
  for (const th of themes) {
    for (const state of ['rest', 'hover', 'focus']) {
      await page.goto(url);
      await page.evaluate((th) => { document.documentElement.setAttribute('data-theme', th); const b = document.body; b.style.display = 'none'; void b.offsetHeight; b.style.display = ''; }, th);   // rebuild the boxes: Chromium doesn't repaint still currentColor gradients (the paused skeleton) on a theme change
      await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(150);
      if (state !== 'rest') {
        const first = page.locator('.dk-btn:not(:disabled)').first();
        if (!(await first.count())) continue;
        if (state === 'hover') await first.hover(); else await page.keyboard.press('Tab');
      }
      const shot = (await page.screenshot({ fullPage: true })).toString('base64');
      const file = path.join(DIR, `${c}-${th}-${state}.png`);
      if (update || !fs.existsSync(file)) { fs.writeFileSync(file, Buffer.from(shot, 'base64')); continue; }
      const share = await diff(fs.readFileSync(file).toString('base64'), shot);
      if (share > TOLERANCE) fs.writeFileSync(path.join(DIR, `${c}-${th}-${state}.actual.png`), Buffer.from(shot, 'base64'));
      R.push({ name: `${c} · ${th} · ${state}`, ok: share <= TOLERANCE, detail: `${(share * 100).toFixed(2)}% of pixels differ; see ${c}-${th}-${state}.actual.png` });
    }
  }
}
await b.close();
cleanup();
if (update || !R.length) { console.log('Visual baseline saved.'); process.exit(0); }
process.exit(report('Visual', R) ? 0 : 1);
