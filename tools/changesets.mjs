// Reads a changeset (.changeset/*.md): its bump for the package and its notes. Shared by tools/changeset-check.mjs
// (the pull request check) and tools/version.mjs (the release), so the check fails on exactly the files the release
// would stop on, instead of passing a changeset the release then can't read.
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

/** { bump, body } for a changeset's text, or { error } saying what's wrong with it. */
export function parseChangeset(text, name) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!m) return { error: 'no front matter (a --- block naming the bump)' };
  // 15.0.0 scoped the name (@diki-stwn/serupa-ds): a changeset written for serupa-ds still counts.
  const names = [name, name.replace(/^@[^/]+\//, '')].map(escape).join('|');
  const bump = (new RegExp(`^\\s*["']?(?:${names})["']?\\s*:\\s*(major|minor|patch)\\s*$`, 'm').exec(m[1]) || [])[1];
  if (!bump) return { error: `no bump for ${name} ("${name}": major, minor or patch)` };
  return { bump, body: m[2] };
}

// A changeset's body as changelog entries: each "- " line is one (its indented lines go with it), and text with no
// bullets is one. A lead sentence followed by bullets is one entry with the bullets nested under it, so "Four
// mistakes now warn…" keeps its four cases rather than filing each as a change of its own (GR195).
// Prose lines join into one, but a fenced code block keeps its lines, set under the entry's bullet: joined, a
// changeset's example became one inline code 1,143px wide on the Changelog page.
const joined = (text) => text.split(/(^```[\s\S]*?^```)/m)
  .map((part, i) => (i % 2 ? `\n\n${part}\n\n` : part.trim().replace(/\n+/g, ' ')))
  .join('').trim().replace(/\n{3,}/g, '\n\n')
  .split('\n').map((l, i) => (i && l ? `  ${l}` : l)).join('\n');

export function entriesOf(raw) {
  const body = raw.trim();
  if (!/^- /m.test(body)) return [joined(body)];
  const [first, ...rest] = body.split(/\n(?=- )/);
  if (/^- /.test(first)) return [first, ...rest].map((e) => e.replace(/^- /, ''));
  return [`${joined(first)}\n${rest.map((e) => e.trim().split('\n').map((l) => `  ${l}`).join('\n')).join('\n')}`];
}
