// serupa-purge --components (bin/serupa-purge.mjs): each component's preview, trimmed to the styles it names, renders
// exactly as with the whole bundle. Apart from page.mjs, so the checks shards can share out the longest checks.
// Build first (npm run build).
//   node tools/test/purge-components.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { ENGINE, PROJECT, writePage, browser, cleanup, report, done, inParallel } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const b = await browser();

// serupa-purge --components: each component's preview, named as its only source, renders identically with the
// styles of every component it doesn't name dropped (components.json says which ones it needs)
{
  const dir = path.join(PROJECT, '.test-tmp');
  fs.mkdirSync(dir, { recursive: true });
  const comps = fs.readdirSync(path.join(PROJECT, 'src', 'components')).filter((c) => fs.existsSync(path.join(PROJECT, 'src', 'components', c, 'preview.html')));
  const styles = async (url) => {
    const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
    await p.goto(url);
    await p.evaluate(async () => { await Promise.all([...document.fonts].map((f) => f.load())); await document.fonts.ready; });
    // Settled: React has mounted (the page renders it from a script) and nothing changed for 300 ms, which also
    // covers previews that open a popover on a 50 ms timer. A fixed wait wasn't enough on a busy CI runner, where
    // the trimmed page was compared while still half-rendered.
    await p.waitForLoadState('networkidle');
    await p.evaluate(() => new Promise((resolve) => {
      let quiet = setTimeout(done, 300);
      const mo = new MutationObserver(() => { clearTimeout(quiet); quiet = setTimeout(done, 300); });
      const cap = setTimeout(done, 10000);
      function done() { mo.disconnect(); clearTimeout(cap); requestAnimationFrame(() => requestAnimationFrame(() => resolve(undefined))); }
      mo.observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
    }));
    // An Image fades in only when its picture arrives a moment after mount (dk-image--fades), which load timing
    // decides, not the CSS: two loads of one page can differ there. Taken off in both before the comparison.
    await p.evaluate(() => { for (const e of document.querySelectorAll('.dk-image--fades')) e.classList.remove('dk-image--fades'); });
    const r = await p.evaluate(() => [...document.querySelectorAll('body *')].map((e) => { const s = getComputedStyle(e); const o = []; for (let i = 0; i < s.length; i++) o.push(s[i] + ':' + s.getPropertyValue(s[i])); return e.className + ' ' + o.sort().join(';'); }));
    await p.close(); return r;
  };
  // Four at a time: every page is written first (writePage rewrites the shared tokens file, which a page loading
  // meanwhile could read half-written), then the trims run as parallel processes and the pages load in parallel tabs.
  const jobs = comps.map((c) => {
    const src = path.join(PROJECT, 'src', 'components', c, 'preview.html');
    const html = fs.readFileSync(src, 'utf8');
    const head = (html.match(/<style>[\s\S]*?<\/style>/) || [''])[0] + '<style>*{animation:none!important;transition:none!important}</style>';
    const body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
    const out = path.join(dir, `purge-${c}.css`);
    return { c, src, out, full: writePage(`pc-full-${c}.html`, body, { react: true, extraHead: head }), min: writePage(`pc-min-${c}.html`, body, { react: true, extraHead: head, bundle: `purge-${c}.css` }) };
  });
  // Tabs at once in Chromium only: Firefox and WebKit give focus to one tab of a browser, so a preview that opens a
  // panel or shows a focus ring in another tab differs (the cross-browser run, 8 Nov 2026).
  const four = ENGINE === 'chromium' ? [0, 1, 2, 3] : [0];
  await inParallel(jobs, four, ({ src, out }) => new Promise((resolve, reject) => execFile(process.execPath, [path.join(PROJECT, 'bin', 'serupa-purge.mjs'), src, '-o', out, '--css', path.join(PROJECT, 'dist', 'bundle.css'), '--components'], (err) => (err ? reject(err) : resolve(undefined)))));
  const diffs = await inParallel(jobs, four, async ({ full: fullUrl, min }) => {
    const a = await styles(fullUrl), z = await styles(min);
    const d = []; a.forEach((x, i) => { if (x !== z[i]) { const A = x.split(';'), Z = (z[i] || '').split(';'); A.forEach((y, j) => { if (y !== Z[j]) d.push(`${i} ${y} ≠ ${Z[j]}`); }); } });
    if (a.length !== z.length) d.unshift(`${a.length} elements with the full CSS, ${z.length} with the trimmed`);
    return d;
  });
  const bundleSize = fs.statSync(path.join(PROJECT, 'dist', 'bundle.css')).size;
  const full = bundleSize * jobs.length, small = jobs.reduce((n, { out }) => n + fs.statSync(out).size, 0);
  jobs.forEach(({ c }, i) => t(`serupa-purge --components: ${c}'s preview renders identically`, !diffs[i].length, diffs[i].slice(0, 3).join(' | ')));
  t(`serupa-purge --components: ${comps.length} previews average ${(small / comps.length / 1024).toFixed(0)} KB of CSS`, small < full);
}

await b.close();
cleanup();
done(report('Trimmed CSS per component', R));
