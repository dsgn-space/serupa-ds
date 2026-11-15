#!/usr/bin/env node
// Add a ready-made screen or section to an app: a pattern (Dashboard, Sign in, Settings form, Team members, ...) or a
// block (Page header, Pricing, Stats row, ...), as source the app owns and changes. Each comes with the blocks it
// builds on, its imports pointed at the package, from the release the project installed (dist/templates.json, which
// the build writes from src/patterns/ and src/blocks/). The Storybook pages show each one working.
//
// usage:  npx serupa-add [<Name>...] [--to <folder>] [--force] [--json]
//
//   npx serupa-add                       every pattern and block, with what it's for
//   npx serupa-add Dashboard             src/serupa/Dashboard.tsx, with ActivityFeed, EmptyStates, PageHeader, StatsRow
//   npx serupa-add sign-in --to app/ui   any spelling of the name; another folder
//
// A file already there with other content is left alone (the app may have changed it) and the command exits 1,
// unless --force. The same content again is fine. --json prints the list, or what was written, as JSON.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const USAGE = 'usage: serupa-add [<Name>...] [--to <folder>] [--force] [--json]';
const key = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** The template a name means: Dashboard, dashboard, sign-in and SignIn all find theirs. */
export function find(list, name) {
  return list.find((t) => key(t.name) === key(name));
}

/** Every file the names bring, their blocks included, by file name; or the names it doesn't know. */
export function plan(list, names) {
  const unknown = names.filter((n) => !find(list, n));
  if (unknown.length) return { unknown };
  const files = {};
  for (const t of names.map((n) => find(list, n))) for (const n of [t.name, ...t.needs]) Object.assign(files, find(list, n).files);
  return { files };
}

/** What writing those files into the folder would do to each: write it, keep it (the same already), or refuse (different). */
export function sort(files, folder, force = false) {
  return Object.entries(files).map(([file, text]) => {
    const at = path.join(folder, file);
    const now = fs.existsSync(at) ? fs.readFileSync(at, 'utf8') : null;
    return { file, at, text, act: now === null || (force && now !== text) ? 'write' : now === text ? 'same' : 'refuse' };
  });
}

/** The list, by kind, with what each is for. */
export function listing(data) {
  const kinds = [['pattern', 'Patterns: whole screens and flows'], ['block', 'Blocks: sections a screen is made of']];
  return kinds.map(([k, title]) => `${title}\n${data.templates.filter((t) => t.kind === k).map((t) => `  ${t.name}: ${t.summary}${t.needs.length ? ` (with ${t.needs.join(', ')})` : ''}`).join('\n')}\n`).join('\n')
    + '\nnpx serupa-add <Name> writes it into src/serupa/ (--to for another folder).\n';
}

function main(argv) {
  if (argv.includes('-h') || argv.includes('--help')) { console.log(USAGE); return 0; }
  let to = 'src/serupa', force = false, json = false;
  const names = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--to') { to = argv[++i]; if (!to || to.startsWith('-')) { console.error(`serupa-add: --to needs a folder\n${USAGE}`); return 2; } }
    else if (a === '--force') force = true;
    else if (a === '--json') json = true;
    else if (a.startsWith('-')) { console.error(`serupa-add: unknown option ${a}\n${USAGE}`); return 2; }
    else names.push(a);
  }
  const file = fileURLToPath(new URL('../dist/templates.json', import.meta.url));
  if (!fs.existsSync(file)) { console.error('serupa-add: dist/templates.json is missing. Install a release (it comes built), or run npm run build in the repository.'); return 1; }
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!names.length) { process.stdout.write(json ? JSON.stringify(data.templates.map(({ files: _, ...t }) => t), null, 1) + '\n' : listing(data)); return 0; }
  const p = plan(data.templates, names);
  if (p.unknown) {
    console.error(`serupa-add: no pattern or block called ${p.unknown.join(', ')}. npx serupa-add lists them all.`);
    return 1;
  }
  const acts = sort(p.files, to, force);
  const refused = acts.filter((a) => a.act === 'refuse');
  if (refused.length) {
    console.error(`serupa-add: ${refused.map((a) => a.at).join(', ')} already there with other content, so nothing was written. --force replaces ${refused.length === 1 ? 'it' : 'them'}.`);
    return 1;
  }
  fs.mkdirSync(to, { recursive: true });
  for (const a of acts) if (a.act === 'write') fs.writeFileSync(a.at, a.text);
  const added = names.map((n) => find(data.templates, n).name);
  if (json) process.stdout.write(JSON.stringify(acts.map(({ text: _, ...a }) => a), null, 1) + '\n');
  else console.log(`${acts.map((a) => `${a.act === 'write' ? 'wrote' : 'kept '} ${a.at}`).join('\n')}\n\nImport ${added.join(', ')} from ${added.map((n) => path.join(to, `${n}.tsx`)).join(', ')}. Its Storybook page shows it working.`);
  return 0;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
