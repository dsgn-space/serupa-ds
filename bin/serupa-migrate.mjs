#!/usr/bin/env node
// Apply a major version's renames to a project's code (205, I8).
//
// usage:  npx serupa-migrate <source files or folders...> [--from <version>] [--write] [--list]
//
// Without --write it only says what it would change, file by file, so the first run changes nothing. --from names
// the version the project is on (12, 12.0.0, 11.4.2…) and runs the changes of every later major; without it, all of
// them run, which is safe: each one only touches the old name. --list prints the changes and the version of each.
//
// Each change is one breaking entry of the changelog that can be made without reading the code around it: a prop
// renamed on one component, a type or a file renamed. What a script can't decide (a removed token with nothing to
// put instead, a prop passed in an object rather than written on the tag) is listed at the end as file:line to
// check by hand. The upgrade guide (docs/Upgrading.mdx) lists every breaking entry, made here or not.
//
// It reads the text, without a parser, so it needs nothing installed: a tag is found from its name to the `>` that
// closes it, skipping what's inside {…} and quotes. It never touches node_modules, dist or build output.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ALL, migrate, transformsAfter } from './migrate/transforms.mjs';

export { migrate, TRANSFORMS, transformsAfter, renameProp, removeProp, openTags } from './migrate/transforms.mjs';
const SKIP = ['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', '.svelte-kit', 'storybook-static', 'coverage'];

// A linked folder is skipped (it may lead back up); a linked file is read.
function* files(p) {
  const st = fs.statSync(p);
  if (st.isFile()) { yield p; return; }
  for (const e of fs.readdirSync(p, { withFileTypes: true })) {
    const f = path.join(p, e.name);
    if (e.isDirectory()) { if (!SKIP.includes(e.name)) yield* files(f); }
    else if (ALL.includes(path.extname(e.name).toLowerCase()) && (e.isFile() || (e.isSymbolicLink() && fs.statSync(f, { throwIfNoEntry: false })?.isFile()))) yield f;
  }
}

const USAGE = 'usage: serupa-migrate <source files or folders...> [--from <version>] [--write] [--list]';
const major = (v) => Number(/^v?(\d+)/.exec(String(v))?.[1]);
const stop = (message) => { console.error(`serupa-migrate: ${message}\n${USAGE}`); process.exit(2); };

export function main(argv) {
  const sources = [];
  let from = null, write = false, list = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--write') write = true;
    else if (a === '--list') list = true;
    else if (a === '--from') {
      from = argv[++i];
      if (!from || from.startsWith('-')) stop('--from needs a version, such as --from 12');
      if (Number.isNaN(major(from))) stop(`--from takes a version, such as 12 or 12.0.0, not ${from}`);
    } else if (a === '-h' || a === '--help') { console.log(USAGE); return 0; }
    else if (a.startsWith('-')) stop(`unknown option ${a}`);
    else sources.push(a);
  }
  const transforms = transformsAfter(from);
  if (list) {
    for (const t of transforms) console.log(`${t.version.padEnd(7)} ${t.id.padEnd(24)} ${t.title.replace(/`/g, '')}`);
    return 0;
  }
  if (!sources.length) stop('no source files or folders given');
  for (const s of sources) if (!fs.existsSync(s)) stop(`no such file or folder: ${s}`);
  const total = {}, notes = [];
  let changed = 0;
  for (const s of sources) for (const f of files(s)) {
    const src = fs.readFileSync(f, 'utf8');
    const r = migrate(src, f, transforms);
    const rel = path.relative(process.cwd(), f) || f;
    for (const n of r.notes) notes.push(`${rel}:${n.line}: ${n.message} (${n.id})`);
    if (r.text === src) continue;
    changed++;
    for (const [k, v] of Object.entries(r.counts)) total[k] = (total[k] || 0) + v;
    console.log(`${write ? 'changed' : 'would change'} ${rel}: ${Object.entries(r.counts).map(([k, v]) => `${k} ×${v}`).join(', ')}`);
    if (write) fs.writeFileSync(f, r.text);
  }
  const what = Object.entries(total).map(([k, v]) => `${k} ×${v}`).join(', ');
  console.log(changed ? `${changed} file${changed === 1 ? '' : 's'} ${write ? 'changed' : 'to change'} (${what}).${write ? '' : ' Run again with --write to change them.'}` : 'Nothing to change.');
  if (notes.length) console.log(`\nTo check by hand (${notes.length}):\n${notes.join('\n')}`);
  return 0;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
