/* eslint-disable */
// @ts-nocheck
// probe (not for merge)
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { PROJECT, browser } from './test/lib.mjs';
const out = fs.mkdtempSync(path.join(PROJECT, '.probe-site-'));
const built = spawnSync(process.execPath, [path.join(PROJECT, 'node_modules', 'vite', 'bin', 'vite.js'), 'build', '--config', path.join(PROJECT, 'tools', 'site', 'vite.config.mjs'), '--outDir', out, '--emptyOutDir', '--logLevel', 'error'], { cwd: PROJECT, encoding: 'utf8', env: { ...process.env, NODE_ENV: 'development' } });
console.log('PROBE built', built.status);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  let f = path.join(out, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(out) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(out, 'index.html');
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
const b = await browser();
const glide = async (label, prep) => {
  const context = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  await page.goto(base + '/components/button');
  await page.waitForTimeout(4000);
  const pre = await page.evaluate(prep || (() => ''));
  const res = await page.evaluate(() => new Promise((done) => {
    const a = [...document.querySelectorAll('.site-aside .dk-toc__panel a')].pop();
    const frames = [], t0 = performance.now();
    const tick = () => { frames.push([Math.round(performance.now() - t0), Math.round(scrollY)]); if (performance.now() - t0 < 2500) requestAnimationFrame(tick); else done({ h: document.documentElement.scrollHeight, n: frames.length, frames: frames.slice(0, 10), last: frames[frames.length - 1] }); };
    if (a) { const t1 = performance.now(); a.click(); const t2 = performance.now(); frames.push(['click', Math.round(t2 - t1)]); }
    else frames.push(['no link']);
    requestAnimationFrame(tick);
  }));
  console.log('PROBE glide', label, pre, JSON.stringify(res));
  await context.close();
};
await glide('as is');
await glide('no anatomy', () => { const n = document.querySelectorAll('.sb-anatomy').length; document.querySelectorAll('.sb-anatomy').forEach((e) => e.remove()); return 'removed ' + n; });
await glide('no since', () => { const n = document.querySelectorAll('.site-since').length; document.querySelectorAll('.site-since').forEach((e) => e.remove()); return 'removed ' + n; });
await glide('no demos', () => { const n = document.querySelectorAll('[data-site-demo]').length; document.querySelectorAll('[data-site-demo]').forEach((e) => e.remove()); return 'removed ' + n + ' h ' + document.documentElement.scrollHeight; });
await glide('no code blocks', () => { const n = document.querySelectorAll('.dk-code-block').length; document.querySelectorAll('.dk-code-block').forEach((e) => e.remove()); return 'removed ' + n; });
// A plain smooth scroll, no TOC: does WebKit glide on this page at all?
{
  const context = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  await page.goto(base + '/components/button');
  await page.waitForTimeout(4000);
  for (const to of [2000, 10000, 23000]) {
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(300);
    const r = await page.evaluate((to) => new Promise((done) => {
      const frames = [], t0 = performance.now();
      const tick = () => { frames.push([Math.round(performance.now() - t0), Math.round(scrollY)]); if (performance.now() - t0 < 2500) requestAnimationFrame(tick); else done({ n: frames.length, frames: frames.slice(0, 8), last: frames[frames.length - 1] }); };
      scrollTo({ top: to, behavior: 'smooth' });
      requestAnimationFrame(tick);
    }), to);
    console.log('PROBE plain smooth', to, JSON.stringify(r));
  }
  await context.close();
}
await b.close(); server.close(); fs.rmSync(out, { recursive: true, force: true });
// Storybook: the Chart docs page at 320px, and the anatomy stage's ancestors' widths.
{
  const dir = path.join(PROJECT, 'storybook-static');
  const sb = http.createServer((req, res) => {
    let f = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  }).listen(0);
  const b2 = await browser();
  const context = await b2.newContext({ viewport: { width: 320, height: 720 } });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${sb.address().port}/iframe.html?viewMode=docs&id=components-data-display-chart--docs`);
  await page.waitForTimeout(8000);
  const r = await page.evaluate(() => {
    const st = document.querySelector('.sb-anatomy__stage');
    if (!st) return 'no stage';
    const up = [];
    for (let e = st; e && up.length < 14; e = e.parentElement) { const c = getComputedStyle(e); up.push(`${e.tagName}.${(typeof e.className === 'string' ? e.className : '').split(' ').slice(0, 2).join('.')} w${Math.round(e.getBoundingClientRect().width)} d=${c.display} minw=${c.minWidth} ov=${c.overflowX}`); }
    const down = [];
    const walk = (e, d) => { if (d > 7 || down.length > 40) return; const w = Math.round(e.getBoundingClientRect().width); if (w > 300) { const c = getComputedStyle(e); down.push(`${'  '.repeat(d)}${e.tagName}.${(typeof e.className === 'string' ? e.className : e.getAttribute('class') || '').split(' ').slice(0, 2).join('.')} w${w} d=${c.display} minw=${c.minWidth} attrW=${e.getAttribute('width') || ''}`); } for (const k of e.children) walk(k, d + 1); };
    walk(st, 0);
    return { sw: document.documentElement.scrollWidth, up, down, boxes: [...document.querySelectorAll('.sb-anatomy__box')].map((x) => x.getAttribute('style')) };
  });
  console.log('PROBE chart', JSON.stringify(r, null, 1));
  await b2.close(); sb.close();
}
