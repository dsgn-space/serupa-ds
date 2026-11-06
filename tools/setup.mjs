// Gets a fresh machine (a cloud session, a new laptop) ready for `npm run check`, with whatever Node is already there:
//   node tools/setup.mjs            the Node major devEngines asks for, then npm ci, then Playwright's Chromium
//   node tools/setup.mjs --no-ci    leave node_modules as it is
// Then put the Node it names first on PATH (it prints the export line) and run the checks.
// - Node: when the one running this is older than devEngines in package.json, the newest release of that major from
//   nodejs.org goes to ~/.local/node-v<version>-<platform>-<arch>.
// - Chromium: the revision node_modules/playwright-core/browsers.json pins, when it isn't in PLAYWRIGHT_BROWSERS_PATH
//   (or ~/.cache/ms-playwright), from Chrome for Testing on storage.googleapis.com, so it works where Playwright's own
//   download host is blocked. Laid out as `npx playwright install chromium` would, so Playwright finds it.
// Linux and macOS, x64 and arm64. It never writes outside ~/.local and the browsers folder.
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const P = path.resolve(import.meta.dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(P, 'package.json'), 'utf8'));
const want = Number(/(\d+)/.exec(pkg.devEngines?.runtime?.version || '')?.[1] || 0);
const plat = { linux: 'linux', darwin: 'darwin' }[process.platform];
const arch = { x64: 'x64', arm64: 'arm64' }[process.arch];
if (!plat || !arch) { console.error(`tools/setup.mjs knows Linux and macOS on x64 and arm64, not ${process.platform}-${process.arch}.`); process.exit(2); }

/** @type {(url: string, to: string) => Promise<void>} */
async function download(url, to) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  fs.writeFileSync(to, Buffer.from(await res.arrayBuffer()));
}
if (spawnSync('unzip', ['-v'], { stdio: 'ignore' }).error) { console.error('tools/setup.mjs needs unzip (apt-get install unzip) to unpack Chromium.'); process.exit(2); }
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-setup-'));
/** @type {(cmd: string, args: string[], opts?: import('node:child_process').ExecFileSyncOptions) => void} */
const sh = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: 'inherit', ...opts });

// 1. Node
let nodeBin = path.dirname(process.execPath);
if (Number(process.versions.node.split('.')[0]) < want) {
  const index = await (await fetch('https://nodejs.org/dist/index.json')).json();
  const version = index.map((/** @type {{ version: string }} */ d) => d.version).find((v) => v.startsWith(`v${want}.`));
  if (!version) { console.error(`nodejs.org has no Node ${want} release.`); process.exit(1); }
  const name = `node-${version}-${plat}-${arch}`;
  const dir = path.join(os.homedir(), '.local', name);
  if (!fs.existsSync(path.join(dir, 'bin', 'node'))) {
    console.log(`Node ${version} → ${dir}`);
    fs.mkdirSync(path.dirname(dir), { recursive: true });
    const tar = path.join(tmp, `${name}.tar.gz`);
    await download(`https://nodejs.org/dist/${version}/${name}.tar.gz`, tar);
    sh('tar', ['xzf', tar, '-C', path.dirname(dir)]);
  } else console.log(`Node ${version} is already in ${dir}`);
  nodeBin = path.join(dir, 'bin');
} else console.log(`Node ${process.versions.node} is new enough (devEngines asks for ${want}).`);
const env = { ...process.env, PATH: `${nodeBin}${path.delimiter}${process.env.PATH}` };

// 2. Dependencies, with that Node's npm
if (!process.argv.includes('--no-ci')) sh(path.join(nodeBin, 'npm'), ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: P, env });

// 3. Chromium, the revision this Playwright pins
const browsers = JSON.parse(fs.readFileSync(path.join(P, 'node_modules/playwright-core/browsers.json'), 'utf8')).browsers;
const root = process.env.PLAYWRIGHT_BROWSERS_PATH || (plat === 'darwin' ? path.join(os.homedir(), 'Library/Caches/ms-playwright') : path.join(os.homedir(), '.cache/ms-playwright'));
const cft = { linux: 'linux64', darwin: arch === 'arm64' ? 'mac-arm64' : 'mac-x64' }[plat];
for (const [name, dirName, zip] of [['chromium', 'chromium', 'chrome'], ['chromium-headless-shell', 'chromium_headless_shell', 'chrome-headless-shell']]) {
  const b = browsers.find((/** @type {{ name: string }} */ x) => x.name === name);
  if (!b) continue;
  const dir = path.join(root, `${dirName}-${b.revision}`);
  if (fs.existsSync(path.join(dir, 'INSTALLATION_COMPLETE'))) { console.log(`${name} ${b.revision} is already in ${dir}`); continue; }
  console.log(`${name} ${b.revision} (Chrome for Testing ${b.browserVersion}) → ${dir}`);
  const file = path.join(tmp, `${zip}-${cft}.zip`);
  await download(`https://storage.googleapis.com/chrome-for-testing-public/${b.browserVersion}/${cft}/${zip}-${cft}.zip`, file);
  fs.mkdirSync(dir, { recursive: true });
  sh('unzip', ['-qo', file, '-d', dir]);
  // Playwright looks for chrome-linux64/ and chrome-headless-shell-linux64/ on Linux; on macOS its folder names differ.
  if (plat === 'darwin') {
    const got = path.join(dir, `${zip}-${cft}`);
    const expect = path.join(dir, name === 'chromium' ? `chrome-${cft}` : `chrome-headless-shell-${cft}`);
    if (got !== expect && fs.existsSync(got)) fs.renameSync(got, expect);
  }
  fs.writeFileSync(path.join(dir, 'INSTALLATION_COMPLETE'), '');
  fs.writeFileSync(path.join(dir, 'DEPENDENCIES_VALIDATED'), '');
}
fs.rmSync(tmp, { recursive: true, force: true });

console.log(`\nReady. In this shell:\n  export PATH="${nodeBin}:$PATH"\nthen: npm run check -- --clean --since origin/main --report local-checks.md`);
