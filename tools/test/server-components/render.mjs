// Renders the package's server components the way React Server Components runs them, for tools/test/package.mjs:
//   node --conditions=react-server tools/test/server-components/render.mjs <dist dir>
// With the react-server condition, react is React's server build: no useState, useEffect or createContext. A module
// that starts with "use client" is never run on the server, only referred to, so here it's replaced by references
// too (what a framework's bundler does). Every other component module is imported and each component in it is
// called with children; what one renders may name a client component, as long as it doesn't call into one.
// Prints one JSON line: { server: [names rendered], helpers: {…}, errors: [...] }.
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DIST = path.resolve(process.argv[2]);
const JS = path.join(DIST, 'js');
const isClient = (file) => /^\s*["']use client["']/.test(fs.readFileSync(file, 'utf8'));
registerHooks({
  load(url, context, next) {
    if (url.startsWith('file:') && url.endsWith('.js')) {
      const file = fileURLToPath(url);
      if (file.startsWith(JS + path.sep) && isClient(file)) {
        const names = [...(/export \{([^}]*)\};?\s*(\/\/#.*)?\s*$/.exec(fs.readFileSync(file, 'utf8'))?.[1] || '').matchAll(/(?:\w+ as )?(\w+)/g)].map((m) => m[1]);
        const source = names.map((n) => `export const ${n} = { $$typeof: Symbol.for('react.client.reference'), $$id: ${JSON.stringify(path.relative(JS, file) + '#' + n)} };`).join('\n');
        return { format: 'module', source, shortCircuit: true };
      }
    }
    return next(url, context);
  },
});

const React = await import('react');
const out = { server: [], client: [], helpers: {}, errors: [] };
const files = fs.readdirSync(path.join(JS, 'components'), { recursive: true }).map(String).filter((f) => f.endsWith('.js')).map((f) => path.join(JS, 'components', f));
for (const file of files) {
  const rel = path.relative(JS, file);
  if (isClient(file)) { out.client.push(rel); continue; }
  let mod;
  try { mod = await import(pathToFileURL(file).href); } catch (e) { out.errors.push(`${rel}: ${e.message}`); continue; }
  for (const [name, c] of Object.entries(mod)) {
    if (!/^[A-Z]/.test(name)) continue;
    const render = c && c.$$typeof === Symbol.for('react.forward_ref') ? (p) => c.render(p, null) : typeof c === 'function' ? c : null;
    if (!render) continue;
    try { render({ children: 'x' }); out.server.push(name); } catch (e) { out.errors.push(`${name} (${rel}): ${e.message}`); }
  }
}
// The helpers a Server Component calls, through the package's own entry (its client modules stay references).
try {
  const D = await import(pathToFileURL(path.join(DIST, 'index.js')).href);
  out.helpers = { buttonClass: D.buttonClass({ variant: 'outline' }), paginationRange: D.paginationRange(5, 10).join(' '), formatFileSize: D.formatFileSize(1536), initials: D.initials('Ada Lovelace'), version: D.version };
} catch (e) { out.errors.push(`index.js: ${e.message}`); }
void React;
console.log(JSON.stringify(out));
