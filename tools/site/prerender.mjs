// Draws each page of the built site ahead of time, into its HTML (tools/site/host.mjs writes the files): a visitor sees
// the page's text before any script has run, a phone on a slow network in about a second rather than once some 700 KB
// of scripts have arrived, and a crawler reads it all. The site's own code draws it (site/src/server.tsx), built a
// second time for Node, and the browser takes the page over (site/src/main.tsx) rather than drawing it again.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Each path's page as HTML, to go inside <div id="root">, and each frame's (/frame/<page>--<story>) that the site
 * draws ahead of time (site/src/server.tsx's frames).
 * @param {string} configFile the site's Vite config
 * @param {string} mode the build's mode
 * @param {string[]} paths
 * @returns {Promise<Map<string, string>>}
 */
export async function drawPages(configFile, mode, paths) {
  const { build } = await import('vite');
  // Inside the project, so the drawn code finds React and the rest in its node_modules.
  const root = path.join(path.dirname(configFile), '..', '..');
  fs.mkdirSync(path.join(root, 'node_modules'), { recursive: true });
  const out = fs.mkdtempSync(path.join(root, 'node_modules', '.serupa-site-server-'));
  try {
    await build({
      configFile, mode, logLevel: 'warn',
      build: { ssr: path.join(root, 'site', 'src', 'server.tsx'), outDir: out, emptyOutDir: true, copyPublicDir: false },
    });
    const entry = fs.readdirSync(out).find((f) => /^server\.m?js$/.test(f));
    if (!entry) throw new Error(`the site's server build wrote no server.js (${fs.readdirSync(out).join(', ')})`);
    /** @type {{ render: (path: string) => Promise<string>, frames: () => Promise<string[]> }} */
    const server = await import(pathToFileURL(path.join(out, entry)).href);
    const drawn = new Map();
    for (const p of [...paths, ...await server.frames()]) drawn.set(p, await server.render(p));
    return drawn;
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
}
