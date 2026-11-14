#!/usr/bin/env node
// Look up Serupa's docs from the installed release, for coding agents and people: a component's guide or one part of
// it, the skill's topics (install, theme, rules, accessibility), and search across components, topics and tokens.
// It reads dist/docs.json, which the build writes from the same guides Storybook shows, so it answers for the version
// the project pinned, offline, where the web would answer for main.
//
// usage:  npx serupa-docs [<Component> [<section>] | <topic> | topics | search <words...>] [--json]
//
//   npx serupa-docs                    every component, by group, with what it's for
//   npx serupa-docs Button             Button's whole guide
//   npx serupa-docs Button props       one section of it (props, keyboard, accessibility, "when not to use", ...)
//   npx serupa-docs snackbar           a component's other name finds it (Toast)
//   npx serupa-docs topics             the skill's topics; npx serupa-docs theme prints one
//   npx serupa-docs search date range  components, topics and tokens that match every word, best first
//
// --json prints the same answer as JSON. A name it doesn't know prints the closest matches and exits 1.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const USAGE = 'usage: serupa-docs [<Component> [<section>] | <topic> | topics | search <words...>] [--json]';
const lower = (s) => s.toLowerCase();

/** A guide's ## and ### sections, each with its heading and text up to the next heading of the same or a higher level. */
export function sections(guide) {
  const lines = guide.split('\n'), out = [];
  let fence = false;
  lines.forEach((line, i) => {
    if (/^```/.test(line)) fence = !fence;
    const m = !fence && /^(#{2,3}) (.+)/.exec(line);
    if (!m) return;
    let end = lines.length, inFence = false;
    for (let j = i + 1; j < lines.length; j++) {
      if (/^```/.test(lines[j])) inFence = !inFence;
      const h = !inFence && /^(#{1,3}) /.exec(lines[j]);
      if (h && h[1].length <= m[1].length) { end = j; break; }
    }
    out.push({ title: m[2].trim(), text: lines.slice(i, end).join('\n').trimEnd() + '\n' });
  });
  return out;
}

/** The section a word names: the same title, then one that starts with it, then one that has it. */
export function findSection(guide, words) {
  const want = lower(words.join(' '));
  const all = sections(guide), t = (s) => lower(s.title);
  return all.find((s) => t(s) === want) || all.find((s) => t(s).startsWith(want)) || all.find((s) => t(s).includes(want));
}

/** A component by its name or another name it's known by (snackbar: Toast), or a topic by its title's first word. */
export function find(data, word) {
  const w = lower(word);
  const component = data.components.find((c) => lower(c.name) === w) || data.components.find((c) => c.also.some((a) => lower(a) === w));
  if (component) return { component };
  const topic = data.topics.find((t) => lower(t.name) === w) || data.topics.find((t) => lower(t.name).split(/[\s:]/)[0] === w);
  return topic ? { topic } : {};
}

/** Components, topics and tokens that have every word, best first: in the name, then the summary, then anywhere. */
export function search(data, words) {
  const ws = words.map(lower).filter(Boolean);
  if (!ws.length) return [];
  const score = (fields) => {
    let total = 0;
    for (const w of ws) {
      const hit = fields.findIndex((f) => lower(f).includes(w));
      if (hit < 0) return -1;
      total += [10, 4, 1][Math.min(hit, 2)];
    }
    return total;
  };
  const hits = [
    ...data.components.map((c) => ({ kind: 'component', name: c.name, about: c.summary, score: score([[c.name, ...c.also].join(' '), c.summary, c.guide]) })),
    ...data.topics.map((t) => ({ kind: 'topic', name: t.name, about: (/\n\n?([^\n#`].*)/.exec(t.text) || [])[1] ?? '', score: score([t.name, '', t.text]) })),
    ...data.tokens.map((t) => ({ kind: 'token', name: t.name, about: t.description, score: score([t.name, t.description]) })),
  ];
  return hits.filter((h) => h.score >= 0).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).map(({ score: _, ...h }) => h);
}

/** How many single-letter edits turn a into b (Buton: Button is 1). */
export function distance(a, b) {
  let row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) next[j] = Math.min(row[j] + 1, next[j - 1] + 1, row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    row = next;
  }
  return row[b.length];
}

/** Every component under its group, A to Z, with what it's for. */
export function index(data) {
  const groups = {};
  for (const c of data.components) (groups[c.group] ||= []).push(c);
  return `Serupa ${data.version}: ${data.components.length} components. npx serupa-docs <Component> for one; npx serupa-docs topics for install, theme and rules.\n\n`
    + Object.keys(groups).sort().map((g) => `${g}\n${groups[g].map((c) => `  ${c.name}${c.status === 'stable' ? '' : ` (${c.status})`}: ${c.summary}`).join('\n')}\n`).join('\n');
}

/** The answer to argv: what to print, to which stream, and the exit code. */
export function answer(data, argv) {
  const json = argv.includes('--json');
  const args = argv.filter((a) => a !== '--json');
  const out = (text, value) => ({ code: 0, stdout: json ? JSON.stringify(value, null, 1) + '\n' : text });
  if (!args.length) return out(index(data), data.components.map(({ guide: _, ...c }) => c));
  if (lower(args[0]) === 'topics') return out(data.topics.map((t) => `${t.name}\n`).join('') + '\nnpx serupa-docs <topic> prints one (its first word is enough).\n', data.topics.map((t) => t.name));
  if (lower(args[0]) === 'search') {
    const hits = search(data, args.slice(1));
    if (!args.slice(1).length) return { code: 2, stderr: `serupa-docs: search needs words\n${USAGE}\n` };
    return out(hits.length ? hits.slice(0, 25).map((h) => `${h.kind.padEnd(9)} ${h.name}: ${h.about}`).join('\n') + '\n' : 'Nothing matches every word. Try fewer.\n', hits);
  }
  const { component, topic } = find(data, args[0]);
  if (topic && args.length === 1) return out(topic.text, topic);
  if (component) {
    if (args.length === 1) return out(component.guide, component);
    const section = findSection(component.guide, args.slice(1));
    if (section) return out(section.text, { component: component.name, ...section });
    const titles = sections(component.guide).map((s) => s.title);
    return { code: 1, stderr: `serupa-docs: ${component.name}'s guide has no section "${args.slice(1).join(' ')}". It has: ${titles.join(', ')}\n` };
  }
  // A misspelt name first (Buton: Button), then what mentions the word.
  const typo = data.components.filter((c) => distance(lower(args[0]), lower(c.name)) <= 2).map((c) => c.name);
  const near = [...new Set([...typo, ...search(data, [args[0]]).map((h) => h.name)])].slice(0, 5);
  return { code: 1, stderr: `serupa-docs: no component or topic "${args[0]}".${near.length ? ` Closest: ${near.join(', ')}.` : ''} npx serupa-docs lists them all.\n` };
}

function main(argv) {
  if (argv.includes('-h') || argv.includes('--help')) { console.log(USAGE); return 0; }
  const unknown = argv.find((a) => a.startsWith('-') && a !== '--json');
  if (unknown) { console.error(`serupa-docs: unknown option ${unknown}\n${USAGE}`); return 2; }
  const file = fileURLToPath(new URL('../dist/docs.json', import.meta.url));
  if (!fs.existsSync(file)) { console.error('serupa-docs: dist/docs.json is missing. Install a release (it comes built), or run npm run build in the repository.'); return 1; }
  const r = answer(JSON.parse(fs.readFileSync(file, 'utf8')), argv);
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  return r.code;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
