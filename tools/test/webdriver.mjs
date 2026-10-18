// A minimal W3C WebDriver client (no dependencies), for testing in browsers Playwright doesn't
// ship: real Safari (safaridriver), Firefox (geckodriver) and WebKitGTK (WebKitWebDriver).
import { spawn } from 'node:child_process';

export const ENGINES = {
  // Safari on macOS: run `safaridriver --enable` once (it asks for your password), then use --engine safari.
  safari: { cmd: 'safaridriver', args: (p) => ['-p', String(p)], caps: { browserName: 'safari' } },
  // Firefox: install geckodriver (github.com/mozilla/geckodriver) and Firefox.
  firefox: { cmd: 'geckodriver', args: (p) => ['--port', String(p)], caps: { browserName: 'firefox', 'moz:firefoxOptions': { args: ['-headless'] } } },
  // WebKitGTK on Linux (the engine Safari uses): apt install webkit2gtk-driver xvfb; needs a display (xvfb-run).
  webkitgtk: {
    cmd: 'WebKitWebDriver', args: (p) => [`--port=${p}`],
    caps: { 'webkitgtk:browserOptions': { binary: process.env.MINIBROWSER || '/usr/lib/x86_64-linux-gnu/webkit2gtk-4.1/MiniBrowser', args: ['--automation'] } },
  },
};

export async function startDriver(engine, port = 4444 + Math.floor(Math.random() * 500)) {
  const e = ENGINES[engine];
  if (!e) throw new Error(`Unknown engine "${engine}". Use one of: ${Object.keys(ENGINES).join(', ')}`);
  const proc = spawn(e.cmd, e.args(port), { stdio: 'ignore' });
  proc.on('error', () => {});
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 50; i++) {   // wait for the driver to listen
    try { const r = await fetch(base + '/status'); if (r.ok) break; } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  return { base, caps: e.caps, stop: () => proc.kill() };
}

export async function session(base, caps) {
  const call = async (method, path, body) => {
    const r = await fetch(base + path, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json();
    if (j.value && j.value.error) throw new Error(`${j.value.error}: ${j.value.message}`);
    return j.value;
  };
  const s = await call('POST', '/session', { capabilities: { alwaysMatch: caps } });
  const id = s.sessionId, p = (x) => `/session/${id}${x}`;
  const api = {
    name: `${s.capabilities.browserName} ${s.capabilities.browserVersion}`,
    goto: (url) => call('POST', p('/url'), { url }),
    // Runs fn(arg) in the page: fn is a real function, serialized like Playwright's evaluate.
    evaluate: (fn, arg) => call('POST', p('/execute/async'), { script: `const done = arguments[arguments.length - 1]; Promise.resolve((${fn.toString()})(arguments[0])).then(done, (e) => done({ __error: String(e && e.stack || e) }));`, args: [arg ?? null] })
      .then((v) => { if (v && v.__error) throw new Error(v.__error); return v; }),
    size: (width, height) => call('POST', p('/window/rect'), { width, height }),
    find: (css) => call('POST', p('/element'), { using: 'css selector', value: css }).then((e) => Object.values(e)[0]),
    click: async (css) => call('POST', p(`/element/${await api.find(css)}/click`), {}),
    type: async (css, text) => call('POST', p(`/element/${await api.find(css)}/value`), { text }),
    keys: (keys) => call('POST', p('/actions'), { actions: [{ type: 'key', id: 'kb', actions: [...keys].flatMap((k) => [{ type: 'keyDown', value: k }, { type: 'keyUp', value: k }]) }] }),
    quit: () => call('DELETE', p('')),
  };
  return api;
}

export const KEY = { Enter: '', Space: ' ', Tab: '' };
