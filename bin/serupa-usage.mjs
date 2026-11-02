#!/usr/bin/env node
// How a product uses Serupa (34): which components it renders, how often, in how many files and with which props;
// which components it never uses; and the plain HTML elements it writes where a component would do (a <button> where
// Button would give the focus ring, loading state and theme). For adoption numbers across products (126) and for
// deciding what to improve next from what is used most (164).
//
// usage:  npx serupa-usage <source files or folders...> [--json]
//
// It reads JavaScript and TypeScript sources (.js .jsx .ts .tsx .mjs .cjs .mts .cts, and .mdx), skipping node_modules,
// dist and build output. A component counts where it is imported from "serupa-ds" (named, renamed, or as a namespace:
// <S.Button>) or taken from window.Serupa, and then written as a JSX tag. --json prints the same numbers as JSON.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXT = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.mts', '.cts', '.mdx'];
const SKIP = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', 'storybook-static'];
// Plain elements a component stands in for, and which.
export const NATIVE = {
  button: 'Button', a: 'Link', input: 'Input', select: 'Select', textarea: 'Textarea', dialog: 'Dialog',
  table: 'Table', img: 'Image', progress: 'Progress', meter: 'Meter', details: 'Accordion', h1: 'Heading',
  h2: 'Heading', h3: 'Heading', h4: 'Heading', h5: 'Heading', h6: 'Heading', kbd: 'Kbd', hr: 'Divider',
};

function* sources(p) {
  const st = fs.statSync(p);
  if (st.isFile()) { yield p; return; }
  for (const e of fs.readdirSync(p, { withFileTypes: true })) {
    const f = path.join(p, e.name);
    if (e.isDirectory()) { if (!SKIP.includes(e.name)) yield* sources(f); } else if (e.isFile() && EXT.some((x) => e.name.endsWith(x))) yield f;
  }
}

/** The local names that stand for Serupa exports in one source: { local: export } and the namespace names. */
export function bindings(code) {
  const named = new Map();
  const spaces = new Set();
  const list = (body) => {
    for (const part of body.split(',')) {
      const m = part.trim().replace(/^type\s+/, '').match(/^([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/);
      if (m && !/^type\s/.test(part.trim())) named.set(m[2] ?? m[1], m[1]);
    }
  };
  for (const m of code.matchAll(/import\s+(?!type\b)([^;]*?)\s+from\s*["']serupa-ds["']/g)) {
    const spec = m[1];
    const braces = spec.match(/\{([^}]*)\}/);
    if (braces) list(braces[1]);
    const ns = spec.match(/\*\s+as\s+([A-Za-z_$][\w$]*)/);
    if (ns) spaces.add(ns[1]);
  }
  // const { Button, Card: Box } = window.Serupa (a plain page) or = Serupa
  for (const m of code.matchAll(/(?:const|let|var)\s*\{([^}]*)\}\s*=\s*(?:window\.)?Serupa\b/g)) list(m[1].replace(/:\s*/g, ' as '));
  if (/\bwindow\.Serupa\b/.test(code)) spaces.add('window.Serupa');
  return { named, spaces };
}

// The text of a JSX opening tag from its "<" to the ">" that ends it, past braces and quotes in its props.
function tagText(code, start) {
  let depth = 0, q = null;
  for (let i = start + 1; i < code.length; i++) {
    const ch = code[i];
    if (q) { if (ch === '\\') i++; else if (ch === q) q = null; continue; }
    if (depth === 0 && (ch === '"' || ch === "'")) q = ch;
    else if (ch === '`') q = '`';
    else if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (ch === '>' && depth === 0) return code.slice(start, i + 1);
  }
  return code.slice(start);
}

// The prop names in an opening tag: names at brace depth 0, after the tag name.
function props(tag) {
  const out = [];
  let depth = 0, q = null, word = '';
  const body = tag.replace(/^<[\w.$]+/, '');
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (q) { if (ch === '\\') i++; else if (ch === q) q = null; continue; }
    if (ch === '{') { depth++; word = ''; continue; }
    if (ch === '}') { depth--; continue; }
    if (depth) continue;
    if (ch === '"' || ch === "'") { q = ch; word = ''; continue; }
    if (/[\w-]/.test(ch)) { word += ch; continue; }
    if (word && /^[A-Za-z]/.test(word) && (ch === '=' || /[\s/>]/.test(ch))) out.push(word);
    word = '';
  }
  return out;
}

/**
 * The usage numbers for some sources.
 * @param {{ file: string, code: string }[]} files
 * @param {Record<string, { exports: string[] }>} components  dist/components.json's components
 */
export function usage(files, components) {
  const owner = new Map();
  for (const [name, c] of Object.entries(components)) for (const e of c.exports) owner.set(e, name);
  const used = new Map();   // export -> { uses, files: Set, props: Map }
  const native = new Map(); // element -> { uses, files: Set }
  let importing = 0;
  for (const { file, code } of files) {
    const { named, spaces } = bindings(code);
    const jsx = /\.(jsx|tsx|mdx)$/.test(file) || /<[A-Za-z][\w.]*[\s/>]/.test(code);
    if (named.size || spaces.size) importing++;
    for (const m of code.matchAll(/<([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)(?=[\s/>])/g)) {
      const tag = m[1];
      let name = null;
      if (named.has(tag)) name = named.get(tag);
      else if (tag.includes('.')) {
        const at = tag.lastIndexOf('.');
        if (spaces.has(tag.slice(0, at))) name = tag.slice(at + 1);
      }
      if (name && owner.has(name)) {
        const u = used.get(name) ?? { uses: 0, files: new Set(), props: new Map() };
        u.uses++; u.files.add(file);
        for (const p of props(tagText(code, m.index))) u.props.set(p, (u.props.get(p) ?? 0) + 1);
        used.set(name, u);
      } else if (jsx && Object.hasOwn(NATIVE, tag)) {
        const n = native.get(tag) ?? { uses: 0, files: new Set() };
        n.uses++; n.files.add(file);
        native.set(tag, n);
      }
    }
  }
  const rendered = new Set([...used.keys()].map((e) => owner.get(e)));
  return {
    files: files.length,
    importing,
    exports: [...used].map(([name, u]) => ({ name, component: owner.get(name), uses: u.uses, files: u.files.size, props: Object.fromEntries([...u.props].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) }))
      .sort((a, b) => b.uses - a.uses || a.name.localeCompare(b.name)),
    unused: Object.keys(components).filter((c) => !rendered.has(c)).sort(),
    native: [...native].map(([element, n]) => ({ element, instead: NATIVE[element], uses: n.uses, files: n.files.size }))
      .sort((a, b) => b.uses - a.uses || a.element.localeCompare(b.element)),
  };
}

function print(r, total) {
  const pad = (s, n) => String(s).padEnd(n);
  const lines = [`${r.files} source files, ${r.importing} of them use Serupa. ${total - r.unused.length} of ${total} components rendered.`, ''];
  if (r.exports.length) {
    const w = Math.max(9, ...r.exports.map((e) => e.name.length)) + 2;
    lines.push(`${pad('Component', w)}${pad('Uses', 7)}${pad('Files', 7)}Props`);
    for (const e of r.exports) lines.push(`${pad(e.name, w)}${pad(e.uses, 7)}${pad(e.files, 7)}${Object.entries(e.props).map(([p, n]) => `${p} ${n}`).join(', ')}`);
    lines.push('');
  }
  if (r.native.length) {
    lines.push('Plain elements a component covers:');
    for (const n of r.native) lines.push(`  <${n.element}> ${n.uses} in ${n.files} file${n.files === 1 ? '' : 's'}: ${n.instead}`);
    lines.push('');
  }
  if (r.unused.length) lines.push(`Not used (${r.unused.length}): ${r.unused.join(', ')}`);
  return lines.join('\n');
}

function main(argv) {
  const json = argv.includes('--json');
  const paths = argv.filter((a) => a !== '--json');
  if (!paths.length) { console.error('usage: serupa-usage <source files or folders...> [--json]'); return 2; }
  const missing = paths.filter((p) => !fs.existsSync(p));
  if (missing.length) { console.error(`Not found: ${missing.join(', ')}`); return 2; }
  const list = fs.readFileSync(fileURLToPath(new URL('../dist/components.json', import.meta.url)), 'utf8');
  const { components } = JSON.parse(list);
  const files = paths.flatMap((p) => [...sources(p)]).map((file) => ({ file: path.relative(process.cwd(), file) || file, code: fs.readFileSync(file, 'utf8') }));
  const r = usage(files, components);
  console.log(json ? JSON.stringify(r, null, 2) : print(r, Object.keys(components).length));
  return 0;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
