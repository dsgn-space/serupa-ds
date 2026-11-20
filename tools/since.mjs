// "Added in" and "changed in" for each component's docs page (AX6): docs/since.json says, for every component with
// an API baseline (tools/test/baseline-api/<Name>.d.ts), the release it first shipped in, the last release that
// changed its API, and the release that brought each prop added since the baselines began (10.0.0). A reader on 14.x
// can tell whether a prop exists for them.
//   node tools/since.mjs --release <version>   what tools/version.mjs runs: whatever is new or changed in the API
//                                              baselines since docs/since.json was written belongs to <version>
//   node tools/since.mjs --seed                rebuilds the file from the release tags (needs the git history)
// --release needs nothing but Node and the files, so the Release workflow's version job can run it. A prop that
// was there when the component's tracking began has no version of its own: it came with the component.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const P = path.resolve(import.meta.dirname, '..');
const API = path.join(P, 'tools', 'test', 'baseline-api');
export const FILE = path.join(P, 'docs', 'since.json');

// Not props a reader sets: the names the old component() wrapper declared (13.0.0 to 16.x), and ref, which every component takes as a prop.
const PLUMBING = new Set(['displayName', 'ref', '$$typeof']);
/** The member names a .d.ts declares: each `name:` or `name?:` at the start of a line inside a type. */
export function propsOf(dts) {
  const out = new Set();
  for (const [, name] of dts.matchAll(/^\s+(?:readonly\s+)?([A-Za-z_$][\w$]*)\??:/gm)) if (!PLUMBING.has(name)) out.add(name);
  return [...out].sort();
}
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);

/** One component's entry, moved on to a release: a new component is added in it; a changed API is changed in it,
 * and each prop it didn't have before arrives in it. */
export function advance(entry, dts, version) {
  if (!entry) return { added: version, changed: null, api: hash(dts), props: {} };
  if (entry.api === hash(dts)) return entry;
  const known = new Set([...(entry.known || []), ...Object.keys(entry.props)]);
  const props = { ...entry.props };
  for (const p of propsOf(dts)) if (!known.has(p)) props[p] = version;
  return { ...entry, changed: version, api: hash(dts), props, known: propsOf(dts).filter((p) => !(p in props)) };
}

function write(data) {
  const sorted = Object.fromEntries(Object.keys(data).sort().map((k) => [k, data[k]]));
  fs.writeFileSync(FILE, JSON.stringify(sorted, null, 1) + '\n');
}

function release(version) {
  const data = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : {};
  for (const f of fs.readdirSync(API).filter((x) => /^[A-Z]\w*\.d\.ts$/.test(x))) {
    const name = f.slice(0, -5);
    data[name] = advance(data[name], fs.readFileSync(path.join(API, f), 'utf8'), version);
  }
  write(data);
}

function seed() {
  const git = (...a) => execFileSync('git', a, { cwd: P, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const tags = git('tag', '--list', 'v*').split('\n').filter((t) => /^v\d+\.\d+\.\d+$/.test(t))
    .sort((a, b) => { const x = a.slice(1).split('.').map(Number), y = b.slice(1).split('.').map(Number); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; });
  if (!tags.length) throw new Error('no release tags: fetch them (git fetch --tags --unshallow) first');
  const data = {};
  const first = {};   // the first release each component's source is in
  for (const tag of tags) {
    const files = git('ls-tree', '-r', '--name-only', tag).split('\n');
    for (const f of files) {
      const m = /^src\/(?:components|patterns)\/([A-Z]\w*)\/\1\.tsx$/.exec(f);
      if (m && !(m[1] in first)) first[m[1]] = tag === tags[0] ? null : tag.slice(1);
    }
    // The baselines settled into their present form with 10.0.0; before it they don't say which props were new.
    const baselines = Number(tag.slice(1).split('.')[0]) < 10 ? [] : files.filter((f) => /^tools\/test\/baseline-api\/[A-Z]\w*\.d\.ts$/.test(f));
    for (const f of baselines) {
      const name = path.basename(f, '.d.ts');
      const dts = git('show', `${tag}:${f}`);
      // A baseline seen for the first time: the props it has came with the component (or with the baselines).
      if (!data[name]) { data[name] = { added: first[name] ?? null, changed: null, api: hash(dts), props: {}, known: propsOf(dts) }; continue; }
      data[name] = advance(data[name], dts, tag.slice(1));
    }
  }
  // What main has that no release has yet stays out: the next --release stamps it.
  write(data);
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  const i = process.argv.indexOf('--release');
  if (i > 0 && process.argv[i + 1]) release(process.argv[i + 1]);
  else if (process.argv.includes('--seed')) seed();
  else { console.error('usage: node tools/since.mjs --release <version> | --seed'); process.exit(2); }
}
