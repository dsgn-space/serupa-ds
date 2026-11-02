// The package in the frameworks the README names (86): a Next.js App Router app, a React Router framework app (what
// Remix became) and an Astro site with the React integration, each in tools/test/frameworks/<name>/. Each is copied
// into an empty folder, installs the package as a release ships it (packed, as consumer.mjs does) with the React the
// repository tests with, and runs its own production build. Then it checks the page that build serves:
//   - the server HTML has the components already rendered (the h1 Heading, and Button with its label), so they
//     rendered on the server, Button through its "use client" boundary in Next.js and as an island in Astro;
//   - theme.js is inline in <head>, whole and before the body, so the theme is set before the first paint;
//   - a stylesheet the page links holds the components' styles in Serupa's cascade layers;
//   - in the browser the page hydrates with no error or warning in the console (no hydration mismatch), theme.js
//     has set the theme on <html>, and Button is styled.
// Each app's framework version is pinned in its package.json; Dependabot doesn't see them, so move them by hand.
// Needs the build (npm run build), the network (npm install) and Node 26 (the frameworks' own engines), so the checks
// project skips it.
//   node tools/test/frameworks.mjs                 all three
//   node tools/test/frameworks.mjs next astro      some of them
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import { packShipped } from './pack.mjs';
import { browser } from './lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, '..', '..');
const APPS = path.join(HERE, 'frameworks');
const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT, 'package.json'), 'utf8'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const all = fs.readdirSync(APPS).filter((f) => fs.statSync(path.join(APPS, f)).isDirectory()).sort();
const asked = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const names = asked.length ? asked : all;
const unknown = names.filter((n) => !all.includes(n));
if (unknown.length) { console.log(`FAIL  no app named ${unknown.join(', ')} in tools/test/frameworks/ (${all.join(', ')})`); process.exit(1); }
if (!fs.existsSync(path.join(PROJECT, 'dist', 'index.js'))) { console.log('FAIL  nothing built: run npm run build first'); process.exit(1); }

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-frameworks-'));
const tarball = packShipped(PROJECT, tmp);
const theme = fs.readFileSync(path.join(PROJECT, 'dist', 'theme.js'), 'utf8');
const results = [];
const t = (app, name, ok, detail = '') => results.push({ name: `${app}: ${name}`, ok: !!ok, detail: String(detail) });
const npmRun = (args, cwd) => spawnSync(npm, args, { cwd, encoding: 'utf8', shell: process.platform === 'win32', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', ASTRO_TELEMETRY_DISABLED: '1' } });
const tail = (r) => (r.stdout + r.stderr).slice(-3000);

// Where a production build serves its page. Astro builds a static site, so dist/ is served as files; Next.js and
// React Router are started with their own start script.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function served(app, dir) {
  const port = String(4300 + names.indexOf(app));
  const base = `http://127.0.0.1:${port}`;
  const get = async (href) => (await fetch(new URL(href, base))).text();
  const dist = path.join(dir, 'dist');
  if (fs.existsSync(path.join(dist, 'index.html'))) {
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
    const server = http.createServer((req, res) => {
      const rel = decodeURIComponent(new URL(req.url, base).pathname).replace(/\/$/, '/index.html');
      const file = path.join(dist, path.normalize(rel));
      if (!file.startsWith(dist) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
      res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' }).end(fs.readFileSync(file));
    });
    await new Promise((r) => server.listen(Number(port), '127.0.0.1', r));
    return { base, html: await get('/'), get, stop: () => server.close() };
  }
  const child = spawn(npm, ['run', 'start'], { cwd: dir, env: { ...process.env, PORT: port, NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32', detached: process.platform !== 'win32' });
  let log = '';
  child.stdout.on('data', (d) => { log += d; });
  child.stderr.on('data', (d) => { log += d; });
  const stop = () => { try { process.kill(-child.pid, 'SIGTERM'); } catch { child.kill('SIGTERM'); } };
  for (let i = 0; i < 120; i++) {
    try {
      const res = await fetch(base + '/');
      if (res.ok) return { base, html: await res.text(), get, stop };
    } catch { /* not listening yet */ }
    await sleep(500);
  }
  stop();
  throw new Error(`the server didn't answer on ${base} within a minute:\n${log.slice(-2000)}`);
}

const br = await browser();
const dep = (name) => pkg.devDependencies?.[name] ?? pkg.peerDependencies[name];
for (const app of names) {
  const dir = path.join(tmp, app);
  fs.cpSync(path.join(APPS, app), dir, { recursive: true });
  const own = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
  own.dependencies = { ...own.dependencies, 'serupa-ds': `file:${tarball}`, react: dep('react'), 'react-dom': dep('react-dom') };
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(own, null, 2) + '\n');
  const installed = npmRun(['install', '--no-audit', '--no-fund'], dir);
  t(app, 'npm install', installed.status === 0, tail(installed));
  if (installed.status !== 0) continue;
  const built = npmRun(['run', 'build'], dir);
  t(app, 'npm run build', built.status === 0, tail(built));
  if (built.status !== 0) continue;
  let page;
  try { page = await served(app, dir); } catch (e) { t(app, 'the built page is served', false, e.message); continue; }
  try {
    const { html } = page;
    const body = html.indexOf('<body');
    const h1 = /<h1\b[^>]*>([^<]*)<\/h1>/.exec(html);
    t(app, 'the server HTML has the Heading rendered (an h1 with its text)', h1 && /^Serupa in /.test(h1[1]), h1 ? h1[0] : html.slice(0, 1500));
    const button = /<button\b[^>]*data-component="button"[^>]*>([\s\S]*?)<\/button>/.exec(html);
    t(app, 'the server HTML has Button rendered, with its label', button && button[1].includes('Save'), button ? button[0] : html.slice(0, 1500));
    const at = html.indexOf(theme.trim());
    t(app, 'theme.js is inline in <head>, whole and before the body', at > 0 && at < body, at < 0 ? 'not found whole in the page' : `at ${at}, body at ${body}`);
    const links = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].map((m) => /href="([^"]+)"/.exec(m[0])?.[1]).filter(Boolean);
    const inline = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
    const sheets = [...inline, ...(await Promise.all(links.map((h) => page.get(h).catch(() => ''))))];
    const has = sheets.some((s) => s.includes('.dk-button') && /@layer dk\b/.test(s));
    t(app, "a stylesheet on the page holds the components' styles in Serupa's layers", has, `${links.length} linked (${links.join(', ')}), ${inline.length} inline`);
    const tab = await br.newPage();
    const said = [];
    tab.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') said.push(`${m.type()}: ${m.text()}`); });
    tab.on('pageerror', (e) => said.push(`pageerror: ${e.message}`));
    await tab.goto(page.base + '/', { waitUntil: 'networkidle' });
    // Hydration is done once React has attached to Button: its DOM node gets React's own props key.
    const hydrated = await tab.waitForFunction(() => { const b = document.querySelector('button[data-component="button"]'); return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps')); }, null, { timeout: 15000 }).then(() => true, () => false);
    t(app, 'in the browser the page hydrates (Button is attached to React)', hydrated);
    t(app, 'in the browser nothing is logged as an error or warning (no hydration mismatch)', !said.length, said.join('\n'));
    const seen = await tab.evaluate(() => { const b = document.querySelector('button[data-component="button"]'); return { theme: document.documentElement.dataset.theme ?? '', bg: b ? getComputedStyle(b).backgroundColor : '' }; });
    t(app, 'in the browser theme.js has set the theme on <html>, and Button has its color', /^[a-z]+-(light|dark)$/.test(seen.theme) && seen.bg && seen.bg !== 'rgba(0, 0, 0, 0)', JSON.stringify(seen));
    await tab.close();
  } finally { page.stop(); }
}

await br.close();
fs.rmSync(tmp, { recursive: true, force: true });
for (const x of results) console.log(`${x.ok ? 'PASS' : 'FAIL'}  ${x.name}${x.ok || !x.detail ? '' : '\n      ' + x.detail.replace(/\n/g, '\n      ')}`);
const bad = results.filter((x) => !x.ok).length;
console.log(`\nFrameworks (${names.join(', ')}) on Node ${process.versions.node}: ${results.length - bad}/${results.length} passed`);
process.exit(bad || results.length < names.length * 9 ? 1 : 0);
