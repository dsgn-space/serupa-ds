// What a change to the public API does to a project that already uses it, read from two copies of the API baseline
// (tools/test/baseline-api/, one .d.ts per component, which tools/test/api.mjs writes from dist/index.d.ts).
//   node tools/api-diff.mjs <ref>            the report: what changed between <ref>'s baseline and this checkout's
//   node tools/api-diff.mjs v14.0.0 v15.0.0  the same between two refs (a release's API against another's)
// changeset-check.mjs uses it to decide the smallest bump, and writes the report to the run's summary page.
//
// An alpha or beta component (@alpha, @beta on its export) may change its API in a minor release, so its breaking
// changes are listed apart and ask for a minor, said in the changeset.
// Breaking (a major): an export, a prop or a member goes away; a prop or option becomes required, or a new one is
// required; a value a prop or a type accepts goes away ("ghost" no longer a variant); an Omit<> leaves out more of
// the element's own props. Additive (a minor): an export, a member or an accepted value is added. Anything else
// (a type rewritten, a function's parameters) is "changed": it needs a minor and a look, since the text alone
// can't tell a narrowing from a widening.
//
// It reads the baseline as text, with no dependencies, so the Changeset workflow runs it without npm ci. The
// baseline is TypeScript's own printing (4-space indent, one member a line, unions sorted), which keeps that simple.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { statusIn } from './build/registry.mjs';

/** The export list on a baseline file's first line, without the `type ` marks. */
export const exportsIn = (text) => new Set((/^\/\/ exports: (.*)$/m.exec(text ?? '') || [])[1]?.split(', ').filter(Boolean).map((e) => e.replace(/^type /, '')) ?? []);

// A top-level statement starts at column 0; the lines under it are indented or close a bracket.
function statements(text) {
  const out = [];
  for (const line of (text ?? '').split('\n')) {
    if (!line || line.startsWith('//')) continue;
    if (/^[\s})\]]/.test(line) && out.length) out[out.length - 1] += '\n' + line;
    else out.push(line);
  }
  return out;
}

// Splits at a separator outside brackets and quotes.
function splitTop(s, sep) {
  const parts = [];
  let depth = 0, quote = null, start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'" || c === '`') quote = c;
    else if ('([{<'.includes(c)) depth++;
    else if (')]}>'.includes(c) && !(c === '>' && s[i - 1] === '=')) depth--;
    else if (depth === 0 && s.startsWith(sep, i)) { parts.push(s.slice(start, i)); start = i + sep.length; }
  }
  parts.push(s.slice(start));
  return parts.map((p) => p.trim()).filter(Boolean);
}

// `((x) => void) | undefined` and `(x) => void` are the same optional callback.
const unwrap = (p) => (p.startsWith('(') && splitTop(p, '|').length === 1 && closes(p) === p.length - 1 ? unwrap(p.slice(1, -1).trim()) : p);
const closes = (p) => { let d = 0; for (let i = 0; i < p.length; i++) { if (p[i] === '(') d++; else if (p[i] === ')' && --d === 0) return i; } return -1; };
const union = (type) => new Set(splitTop(unwrap(type.replace(/\s+/g, ' ')), '|').map(unwrap).filter((p) => p !== 'undefined'));
const literal = (p) => /^(["'`]).*\1$|^-?\d+(\.\d+)?$|^(true|false|null)$/.test(p);
// Values a type accepts that the other doesn't, when the type is a union of literals (sizes, variants, tones).
// A literal that went into a wider type (`"a" | "b"` to `string`) is still accepted.
function lostLiterals(was, now) {
  const [a, b] = [union(was), union(now)];
  if (b.has('string') || b.has('any') || b.has('unknown')) return [];
  return [...a].filter((p) => literal(p) && !b.has(p));
}

const KIND = /^(?:export )?(?:declare )?(interface|type|function|const|class|enum|namespace|global)\b\s*([\w$]*)/;
// A member: one line at the interface's indent (4 spaces), with the deeper lines under it.
function members(body) {
  const out = new Map();
  let last = null;
  for (const line of body.split('\n').slice(1)) {
    if (/^ {4}[^\s})\]]/.test(line)) {
      const m = /^ {4}(?:readonly\s+)?("[^"]+"|'[^']+'|\[[^\]]+\]|[\w$]+)(\?)?\s*([:(<])/.exec(line);
      if (!m) { last = null; continue; }
      const key = m[1].replace(/^["']|["']$/g, '');
      const text = line.slice(4);
      // A method can have overloads: the same key on several lines.
      const prev = out.get(key);
      last = { key, optional: !!m[2], method: m[3] !== ':', text: prev ? `${prev.text}\n${text}` : text };
      out.set(key, last);
    } else if (last && /^ {5,}|^ {4}[})\]]/.test(line)) {
      last.text += '\n' + line.trim();
    }
  }
  for (const m of out.values()) m.type = m.method ? m.text : m.text.replace(/^[^:]*?:\s*/, '').replace(/;$/, '');
  return out;
}

// The keys an `extends … Omit<React.…Attributes<…>, "a" | "b">` leaves out of the element's own props. An Omit of one
// of the package's own props (SearchInput's Omit<InputProps, …>) is left to "changed": the key may be new there.
const omitted = (head) => new Set([...head.matchAll(/Omit<React\.[\w.]+(?:<[^>]*>)?,\s*([^>]+)>/g)].flatMap((m) => [...union(m[1])].filter(literal)));
// Props and options are what a project passes in: a new required one breaks it. What the package hands back (a
// parsed phone number, a toast's history) can gain required members freely.
// Labels are passed in part (labels={{ close: 'Tutup' }}), so a new label is never required of a project.
const INPUT = /(Props|Options|Config|Settings|Theme|Item|Step|Column|Option|Preset|Mark|Swatch|Source|Messages)$/;
const same = (x, y) => x === y || (union(x).size === union(y).size && [...union(x)].every((p) => union(y).has(p)));
// A type alias's right-hand side: after the first top-level `=` (not one in `<C = "a">`).
const rhs = (s) => { const [, ...rest] = splitTop(s.replace(/;\s*$/, ''), ' = '); return rest.join(' = '); };

function declarations(text) {
  const map = new Map();
  for (const st of statements(text)) {
    const m = KIND.exec(st);
    if (!m || !m[2]) continue;
    const key = `${m[1] === 'interface' || m[1] === 'type' ? m[1] : 'value'} ${m[2]}`;
    map.set(key, map.has(key) ? `${map.get(key)}\n${st}` : st);
  }
  return map;
}

/** Compares one baseline file's two versions. Returns { breaking, additive, changed }, each a list of short lines. */
export function diffApi(was, now, file = '') {
  const r = { breaking: [], additive: [], changed: [] };
  const at = file ? ` (${file})` : '';
  const [ea, eb] = [exportsIn(was), exportsIn(now)];
  for (const e of ea) if (!eb.has(e)) r.breaking.push(`${e}: no longer exported${at}`);
  for (const e of eb) if (!ea.has(e)) r.additive.push(`${e}: new export${at}`);
  const [da, db] = [declarations(was), declarations(now)];
  for (const [key, a] of da) {
    const b = db.get(key);
    const name = key.split(' ')[1];
    if (b === undefined) {
      // Gone from the file: when it was exported the export line above says so; when it wasn't, it was only a part of
      // something exported (ButtonOwnProps), which shows there.
      if (!ea.has(name)) r.changed.push(`${name}: removed or renamed (not exported itself)${at}`);
      continue;
    }
    if (a === b) continue;
    if (key.startsWith('interface ')) {
      const input = INPUT.test(name.replace(/<.*$/, ''));
      const [ma, mb] = [members(a), members(b)];
      for (const [k, x] of ma) {
        const y = mb.get(k);
        if (!y) { r.breaking.push(`${name}.${k}: removed${at}`); continue; }
        if (input && x.optional && !y.optional) r.breaking.push(`${name}.${k}: now required${at}`);
        if (same(x.type, y.type)) continue;
        const lost = x.method ? [] : lostLiterals(x.type, y.type);
        if (lost.length && input) r.breaking.push(`${name}.${k}: no longer accepts ${lost.join(', ')}${at}`);
        else if (!x.method && [...union(x.type)].every((p) => union(y.type).has(p))) r.additive.push(`${name}.${k}: also accepts ${[...union(y.type)].filter((p) => !union(x.type).has(p)).join(', ')}${at}`);
        else r.changed.push(`${name}.${k}: type changed, from ${x.type.replace(/\s+/g, ' ').slice(0, 80)} to ${y.type.replace(/\s+/g, ' ').slice(0, 80)}${at}`);
      }
      for (const [k, y] of mb) {
        if (ma.has(k)) continue;
        if (input && !y.optional && !y.method) r.breaking.push(`${name}.${k}: new and required${at}`);
        else r.additive.push(`${name}.${k}: new${at}`);
      }
      const [ha, hb] = [a.split('\n')[0], b.split('\n')[0]];
      if (ha !== hb) {
        // A key Omit<> now leaves out that the interface declares itself is a prop of its own, not a lost one.
        const more = [...omitted(hb)].filter((k) => !omitted(ha).has(k) && !mb.has(k.slice(1, -1)));
        if (more.length) r.breaking.push(`${name}: no longer takes the element's own ${more.join(', ')}${at}`);
        else r.changed.push(`${name}: what it extends changed${at}`);
      }
    } else if (key.startsWith('type ')) {
      const body = rhs;
      if (same(body(a), body(b))) continue;
      const lost = lostLiterals(body(a), body(b));
      if (lost.length) r.breaking.push(`${name}: no longer includes ${lost.join(', ')}${at}`);
      else if ([...union(body(a))].every((p) => union(body(b)).has(p))) r.additive.push(`${name}: now also ${[...union(body(b))].filter((p) => !union(body(a)).has(p)).join(', ')}${at}`);
      else r.changed.push(`${name}: type changed${at}`);
    } else {
      r.changed.push(`${name}: signature changed${at}`);
    }
  }
  return r;
}

/** The smallest bump a diff needs. */
export const bumpFor = (r) => (r.breaking.length ? 'major' : r.unstable?.length || r.additive.length || r.changed.length ? 'minor' : 'patch');

/** The report, as Markdown for a run's summary page. */
export function reportOf(r, title = 'Public API') {
  if (!r.breaking.length && !r.unstable?.length && !r.additive.length && !r.changed.length) return `### ${title}\n\nNo change to the exported types.\n`;
  const list = (h, l) => (l.length ? `\n**${h}** (${l.length})\n\n${l.map((x) => `- ${x.replace(/[<>]/g, (c) => (c === '<' ? '&lt;' : '&gt;'))}`).join('\n')}\n` : '');
  return `### ${title}: needs a ${bumpFor(r)}\n${list('Breaking: a project using these may stop compiling', r.breaking)}${list('Breaking, in an alpha or beta component (a minor: say so in the changeset)', r.unstable ?? [])}${list('Added', r.additive)}${list('Changed: check whether code that compiled still does', r.changed)}`;
}

/** Every baseline file that differs between two refs (null: this checkout), merged into one diff. */
export function diffRefs(base, head = null, cwd = path.resolve(import.meta.dirname, '..')) {
  const DIR = 'tools/test/baseline-api';
  const git = (...a) => execFileSync('git', a, { cwd, encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'] });
  const list = (ref) => (ref ? git('ls-tree', '--name-only', ref, '--', `${DIR}/`).split('\n').filter((f) => f.endsWith('.d.ts')).map((f) => path.basename(f)) : fs.existsSync(path.join(cwd, DIR)) ? fs.readdirSync(path.join(cwd, DIR)).filter((f) => f.endsWith('.d.ts')) : []);
  const read = (ref, f) => (ref ? git('show', `${ref}:${DIR}/${f}`) : fs.readFileSync(path.join(cwd, DIR, f), 'utf8'));
  const [fa, fb] = [new Set(list(base)), new Set(list(head))];
  const r = { breaking: [], unstable: [], additive: [], changed: [] };
  for (const f of [...new Set([...fa, ...fb])].sort()) {
    const [a, b] = [fa.has(f) ? read(base, f) : '', fb.has(f) ? read(head, f) : ''];
    if (a === b) continue;
    const name = f.replace(/\.d\.ts$/, '');
    const d = diffApi(a, b, name);
    // The status it had before the change: a component that leaves beta in the same change still had beta's terms.
    const source = (ref) => { try { return ref ? git('show', `${ref}:src/components/${name}/${name}.tsx`) : fs.readFileSync(path.join(cwd, 'src', 'components', name, `${name}.tsx`), 'utf8'); } catch { return ''; } };
    const status = statusIn(source(base), name);
    if (status === 'alpha' || status === 'beta') { r.unstable.push(...d.breaking.map((l) => `${l}, ${status}`)); d.breaking = []; }
    for (const k of ['breaking', 'additive', 'changed']) r[k].push(...d[k]);
  }
  // A name that moved from one component's file to another's (or to _core) isn't gone: it's still exported.
  const exported = new Set([...fb].flatMap((f) => [...exportsIn(read(head, f))]));
  const moved = (line) => / no longer exported /.test(line) && exported.has(line.split(':')[0]);
  const added = new Set([...fa].flatMap((f) => [...exportsIn(read(base, f))]));
  r.breaking = r.breaking.filter((l) => !moved(l));
  r.additive = r.additive.filter((l) => !(/: new export /.test(l) && added.has(l.split(':')[0])));
  return r;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const [base, head] = process.argv.slice(2);
  if (!base) { console.error('usage: node tools/api-diff.mjs <base ref> [<head ref>]'); process.exit(2); }
  console.log(reportOf(diffRefs(base, head ?? null), `Public API since ${base}`));
}
