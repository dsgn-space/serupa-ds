// Screenshots in the release notes (94): the stories whose look changed since the last release, before and after,
// from the visual baselines (tools/test/baseline-visual/), in the first theme at rest. tools/publish.mjs adds them
// under the CHANGELOG.md notes, so a release page shows what changed on screen, not only in words. The pictures are
// the files at each tag, linked through github.com so they show to whoever can see the repository.
import path from 'node:path';

const DIR = 'tools/test/baseline-visual/';
const SHOT = /-blue-light-rest\.png$/;

/** The highest vX.Y.Z tag below `version` (prereleases left out), or null. */
export function previousTag(tags, version) {
  const parse = (v) => /^v?(\d+)\.(\d+)\.(\d+)$/.exec(v)?.slice(1).map(Number);
  const below = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
  const me = parse(version);
  if (!me) return null;
  const older = tags.map((t) => [t, parse(t)]).filter(([, v]) => v && below(v, me) < 0).sort((a, b) => below(b[1], a[1]));
  return older[0]?.[0] ?? null;
}

/** Markdown for the stories whose screenshot changed or is new. `status` is git diff --name-status's output. */
export function screenshotNotes({ status, prev, tag, repo, max = 12 }) {
  const rows = status.split('\n').map((l) => l.split('\t')).filter(([s, f]) => /^[AM]$/.test(s) && f?.startsWith(DIR) && SHOT.test(f));
  if (!rows.length) return '';
  const url = (ref, f) => `https://github.com/${repo}/blob/${ref}/${f}?raw=true`;
  const name = (f) => { const [c, file] = f.slice(DIR.length).split('/'); return `${c} / ${path.basename(file).replace(SHOT, '')}`; };
  const img = (ref, f, when) => `<img src="${url(ref, f)}" width="360" alt="${name(f)}, ${when}">`;
  const changed = rows.filter(([s]) => s === 'M'), added = rows.filter(([s]) => s === 'A');
  const out = ['### On screen', '', `The stories that look different, in Blue Light at rest: before (${prev}) and after (${tag}).`, ''];
  if (changed.length) {
    out.push('| Story | Before | After |', '| --- | --- | --- |');
    for (const [, f] of changed.slice(0, max)) out.push(`| ${name(f)} | ${img(prev, f, prev)} | ${img(tag, f, tag)} |`);
    if (changed.length > max) out.push('', `And ${changed.length - max} more: ${changed.slice(max).map(([, f]) => name(f)).join(', ')}.`);
    out.push('');
  }
  if (added.length) {
    out.push('New stories:', '');
    for (const [, f] of added.slice(0, max)) out.push(`- ${name(f)}<br>${img(tag, f, tag)}`);
    if (added.length > max) out.push(`- And ${added.length - max} more: ${added.slice(max).map(([, f]) => name(f)).join(', ')}.`);
    out.push('');
  }
  return out.join('\n');
}
