// The patterns and blocks an app copies (src/patterns/, src/blocks/), ready for `npx serupa-add` (bin/serupa-add.mjs)
// to write into a project: each one's source with its imports pointed at the package instead of this repository's
// folders, and the blocks it builds on with it. Only the ones that use the package's public API alone are offered;
// one that reaches into src/internal/ for something the package doesn't export is left out, and named in `left`.
// The build writes dist/templates.json.
import fs from 'node:fs';
import path from 'node:path';

const PKG = '@diki-stwn/serupa-ds';
// What patterns and blocks take from src/internal/ and src/material/ that the package exports too, by file.
const PUBLIC = {
  'internal/provider': { from: PKG, names: ['useLocale', 'SerupaProvider', 'useSerupa'] },
  'internal/announce': { from: PKG, names: ['announce', 'announcePage'] },
  'internal/viewTransition': { from: PKG, names: ['withViewTransition'] },
  'internal/formatFileSize': { from: PKG, names: ['formatFileSize'] },
  'internal/fileKind': { from: PKG, names: ['attachmentKind'] },
};
const KINDS = { patterns: 'pattern', blocks: 'block' };

/** A template's import lines turned into the package's, and what it needs: its blocks, its own files, and anything not public. */
export function rewrite(code) {
  const blocks = new Set(), local = new Set(), missing = [];
  const out = code.replace(/^import (type )?([\s\S]*?) from '([^']+)';$/gm, (line, type, what, from) => {
    let m;
    if ((m = /^\.\.\/\.\.\/components\/\w+\/\w+$/.exec(from))) return `import ${type ?? ''}${what} from '${PKG}';`;
    if ((m = /^(?:\.\.\/\.\.\/blocks|\.\.)\/(\w+)\/\1$/.exec(from))) { blocks.add(m[1]); return `import ${type ?? ''}${what} from './${m[1]}';`; }
    if ((m = /^\.\/(\w+)$/.exec(from))) { local.add(m[1]); return line; }
    if ((m = /^\.\.\/\.\.\/((?:internal|material)\/\w+)$/.exec(from))) {
      const pub = PUBLIC[m[1]];
      const names = what.replace(/[{}]/g, '').split(',').map((n) => n.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0]).filter(Boolean);
      const not = names.filter((n) => !pub || !pub.names.includes(n));
      if (not.length) { missing.push(...not.map((n) => `${n} (${m[1]})`)); return line; }
      return `import ${type ?? ''}${what} from '${pub.from}';`;
    }
    if (from.startsWith('.')) missing.push(from);
    return line;
  });
  // Several imports from the package stay as separate lines: an editor or lint --fix merges them if the app wants.
  return { code: out, blocks: [...blocks], local: [...local], missing };
}

/** The first paragraph of a template's docs page, after its title. */
const summaryOf = (mdx) => ((/^# .*\n+([^\n<#`|][^\n]*)/m.exec(mdx) || [])[1] ?? '').trim();

/**
 * Every pattern and block, with its files rewritten, or the reason it's left out.
 * @param {string} root the repository
 */
export function templates(root) {
  const all = {};
  for (const [dir, kind] of Object.entries(KINDS)) {
    const base = path.join(root, 'src', dir);
    for (const name of fs.readdirSync(base).filter((n) => fs.statSync(path.join(base, n)).isDirectory()).sort()) {
      const folder = path.join(base, name);
      const sources = fs.readdirSync(folder).filter((f) => /\.tsx?$/.test(f) && !/\.(stories|test)\.tsx?$/.test(f));
      if (!sources.includes(`${name}.tsx`)) continue;
      const files = {}, blocks = new Set(), missing = [];
      for (const f of sources) {
        const r = rewrite(fs.readFileSync(path.join(folder, f), 'utf8'));
        files[f] = r.code;
        r.blocks.forEach((b) => blocks.add(b));
        missing.push(...r.missing);
      }
      const mdx = path.join(folder, `${name}.mdx`);
      all[name] = { name, kind, summary: fs.existsSync(mdx) ? summaryOf(fs.readFileSync(mdx, 'utf8')) : '', files, blocks: [...blocks].sort(), missing };
    }
  }
  // A template is offered when it and every block it needs, all the way down, use only what the package exports.
  const needs = (name, seen = new Set()) => { if (seen.has(name)) return seen; seen.add(name); for (const b of all[name]?.blocks ?? []) needs(b, seen); return seen; };
  const offered = [], left = [];
  for (const t of Object.values(all)) {
    const tree = [...needs(t.name)];
    const why = tree.flatMap((n) => (all[n] ? all[n].missing.map((x) => `${n}: ${x}`) : [`${n}: not found`]));
    if (why.length) left.push({ name: t.name, why });
    else offered.push({ name: t.name, kind: t.kind, summary: t.summary, files: t.files, needs: tree.filter((n) => n !== t.name).sort() });
  }
  return { templates: offered, left };
}
