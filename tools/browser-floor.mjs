// The oldest browsers the package supports, from package.json's browserslist: one place for the floor that
// tools/test/browser-baseline.mjs holds the CSS and script to, the README's "Browser support" names, and the nightly
// Floor run tests in.
//   node tools/browser-floor.mjs              print the floor
//   node tools/browser-floor.mjs --chromium   fetch Chrome for Testing at the floor's Chrome version (its headless
//                                             shell, into ~/.cache/serupa-ds/) and print its path, for SERUPA_CHROMIUM
// Only Chromium: Playwright drives an older Chrome over the DevTools protocol, but its Firefox and WebKit are builds
// patched for the Playwright release they come with, so the floor there is held by browser-baseline.mjs's data.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const NAMES = { chrome: 'chrome', edge: 'edge', safari: 'safari', firefox: 'firefox' };

/** { chrome, edge, safari, firefox } from browserslist queries of the form "chrome >= 123". Fails on any other form,
 * so the floor can't quietly become something this doesn't read. */
export function floorOf(pkg) {
  const list = pkg.browserslist;
  if (!Array.isArray(list) || !list.length) throw new Error('package.json has no browserslist');
  /** @type {Record<string, number>} */
  const out = {};
  for (const q of list) {
    const m = /^(\w+) >= (\d+(?:\.\d+)?)$/.exec(q.trim());
    if (!m) throw new Error(`package.json browserslist: "${q}" isn't "<browser> >= <version>"`);
    if (m[1] in NAMES) out[m[1]] = Number(m[2]);
  }
  for (const b of Object.keys(NAMES)) if (!(b in out)) throw new Error(`package.json browserslist names no ${b} version`);
  return /** @type {{ chrome: number, edge: number, safari: number, firefox: number }} */ (out);
}
export const floor = (root = ROOT) => floorOf(JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')));

// The last Chrome for Testing build of each milestone the floor may name (its listing isn't public, so they're
// written here; googlechromelabs.github.io/chrome-for-testing/latest-versions-per-milestone.json has them).
export const CHROME_BUILDS = {
  123: '123.0.6312.122', 124: '124.0.6367.207', 125: '125.0.6422.141', 126: '126.0.6478.182', 127: '127.0.6533.119',
  128: '128.0.6613.137', 129: '129.0.6668.100', 130: '130.0.6723.116',
};

async function chromium() {
  const v = /** @type {Record<number, string>} */ (CHROME_BUILDS)[floor().chrome];
  if (!v) throw new Error(`no Chrome for Testing build for Chrome ${floor().chrome}: add it to CHROME_BUILDS in tools/browser-floor.mjs`);
  const plat = process.platform === 'darwin' ? (process.arch === 'arm64' ? 'mac-arm64' : 'mac-x64') : 'linux64';
  const dir = path.join(os.homedir(), '.cache', 'serupa-ds', `chrome-headless-shell-${v}`);
  const bin = path.join(dir, `chrome-headless-shell-${plat}`, 'chrome-headless-shell');
  if (!fs.existsSync(bin)) {
    const res = await fetch(`https://storage.googleapis.com/chrome-for-testing-public/${v}/${plat}/chrome-headless-shell-${plat}.zip`);
    if (!res.ok) throw new Error(`Chrome for Testing ${v}: HTTP ${res.status}`);
    fs.mkdirSync(dir, { recursive: true });
    const zip = path.join(dir, 'shell.zip');
    fs.writeFileSync(zip, Buffer.from(await res.arrayBuffer()));
    execFileSync('unzip', ['-qo', zip, '-d', dir]);
    fs.rmSync(zip);
  }
  return bin;
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  if (process.argv.includes('--chromium')) console.log(await chromium());
  else { const f = floor(); console.log(`Chrome ${f.chrome}, Edge ${f.edge}, Safari ${f.safari}, Firefox ${f.firefox}`); }
}
